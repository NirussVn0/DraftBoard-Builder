import type { Tile } from './MapBuilderState';
import type { MapSettings } from './SettingsState';

export interface Player {
  id: string;
  name: string;
  color: string;
  position: number;
}

export type GamePhase =
  | 'SETUP'
  | 'IDLE_TURN'
  | 'ROLLING_DICE'
  | 'MOVING_TOKEN'
  | 'EVALUATE_CELL'
  | 'EVENT_MYSTERY_ROLL'
  | 'EVENT_KICK'
  | 'VICTORY';

export interface KickEvent {
  kickerPlayerId: string;
  kickedPlayerId: string;
  kickedFromPosition: number;
  kickedToPosition: number;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  activePlayerIndex: number;
  winner: Player | null;
  diceValue: number;
  map: Tile[] | null;
  mapSettings: MapSettings;
  kickEvent: KickEvent | null;
}
