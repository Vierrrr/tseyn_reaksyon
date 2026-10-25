export const PLAYER_COLORS = ['#E53935', '#1E88E5', '#43A047', '#FB8C00', '#9C5CDA'] as const;

export const PLAYER_NAMES = ['Red', 'Blue', 'Green', 'Orange', 'Purple'] as const;

export function playerColor(id: number): string {
  return PLAYER_COLORS[id] ?? '#888';
}

export function playerName(id: number, names?: readonly (string | undefined)[]): string {
  return names?.[id]?.trim() || PLAYER_NAMES[id] || `Player ${id + 1}`;
}
