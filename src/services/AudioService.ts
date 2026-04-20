import { Howl, Howler } from 'howler';
import { loadGlobalSettings } from '../core/SettingsState';

/**
 * AudioService — Singleton managing all game sound effects via Howler.js.
 *
 * Audio files are lazy-loaded: each Howl is only created when the sound
 * is first played. If the file doesn't exist or fails to load, the sound
 * is silently disabled to prevent download loops.
 *
 * Browser Autoplay Policy fix: we register a one-time 'click' listener
 * that resumes the AudioContext as soon as the user interacts with the page.
 */
class AudioService {
  private sounds: Map<string, Howl | null> = new Map();
  private failedSounds: Set<string> = new Set();
  private unlocked = false;

  private static SOUND_CONFIG: Record<string, { src: string; volume: number }> = {
    dice:    { src: '/audio/dice.mp3',    volume: 0.7 },
    bounce:  { src: '/audio/bounce.mp3',  volume: 0.4 },
    kick:    { src: '/audio/kick.mp3',    volume: 0.8 },
    mystery: { src: '/audio/mystery.mp3', volume: 0.6 },
    victory: { src: '/audio/victory.mp3', volume: 0.9 },
  };

  constructor() {
    const settings = loadGlobalSettings();
    Howler.mute(!settings.enableSoundEffects);

    // Unlock AudioContext on first user interaction (browser autoplay policy)
    const unlock = () => {
      if (this.unlocked) return;
      this.unlocked = true;

      // Resume the AudioContext Howler created
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctx = (Howler as any).ctx as AudioContext | undefined;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }

      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('touchstart', unlock);
    };

    document.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);
    document.addEventListener('touchstart', unlock);
  }

  /**
   * Lazily loads and plays a sound. If the file previously failed,
   * it won't attempt again — preventing download loops.
   */
  private play(key: string): void {
    if (this.failedSounds.has(key)) return;

    let howl = this.sounds.get(key);
    if (!howl) {
      const config = AudioService.SOUND_CONFIG[key];
      if (!config) return;

      howl = new Howl({
        src: [config.src],
        volume: config.volume,
        preload: true,
        html5: false, // Use Web Audio API (not <audio> tag) for lower latency
        onloaderror: () => {
          this.failedSounds.add(key);
          this.sounds.delete(key);
        },
      });
      this.sounds.set(key, howl);
    }

    howl.play();
  }

  /** Dice hits the ground */
  public playDiceRoll(): void { this.play('dice'); }

  /** Token hops onto a new cell */
  public playTokenBounce(): void { this.play('bounce'); }

  /** Player kicks another player */
  public playKick(): void { this.play('kick'); }

  /** Mystery card flips */
  public playMysteryFlip(): void { this.play('mystery'); }

  /** Victory fanfare */
  public playVictory(): void { this.play('victory'); }

  /**
   * Sync mute state with GlobalSettings toggle.
   * Called by SettingsPanel when user toggles sound.
   * true = sound ON, false = sound OFF.
   */
  public setMuted(muted: boolean): void {
    Howler.mute(muted);
  }
}

export const audioService = new AudioService();
