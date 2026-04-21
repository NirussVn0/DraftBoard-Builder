import type { CardDefinition, CardResolution, Buff, BuffId, CardId } from './CardTypes';

export type GameEvent =
  | { type: 'TRIGGER_TILE_CARD'; cardId: CardId }
  | { type: 'RESOLVE_CARD'; card: CardDefinition; resolution: CardResolution }
  | { type: 'ANIMATE_PRECAST'; card: CardDefinition }
  | { type: 'ANIMATE_CARD'; card: CardDefinition; resolution: CardResolution }
  | { type: 'APPLY_BUFF'; targetId: string; buff: Buff }
  | { type: 'REMOVE_BUFF'; targetId: string; buffId: BuffId }
  | { type: 'MOVE_PLAYER'; playerId: string; steps: number }
  | { type: 'TELEPORT_PLAYER'; playerId: string; position: number }
  | { type: 'SWAP_PLAYERS'; player1Id: string; player2Id: string }
  | { type: 'CHECK_LIFEBUOY'; targetId: string; attackerId: string; damage: number }
  | { type: 'CHECK_COUNTER_ARGUMENT'; targetId: string; attackerId: string; damage: number }
  | { type: 'KICK_COLLISION'; kickerId: string; kickedId: string }
  | { type: 'QUIZ_START'; challengerId: string; opponentId: string }
  | { type: 'QUIZ_RESOLVE'; winnerId: string; loserId: string }
  | { type: 'DETENTION_CHECK'; playerId: string }
  | { type: 'FREEZE_PLAYERS'; playerIds: string[]; turns: number }
  | { type: 'ADVANCE_TURN' };
