export interface Player {
  id: string;
  name: string;
  color: string;
  position: number;
}

export type GamePhase = 'SETUP' | 'PLAYING' | 'VICTORY';

export interface GameState {
  phase: GamePhase;
  players: Player[];
  activePlayerIndex: number;
  winner: Player | null;
  diceValue: number;
  isAnimating: boolean;
}
