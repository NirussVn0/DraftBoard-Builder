import type { CardDefinition, CardId } from './CardTypes';
import type { DeckConfig } from './SettingsState';

export const CARD_DEFINITIONS: Map<CardId, CardDefinition> = new Map([
  [
    'BOOST',
    {
      id: 'BOOST',
      tier: 'GREEN',
      icon: '🧠',
      nameKey: 'cards.boost.name',
      descKey: 'cards.boost.desc',
      resolve: (ctx) => {
        const [min, max] = ctx.deckConfig.boostRange;
        const steps = Math.floor(Math.random() * (max - min + 1)) + min;
        return { type: 'MOVE', targetPlayerIds: [ctx.activePlayer.id], steps };
      },
    },
  ],
  [
    'SHIELD',
    {
      id: 'SHIELD',
      tier: 'GREEN',
      icon: '🛟',
      nameKey: 'cards.shield.name',
      descKey: 'cards.shield.desc',
      resolve: (ctx) => ({
        type: 'BUFF',
        targetPlayerIds: [ctx.activePlayer.id],
        buff: { id: 'SHIELD', turnsRemaining: -1, sourcePlayerId: ctx.activePlayer.id },
      }),
    },
  ],
  [
    'REFLECT',
    {
      id: 'REFLECT',
      tier: 'GREEN',
      icon: '🪞',
      nameKey: 'cards.reflect.name',
      descKey: 'cards.reflect.desc',
      resolve: (ctx) => ({
        type: 'BUFF',
        targetPlayerIds: [ctx.activePlayer.id],
        buff: { id: 'REFLECT', turnsRemaining: ctx.deckConfig.reflectTurns, sourcePlayerId: ctx.activePlayer.id },
      }),
    },
  ],
  [
    'TRIBUTE',
    {
      id: 'TRIBUTE',
      tier: 'GREEN',
      icon: '🧛',
      nameKey: 'cards.tribute.name',
      descKey: 'cards.tribute.desc',
      resolve: (ctx) => ({
        type: 'BUFF',
        targetPlayerIds: [ctx.activePlayer.id],
        buff: { id: 'TRIBUTE', turnsRemaining: 1, sourcePlayerId: ctx.activePlayer.id },
      }),
    },
  ],
  [
    'SLIP',
    {
      id: 'SLIP',
      tier: 'RED',
      icon: '🍌',
      nameKey: 'cards.slip.name',
      descKey: 'cards.slip.desc',
      resolve: (ctx) => {
        const [min, max] = ctx.deckConfig.slipRange;
        const steps = Math.floor(Math.random() * (max - min + 1)) + min;
        return { type: 'MOVE', targetPlayerIds: [ctx.activePlayer.id], steps: -steps };
      },
    },
  ],
  [
    'KAMIKAZE',
    {
      id: 'KAMIKAZE',
      tier: 'RED',
      icon: '💣',
      nameKey: 'cards.kamikaze.name',
      descKey: 'cards.kamikaze.desc',
      resolve: (ctx) => {
        let top1 = ctx.allPlayers[0];
        for (const p of ctx.allPlayers) {
          if (p.position > top1.position) top1 = p;
        }
        if (ctx.deckConfig.kamikazeMode === 'RESET_ZERO') {
           return { type: 'TELEPORT', targetPlayerIds: [ctx.activePlayer.id, top1.id], newPosition: 0 };
        } else {
           return { type: 'TELEPORT', targetPlayerIds: [top1.id], newPosition: ctx.activePlayer.position };
        }
      },
    },
  ],
  [
    'MARKET_CRASH',
    {
      id: 'MARKET_CRASH',
      tier: 'RED',
      icon: '📉',
      nameKey: 'cards.marketCrash.name',
      descKey: 'cards.marketCrash.desc',
      resolve: (ctx) => {
        const others = ctx.allPlayers.filter(p => p.id !== ctx.activePlayer.id).map(p => p.id);
        return { type: 'MOVE', targetPlayerIds: others, steps: -ctx.deckConfig.marketCrashSteps };
      },
    },
  ],
  [
    'DUNGEON',
    {
      id: 'DUNGEON',
      tier: 'RED',
      icon: '⛓️',
      nameKey: 'cards.dungeon.name',
      descKey: 'cards.dungeon.desc',
      resolve: (ctx) => ({
        type: 'BUFF',
        targetPlayerIds: [ctx.activePlayer.id],
        buff: { id: 'DUNGEON', turnsRemaining: -1, sourcePlayerId: ctx.activePlayer.id },
      }),
    },
  ],
  [
    'DUEL',
    {
      id: 'DUEL',
      tier: 'PURPLE',
      icon: '⚔️',
      nameKey: 'cards.duel.name',
      descKey: 'cards.duel.desc',
      resolve: (ctx) => {
        const others = ctx.allPlayers.filter(p => p.id !== ctx.activePlayer.id);
        const opponent = others[Math.floor(Math.random() * others.length)];
        return { type: 'DUEL', targetPlayerIds: [ctx.activePlayer.id], duelOpponentId: opponent?.id || ctx.activePlayer.id };
      },
    },
  ],
  [
    'GODS_HAND',
    {
      id: 'GODS_HAND',
      tier: 'PURPLE',
      icon: '🖐️',
      nameKey: 'cards.godsHand.name',
      descKey: 'cards.godsHand.desc',
      resolve: (ctx) => {
        const others = ctx.allPlayers.filter(p => p.id !== ctx.activePlayer.id);
        const target = others[Math.floor(Math.random() * others.length)];
        let lastPlayer = ctx.allPlayers[0];
        for (const p of ctx.allPlayers) {
          if (p.position < lastPlayer.position) lastPlayer = p;
        }
        return { type: 'TELEPORT', targetPlayerIds: [target?.id || ctx.activePlayer.id], newPosition: lastPlayer.position };
      },
    },
  ],
  [
    'SHADOW_STEP',
    {
      id: 'SHADOW_STEP',
      tier: 'PURPLE',
      icon: '🥷',
      nameKey: 'cards.shadowStep.name',
      descKey: 'cards.shadowStep.desc',
      resolve: (ctx) => {
        const others = ctx.allPlayers.filter(p => p.id !== ctx.activePlayer.id);
        let target = others[0];
        if (ctx.deckConfig.shadowStepTarget === 'TOP1') {
          for (const p of others) {
            if (p.position > target.position) target = p;
          }
        } else {
          target = others[Math.floor(Math.random() * others.length)];
        }
        return { type: 'TELEPORT', targetPlayerIds: [ctx.activePlayer.id], newPosition: Math.max(0, (target?.position || 0) - 1) };
      },
    },
  ],
  [
    'SWAP',
    {
      id: 'SWAP',
      tier: 'PURPLE',
      icon: '🔄',
      nameKey: 'cards.swap.name',
      descKey: 'cards.swap.desc',
      resolve: (ctx) => {
        const others = ctx.allPlayers.filter(p => p.id !== ctx.activePlayer.id);
        const target = others[Math.floor(Math.random() * others.length)];
        return { type: 'SWAP', targetPlayerIds: [ctx.activePlayer.id], swapTargetId: target?.id || ctx.activePlayer.id };
      },
    },
  ],
  [
    'THE_WORLD',
    {
      id: 'THE_WORLD',
      tier: 'PURPLE',
      icon: '⏱️',
      nameKey: 'cards.theWorld.name',
      descKey: 'cards.theWorld.desc',
      resolve: (ctx) => {
        const others = ctx.allPlayers.filter(p => p.id !== ctx.activePlayer.id).map(p => p.id);
        if (ctx.deckConfig.theWorldMode === 'FREEZE_ONE') {
          const target = others[Math.floor(Math.random() * others.length)];
          return { type: 'FREEZE', targetPlayerIds: [target || ctx.activePlayer.id], freezeTurns: 1 };
        }
        return { type: 'FREEZE', targetPlayerIds: others, freezeTurns: 1 };
      },
    },
  ],
]);

