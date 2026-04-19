import type { Player } from './GameState';
import type { DeckConfig } from './SettingsState';

export type CardTier = 'GREEN' | 'RED' | 'PURPLE';

export type CardId =
  | 'BOOST' | 'SHIELD' | 'REFLECT' | 'TRIBUTE'
  | 'SLIP' | 'KAMIKAZE' | 'MARKET_CRASH' | 'DUNGEON'
  | 'DUEL' | 'GODS_HAND' | 'SHADOW_STEP' | 'SWAP' | 'THE_WORLD';

export type BuffId = 'SHIELD' | 'REFLECT' | 'TRIBUTE' | 'DUNGEON' | 'FROZEN';

export interface Buff {
  id: BuffId;
  turnsRemaining: number;
  sourcePlayerId: string;
}

export interface CardDefinition {
  id: CardId;
  tier: CardTier;
  icon: string;
  nameKey: string;
  descKey: string;
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
  type: 'MOVE' | 'BUFF' | 'DEBUFF' | 'TELEPORT' | 'FREEZE' | 'DUEL' | 'DUNGEON' | 'SWAP';
  targetPlayerIds: string[];
  steps?: number;
  newPosition?: number;
  buff?: Buff;
  freezeTurns?: number;
  duelOpponentId?: string;
  swapTargetId?: string;
}
