import type { Tile } from './MapBuilderState';
import type { MapSettings } from './SettingsState';
import type { Buff, CardDefinition, CardResolution } from './CardTypes';
import type { GameEvent } from './GameEvent';

export interface Player {
  id: string;
  name: string;
  color: string;
  emoji: string;
  position: number;
  buffs: Buff[];
}

export type GamePhase =
  | 'SETUP'
  | 'IDLE_TURN'
  | 'ROLLING_DICE'
  | 'MOVING_TOKEN'
  | 'EVALUATE_CELL'
  | 'EVENT_DRAW_CARD'
  | 'EVENT_CARD_RESOLVE'
  | 'EVENT_CARD_ANIMATE'
  | 'EVENT_MYSTERY_ROLL'
  | 'EVENT_KICK'
  | 'EVENT_SHIELD_BREAK'
  | 'EVENT_REFLECT'
  | 'EVENT_DUEL'
  | 'EVENT_DUNGEON_ROLL'
  | 'EVENT_FREEZE'
  | 'VICTORY';

export interface KickEvent {
  kickerPlayerId: string;
  kickedPlayerId: string;
  kickedFromPosition: number;
  kickedToPosition: number;
}

export interface DuelState {
  challengerId: string;
  opponentId: string;
  phase: 'VS_SCREEN' | 'QUESTION' | 'WAITING_HOST' | 'RESOLVED';
  winnerId?: string;
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
  canUndo: boolean;

  currentCard: CardDefinition | null;
  currentResolution: CardResolution | null;
  duelState: DuelState | null;
  eventQueue: GameEvent[];
}
