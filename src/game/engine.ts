import type { Board, Cell, GameState, PlayerId } from './types';

export function criticalMass(row: number, col: number, rows: number, cols: number): number {
  let neighbors = 0;
  if (row > 0) neighbors++;
  if (row < rows - 1) neighbors++;
  if (col > 0) neighbors++;
  if (col < cols - 1) neighbors++;
  return neighbors;
}

export function isCellCritical(cell: Cell, row: number, col: number, rows: number, cols: number): boolean {
  if (cell.orbs <= 0 || cell.owner === null) return false;
  return cell.orbs === criticalMass(row, col, rows, cols) - 1;
}

function emptyBoard(rows: number, cols: number): Board {
  const cells: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({ orbs: 0, owner: null });
    }
    cells.push(row);
  }
  return { rows, cols, cells };
}

function cloneBoard(board: Board): Board {
  return {
    rows: board.rows,
    cols: board.cols,
    cells: board.cells.map((row) => row.map((cell) => ({ ...cell }))),
  };
}

function orbCountsByPlayer(board: Board, playerCount: number): number[] {
  const counts = Array.from({ length: playerCount }, () => 0);
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      const cell = board.cells[r][c];
      if (cell.owner !== null && cell.orbs > 0) {
        counts[cell.owner] += cell.orbs;
      }
    }
  }
  return counts;
}

export type OrbFlight = {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  owner: PlayerId;
  targetPrevOwner: PlayerId | null;
  targetPrevOrbs: number;
  isEat: boolean;
};

export type EatenCellInfo = {
  row: number;
  col: number;
  prevOwner: PlayerId;
  newOwner: PlayerId;
  count: number;
};

export type ExplosionFrame = {
  board: Board;
  boardAfterBurst: Board;
  exploded: { row: number; col: number }[];
  flights: OrbFlight[];
  eatenCells: EatenCellInfo[];
  hasEat: boolean;
  combo: number;
};

function resolveExplosionRound(
  board: Board,
  comboIndex: number,
): {
  exploded: { row: number; col: number }[];
  flights: OrbFlight[];
  boardAfterBurst: Board;
  eatenCells: EatenCellInfo[];
} {
  const { rows, cols, cells } = board;
  const exploded: { row: number; col: number }[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = cells[r][c];
      const limit = criticalMass(r, c, rows, cols);
      if (cell.orbs < limit || cell.owner === null) continue;
      exploded.push({ row: r, col: c });
    }
  }

  if (exploded.length === 0) {
    return {
      exploded: [],
      flights: [],
      boardAfterBurst: cloneBoard(board),
      eatenCells: [],
    };
  }

  // Snapshot before emptying to know who was in neighbor cells
  const prevBoard = cloneBoard(board);

  // Each exploding cell empties first; then all outgoing orbs are distributed.
  const transfers: {
    row: number;
    col: number;
    fromRow: number;
    fromCol: number;
    owner: PlayerId;
  }[] = [];

  for (const { row, col } of exploded) {
    const owner = cells[row][col].owner;
    if (owner === null) continue;
    cells[row][col].orbs = 0;
    cells[row][col].owner = null;
    if (row > 0) transfers.push({ row: row - 1, col, fromRow: row, fromCol: col, owner });
    if (row < rows - 1) transfers.push({ row: row + 1, col, fromRow: row, fromCol: col, owner });
    if (col > 0) transfers.push({ row, col: col - 1, fromRow: row, fromCol: col, owner });
    if (col < cols - 1) transfers.push({ row, col: col + 1, fromRow: row, fromCol: col, owner });
  }

  const boardAfterBurst = cloneBoard(board);

  const flights: OrbFlight[] = [];
  const eatenCellsMap = new Map<string, EatenCellInfo>();

  for (const { row, col, fromRow, fromCol, owner } of transfers) {
    const targetPrevCell = prevBoard.cells[row][col];
    const isEat =
      targetPrevCell.owner !== null &&
      targetPrevCell.owner !== owner &&
      targetPrevCell.orbs > 0;

    flights.push({
      fromRow,
      fromCol,
      toRow: row,
      toCol: col,
      owner,
      targetPrevOwner: targetPrevCell.owner,
      targetPrevOrbs: targetPrevCell.orbs,
      isEat,
    });

    if (isEat && targetPrevCell.owner !== null) {
      const key = `${row},${col}`;
      if (!eatenCellsMap.has(key)) {
        eatenCellsMap.set(key, {
          row,
          col,
          prevOwner: targetPrevCell.owner,
          newOwner: owner,
          count: targetPrevCell.orbs,
        });
      }
    }

    cells[row][col].orbs += 1;
    cells[row][col].owner = owner;
  }

  return {
    exploded,
    flights,
    boardAfterBurst,
    eatenCells: Array.from(eatenCellsMap.values()),
  };
}

