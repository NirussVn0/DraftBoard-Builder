import * as animeLib from 'animejs';
const anime = ('default' in animeLib ? animeLib.default : animeLib) as unknown as typeof animeLib;
import { getCoordinatesFromCell, getPlayerOffset } from '../core/Pathfinding';

const CELL_SIZE_PCT = 10;

export class AnimationService {
  /**
   * Moves a token along a predefined path sequentially.
   */
  public static animateTokenMove(
    tokenId: string,
    playerIndex: number,
    path: number[],
    onComplete: (finalCell: number) => void
  ) {
    if (path.length === 0) {
      onComplete(0);
      return;
    }

    const tokenElement = document.getElementById(tokenId);
    if (!tokenElement) {
      console.warn(`Token element ${tokenId} not found!`);
      onComplete(path[path.length - 1]);
      return;
    }

    const { offsetX, offsetY } = getPlayerOffset(playerIndex);

    const timeline = anime.timeline({
      easing: 'easeInOutQuad',
      duration: 300,
      complete: () => {
        onComplete(path[path.length - 1]);
      }
    });

    path.forEach((cell) => {
      const { x, y } = getCoordinatesFromCell(cell);
      
      timeline.add({
        targets: tokenElement,
        left: `${x * CELL_SIZE_PCT + 2 + offsetX}%`,
        top: `${y * CELL_SIZE_PCT + 2 + offsetY}%`,
        translateY: [
          { value: -20, duration: 150, easing: 'easeOutQuad' },
          { value: 0, duration: 150, easing: 'easeInQuad' }
        ],
        scale: [
          { value: 1.2, duration: 150, easing: 'easeOutQuad' },
          { value: 1, duration: 150, easing: 'easeInQuad' }
        ]
      });
    });
  }
  
  public static animateDiceShake(diceElementId: string) {
    const el = document.getElementById(diceElementId);
    if (!el) return;

    anime({
      targets: el,
      translateX: [
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: 0, duration: 50 }
      ],
      rotate: [
        { value: -10, duration: 50 },
        { value: 10, duration: 50 },
        { value: -10, duration: 50 },
        { value: 10, duration: 50 },
        { value: 0, duration: 50 }
      ],
      easing: 'easeInOutSine',
    });
  }
}
