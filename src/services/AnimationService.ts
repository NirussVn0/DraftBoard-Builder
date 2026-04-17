import anime from 'animejs';
import { getCoordinatesFromCell, getPlayerOffset } from '../core/Pathfinding';



export class AnimationService {
  /**
   * Moves a token along a predefined path sequentially.
   */
  public static animateTokenMove(
    tokenId: string,
    playerIndex: number,
    path: number[],
    onComplete: (finalCell: number) => void,
    isFast: boolean = false,
    customMap?: any[] // Tile[]
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

    const speedFactor = isFast ? 1.5 : 1;
    const timeline = anime.timeline({
      easing: 'easeInOutQuad',
      duration: 300 / speedFactor,
      complete: () => {
        onComplete(path[path.length - 1]);
      }
    });

    path.forEach((cell) => {
      let x = 0; let y = 0; let CELL_SIZE_PCT = 10;
      
      if (customMap && customMap.length > 0) {
        CELL_SIZE_PCT = 100 / 15; // Built on MAP_SIZE
        const t = customMap[cell];
        if (t) { x = t.x; y = t.y; }
      } else {
        const coords = getCoordinatesFromCell(cell);
        x = coords.x; y = coords.y;
      }
      
      timeline.add({
        targets: tokenElement,
        left: `${x * CELL_SIZE_PCT + 2 + offsetX}%`,
        top: `${y * CELL_SIZE_PCT + 2 + offsetY}%`,
        translateY: [
          { value: -20, duration: 150 / speedFactor, easing: 'easeOutQuad' },
          { value: 0, duration: 150 / speedFactor, easing: 'easeInQuad' }
        ],
        scale: [
          { value: 1.2, duration: 150 / speedFactor, easing: 'easeOutQuad' },
          { value: 1, duration: 150 / speedFactor, easing: 'easeInQuad' }
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
