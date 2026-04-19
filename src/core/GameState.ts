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
  | 'EVENT_LIFEBUOY_BREAK'
  | 'EVENT_COUNTER'
  | 'EVENT_QUIZ'
  | 'EVENT_DETENTION_ROLL'
  | 'EVENT_FREEZE'
  | 'EVENT_MOVE_ANIMATION'
  | 'EVENT_TELEPORT_ANIMATION'
  | 'EVENT_SWAP_ANIMATION'
  | 'VICTORY';

export interface KickEvent {
  kickerPlayerId: string;
  kickedPlayerId: string;
  kickedFromPosition: number;
  kickedToPosition: number;
}

export interface QuizState {
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
  envMap: { id: string; x: number; y: number; emoji: string; }[];
  mapSettings: MapSettings;
  kickEvent: KickEvent | null;
  canUndo: boolean;

  currentCard: CardDefinition | null;
  currentResolution: CardResolution | null;
  quizState: QuizState | null;
  moveAnimation?: { playerId: string; path: number[] };
  teleportAnimation?: { playerId: string; position: number };
  swapAnimation?: { player1Id: string; player2Id: string };
  eventQueue: GameEvent[];
}
