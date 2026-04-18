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

/** ── Per-game Map Settings (configured in HomeMenu SETUP) ── */
export interface MapSettings {
  diceCount: number;       // 1-3, sum of N dice
  kickDistance: number;     // 0=off, 1-6
  exactLanding: boolean;   // true=bounce-back, false=overshoot wins
}

export const DEFAULT_MAP: MapSettings = {
  diceCount: 1,
  kickDistance: 3,
  exactLanding: true,
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
