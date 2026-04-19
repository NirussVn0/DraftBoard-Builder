/** ── Global Settings (persisted to localStorage) ── */
export interface GlobalSettings {
  locale: 'vi' | 'en';
  enableSoundEffects: boolean;
  enableAnimations: boolean;
  cameraAutoTrack: boolean;
}

export const DEFAULT_GLOBAL: GlobalSettings = {
  locale: 'vi',
  enableSoundEffects: false,
  enableAnimations: true,
  cameraAutoTrack: true,
};

export interface DeckConfig {
  enableBoost: boolean;
  boostRange: [number, number];
  enableSlip: boolean;
  slipRange: [number, number];
  enableShield: boolean;
  enableReflect: boolean;
  reflectTurns: number;
  enableTribute: boolean;
  enableKamikaze: boolean;
  kamikazeMode: 'MATCH_STEPS' | 'RESET_ZERO';
  enableMarketCrash: boolean;
  marketCrashSteps: number;
  enableDungeon: boolean;
  dungeonEscapeValue: number;
  enableDuel: boolean;
  duelReward: number;
  duelPenalty: number;
  enableGodsHand: boolean;
  enableShadowStep: boolean;
  shadowStepTarget: 'TOP1' | 'RANDOM';
  enableSwap: boolean;
  enableTheWorld: boolean;
  theWorldMode: 'FREEZE_ALL' | 'FREEZE_ONE';
  rarityBias: number;
  hostMode: boolean;
}

export const DEFAULT_DECK: DeckConfig = {
  enableBoost: true, boostRange: [1, 6],
  enableSlip: true, slipRange: [1, 6],
  enableShield: true,
  enableReflect: true, reflectTurns: 3,
  enableTribute: true,
  enableKamikaze: true, kamikazeMode: 'MATCH_STEPS',
  enableMarketCrash: true, marketCrashSteps: 3,
  enableDungeon: true, dungeonEscapeValue: 6,
  enableDuel: false, duelReward: 3, duelPenalty: 3,
  enableGodsHand: true,
  enableShadowStep: true, shadowStepTarget: 'TOP1',
  enableSwap: true,
  enableTheWorld: true, theWorldMode: 'FREEZE_ALL',
  rarityBias: 30,
  hostMode: false,
};

/** ── Per-game Map Settings (configured in HomeMenu SETUP) ── */
export interface MapSettings {
  diceCount: number;       // 1-5, sum of N dice
  kickDistance: number;     // 0=off (kick disabled), 1-6
  exactLanding: boolean;   // true=bounce-back, false=overshoot wins
  mysteryRange: number;    // DEPRECATED
  deckConfig: DeckConfig;
}

export const DEFAULT_MAP: MapSettings = {
  diceCount: 1,
  kickDistance: 3,
  exactLanding: true,
  mysteryRange: 6,
  deckConfig: { ...DEFAULT_DECK },
};

/** ── localStorage helpers ── */
const GLOBAL_KEY = 'draftboard_global_settings';

export function loadGlobalSettings(): GlobalSettings {
  try {
    const raw = localStorage.getItem(GLOBAL_KEY);
    return raw ? { ...DEFAULT_GLOBAL, ...JSON.parse(raw) } : DEFAULT_GLOBAL;
  } catch {
    return DEFAULT_GLOBAL;
  }
}

export function saveGlobalSettings(settings: GlobalSettings): void {
  localStorage.setItem(GLOBAL_KEY, JSON.stringify(settings));
}
