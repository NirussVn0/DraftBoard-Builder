import type { Player } from './GameState';
import type { DeckConfig } from './SettingsState';

export type CardTier = 'GREEN' | 'RED' | 'PURPLE';

export type CardId =
  | 'EUREKA' | 'LIFEBUOY' | 'COUNTER_ARGUMENT' | 'PARASITE'
  | 'MIND_BLANK' | 'DEADLINE_BOMB' | 'BLACKOUT' | 'DETENTION'
  | 'POP_QUIZ' | 'SUPERVISOR_HAND' | 'NINJA_COPY' | 'AMENOTEJIKARA' | 'ZA_WARUDO'
  | 'MYSTERY';

export type BuffId = 'LIFEBUOY' | 'COUNTER_ARGUMENT' | 'PARASITE' | 'DETENTION' | 'FROZEN';

export interface Buff {
  id: BuffId;
  turnsRemaining: number;
  sourcePlayerId: string;
}

export interface CardDefinition {
  id: CardId;
  tier: CardTier;
  icon: string;
  name: string;
  description: string;
  resolve: (ctx: CardContext) => CardResolution;
}

export interface CardContext {
  activePlayer: Player;
  allPlayers: Player[];
  activePlayerIndex: number;
  mapLength: number;
  deckConfig: DeckConfig;
}

export interface CardResolution {
  type: 'MOVE' | 'BUFF' | 'DEBUFF' | 'TELEPORT' | 'FREEZE' | 'QUIZ' | 'DETENTION' | 'SWAP';
  targetPlayerIds: string[];
  steps?: number;
  newPosition?: number;
  buff?: Buff;
  freezeTurns?: number;
  quizOpponentId?: string;
  swapTargetId?: string;
}
