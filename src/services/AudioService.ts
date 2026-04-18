import { Howl, Howler } from 'howler';
import { loadGlobalSettings } from '../core/SettingsState';

/**
 * AudioService — Singleton managing all game sound effects via Howler.js.
 *
 * Asset paths point to public/audio/. Co-founder will replace placeholder
 * files with real recordings later. Howler handles sprite pooling internally
 * to prevent audio clipping when multiple sounds fire simultaneously.
 */
class AudioService {
  private sounds: Record<string, Howl>;

  constructor() {
    // Initialize with muted state from saved settings
    const settings = loadGlobalSettings();
    Howler.mute(!settings.enableSoundEffects);

    this.sounds = {
      dice: new Howl({ src: ['/audio/dice.mp3'], volume: 0.7 }),
      bounce: new Howl({ src: ['/audio/bounce.mp3'], volume: 0.4 }),
      kick: new Howl({ src: ['/audio/kick.mp3'], volume: 0.8 }),
      mystery: new Howl({ src: ['/audio/mystery.mp3'], volume: 0.6 }),
      victory: new Howl({ src: ['/audio/victory.mp3'], volume: 0.9 }),
    };
  }

  /** Dice hits the ground */
  public playDiceRoll(): void {
    this.sounds.dice.play();
  }

  /** Token hops onto a new cell */
  public playTokenBounce(): void {
    this.sounds.bounce.play();
  }

  /** Player kicks another player */
  public playKick(): void {
    this.sounds.kick.play();
  }

  /** Mystery card flips */
  public playMysteryFlip(): void {
    this.sounds.mystery.play();
  }

  /** Victory fanfare */
  public playVictory(): void {
    this.sounds.victory.play();
  }

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
