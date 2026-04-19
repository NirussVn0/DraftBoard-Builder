import type { CardDefinition, CardResolution, Buff, BuffId } from './CardTypes';

export type GameEvent =
  | { type: 'DRAW_CARD' }
  | { type: 'RESOLVE_CARD'; card: CardDefinition; resolution: CardResolution }
  | { type: 'ANIMATE_PRECAST'; card: CardDefinition }
  | { type: 'ANIMATE_CARD'; card: CardDefinition; resolution: CardResolution }
  | { type: 'APPLY_BUFF'; targetId: string; buff: Buff }
  | { type: 'REMOVE_BUFF'; targetId: string; buffId: BuffId }
  | { type: 'MOVE_PLAYER'; playerId: string; steps: number }
  | { type: 'TELEPORT_PLAYER'; playerId: string; position: number }
  | { type: 'CHECK_SHIELD'; targetId: string; attackerId: string; damage: number }
  | { type: 'CHECK_REFLECT'; targetId: string; attackerId: string; damage: number }
  | { type: 'KICK_COLLISION'; kickerId: string; kickedId: string }
  | { type: 'DUEL_START'; challengerId: string; opponentId: string }
  | { type: 'DUEL_RESOLVE'; winnerId: string; loserId: string }
  | { type: 'DUNGEON_CHECK'; playerId: string }
  | { type: 'FREEZE_PLAYER'; playerId: string; turns: number }
  | { type: 'ADVANCE_TURN' };
