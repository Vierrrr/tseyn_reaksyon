export type PlayerId = number;

export type Cell = {
  orbs: number;
  owner: PlayerId | null;
};

export type Board = {
  rows: number;
  cols: number;
  cells: Cell[][];
};

export type GamePhase = 'playing' | 'won';

export type GameState = {
  board: Board;
  playerCount: number;
  currentPlayer: PlayerId;
  eliminated: boolean[];
  /** True once a player has had at least one orb on the board. */
  everHadOrbs: boolean[];
  /** True once each player has completed their first turn. */
  hasMoved: boolean[];
  phase: GamePhase;
  winner: PlayerId | null;
};