export function resolveExplosionsWithFrames(board: Board): ExplosionFrame[] {
  const frames: ExplosionFrame[] = [];
  let combo = 1;

  while (true) {
    const round = resolveExplosionRound(board, combo);
    if (round.exploded.length === 0) break;
    frames.push({
      board: cloneBoard(board),
      boardAfterBurst: round.boardAfterBurst,
      exploded: round.exploded,
      flights: round.flights,
      eatenCells: round.eatenCells,
      hasEat: round.eatenCells.length > 0,
      combo,
    });
    combo++;
  }

  return frames;
}

function nextActivePlayer(state: GameState, from: PlayerId): PlayerId {
  for (let i = 1; i <= state.playerCount; i++) {
    const candidate = (from + i) % state.playerCount;
    if (!state.eliminated[candidate]) return candidate;
  }
  return from;
}

function updateEliminations(state: GameState): void {
  const counts = orbCountsByPlayer(state.board, state.playerCount);
  for (let p = 0; p < state.playerCount; p++) {
    if (counts[p] > 0) {
      state.everHadOrbs[p] = true;
    }
  }
  for (let p = 0; p < state.playerCount; p++) {
    if (state.everHadOrbs[p] && counts[p] === 0) {
      state.eliminated[p] = true;
    }
  }
}

function countActivePlayers(state: GameState): number {
  return state.eliminated.filter((e) => !e).length;
}

function findWinner(state: GameState): PlayerId | null {
  const counts = orbCountsByPlayer(state.board, state.playerCount);
  let winner: PlayerId | null = null;
  let withOrbs = 0;
  for (let p = 0; p < state.playerCount; p++) {
    if (state.eliminated[p]) continue;
    if (counts[p] > 0) {
      winner = p;
      withOrbs++;
    }
  }
  if (withOrbs === 1) return winner;
  if (countActivePlayers(state) === 1) {
    for (let p = 0; p < state.playerCount; p++) {
      if (!state.eliminated[p]) return p;
    }
  }
  return null;
}

export function createGame(rows: number, cols: number, playerCount: number): GameState {
  return {
    board: emptyBoard(rows, cols),
    playerCount,
    currentPlayer: 0,
    eliminated: Array.from({ length: playerCount }, () => false),
    everHadOrbs: Array.from({ length: playerCount }, () => false),
    hasMoved: Array.from({ length: playerCount }, () => false),
    phase: 'playing',
    winner: null,
  };
}

export function canPlace(state: GameState, row: number, col: number): boolean {
  if (state.phase !== 'playing') return false;
  if (state.eliminated[state.currentPlayer]) return false;

  const cell = state.board.cells[row]?.[col];
  if (!cell) return false;
  if (cell.orbs === 0) return true;
  return cell.owner === state.currentPlayer;
}

export type MoveResult = {
  state: GameState;
  explosionFrames: ExplosionFrame[];
};

function finalizeMove(state: GameState): GameState {
  state.hasMoved[state.currentPlayer] = true;
  updateEliminations(state);

  const winner = state.hasMoved.every(Boolean) ? findWinner(state) : null;
  if (winner !== null) {
    state.phase = 'won';
    state.winner = winner;
    return state;
  }

  state.currentPlayer = nextActivePlayer(state, state.currentPlayer);
  return state;
}

export function computeMove(state: GameState, row: number, col: number): MoveResult | null {
  if (!canPlace(state, row, col)) return null;

  const next: GameState = {
    ...state,
    board: cloneBoard(state.board),
    eliminated: [...state.eliminated],
    everHadOrbs: [...state.everHadOrbs],
    hasMoved: [...state.hasMoved],
  };

  const cell = next.board.cells[row][col];
  cell.orbs += 1;
  cell.owner = next.currentPlayer;

  const explosionFrames = resolveExplosionsWithFrames(next.board);
  finalizeMove(next);

  return { state: next, explosionFrames };
}

export function applyMove(state: GameState, row: number, col: number): GameState {
  return computeMove(state, row, col)?.state ?? state;
}
