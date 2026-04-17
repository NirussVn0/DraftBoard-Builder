import type { Tile } from './MapBuilderState';

export interface Player {
  id: string;
  name: string;
  color: string;
  position: number;
}

export type GamePhase = 'SETUP' | 'IDLE_TURN' | 'ROLLING_DICE' | 'MOVING_TOKEN' | 'EVALUATE_CELL' | 'EVENT_MYSTERY_ROLL' | 'VICTORY';

export interface GameState {
  phase: GamePhase;
  players: Player[];
  activePlayerIndex: number;
  winner: Player | null;
  diceValue: number;
  map: Tile[] | null;
}
