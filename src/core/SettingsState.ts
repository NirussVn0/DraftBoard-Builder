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
  enableEureka: boolean;
  eurekaRange: [number, number];
  enableMindBlank: boolean;
  mindBlankRange: [number, number];
  enableLifebuoy: boolean;
  enableCounter: boolean;
  counterTurns: number;
  enableParasite: boolean;
  enableDeadlineBomb: boolean;
  deadlineBombMode: 'MATCH_STEPS' | 'RESET_ZERO';
  enableBlackout: boolean;
  blackoutSteps: number;
  enableDetention: boolean;
  detentionEscapeValue: number;
  enablePopQuiz: boolean;
  quizReward: number;
  quizPenalty: number;
  enableSupervisorHand: boolean;
  enableNinjaCopy: boolean;
  ninjaCopyTarget: 'TOP1' | 'RANDOM';
  enableAmenotejikara: boolean;
  enableZaWarudo: boolean;
  zaWarudoMode: 'FREEZE_ALL' | 'FREEZE_ONE';
  rarityBias: number;
  hostMode: boolean;
}

export const DEFAULT_DECK: DeckConfig = {
  enableEureka: true, eurekaRange: [1, 6],
  enableMindBlank: true, mindBlankRange: [1, 6],
  enableLifebuoy: true,
  enableCounter: true, counterTurns: 3,
  enableParasite: true,
  enableDeadlineBomb: true, deadlineBombMode: 'MATCH_STEPS',
  enableBlackout: true, blackoutSteps: 3,
  enableDetention: true, detentionEscapeValue: 6,
  enablePopQuiz: false, quizReward: 3, quizPenalty: 3,
  enableSupervisorHand: true,
  enableNinjaCopy: true, ninjaCopyTarget: 'TOP1',
  enableAmenotejikara: true,
  enableZaWarudo: true, zaWarudoMode: 'FREEZE_ALL',
  rarityBias: 30,
  hostMode: false,
};

import type { BiomeTheme } from '../components/Board/EnvironmentLayer';

/** ── Per-game Map Settings (configured in HomeMenu SETUP) ── */
export interface MapSettings {
  diceCount: number;       // 1-5, sum of N dice
  kickDistance: number;     // 0=off (kick disabled), 1-6
  exactLanding: boolean;   // true=bounce-back, false=overshoot wins
  mysteryRange: number;    // DEPRECATED
  biome: BiomeTheme;
  deckConfig: DeckConfig;
}

export const DEFAULT_MAP: MapSettings = {
  diceCount: 1,
  kickDistance: 3,
  exactLanding: true,
  mysteryRange: 6,
  biome: 'OFF',
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