export function getEnabledCards(config: DeckConfig): CardDefinition[] {
  const cards: CardDefinition[] = [];
  if (config.enableBoost) cards.push(CARD_DEFINITIONS.get('BOOST')!);
  if (config.enableSlip) cards.push(CARD_DEFINITIONS.get('SLIP')!);
  if (config.enableShield) cards.push(CARD_DEFINITIONS.get('SHIELD')!);
  if (config.enableReflect) cards.push(CARD_DEFINITIONS.get('REFLECT')!);
  if (config.enableTribute) cards.push(CARD_DEFINITIONS.get('TRIBUTE')!);
  if (config.enableKamikaze) cards.push(CARD_DEFINITIONS.get('KAMIKAZE')!);
  if (config.enableMarketCrash) cards.push(CARD_DEFINITIONS.get('MARKET_CRASH')!);
  if (config.enableDungeon) cards.push(CARD_DEFINITIONS.get('DUNGEON')!);
  
  if (config.enableDuel && config.hostMode) cards.push(CARD_DEFINITIONS.get('DUEL')!);
  if (config.enableGodsHand) cards.push(CARD_DEFINITIONS.get('GODS_HAND')!);
  if (config.enableShadowStep) cards.push(CARD_DEFINITIONS.get('SHADOW_STEP')!);
  if (config.enableSwap) cards.push(CARD_DEFINITIONS.get('SWAP')!);
  if (config.enableTheWorld) cards.push(CARD_DEFINITIONS.get('THE_WORLD')!);

  return cards;
}

export function drawCard(config: DeckConfig): CardDefinition {
  const pool = getEnabledCards(config);
  if (pool.length === 0) return CARD_DEFINITIONS.get('BOOST')!;
  
  const greenRed = pool.filter(c => c.tier !== 'PURPLE');
  const purple = pool.filter(c => c.tier === 'PURPLE');
  
  const roll = Math.random() * 100;
  if (purple.length > 0 && roll < config.rarityBias) {
    return purple[Math.floor(Math.random() * purple.length)];
  }
  
  const fallbackPool = greenRed.length > 0 ? greenRed : pool;
  return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
}
