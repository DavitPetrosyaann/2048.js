export type BoardState = number[][];

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type Theme = 'neon' | 'classic' | 'cyberpunk' | 'monochrome';

export type NumberStyle = 'arabic' | 'roman' | 'armenian';

export type Language = 'en' | 'hy' | 'ru';

export interface BoardSize {
  rows: number;
  cols: number;
}

export interface GameState {
  board: BoardState;
  score: number;
  gameOver: boolean;
  maxTile: number;
  erasers: number;
  multipliers: number;
  multiplierActive: boolean;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
  boardSize?: string;
}
