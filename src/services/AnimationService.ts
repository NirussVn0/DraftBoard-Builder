import anime from 'animejs';
import { getCoordinatesFromCell, getPlayerOffset, getTokenMetrics } from '../core/Pathfinding';
import type { Tile } from '../core/MapBuilderState';

const LEGACY_CELL_SIZE_PCT = 10;
const MAP_CELL_SIZE_PCT = 100 / 15;

export class AnimationService {
  public static animateTokenMove(
    tokenId: string,
    playerIndex: number,
    path: number[],
    onComplete: (finalCell: number) => void,
    isFast: boolean = false,
    customMap?: Tile[]
  ) {
    if (path.length === 0) {
      onComplete(0);
      return;
    }

    const tokenElement = document.getElementById(tokenId);
    if (!tokenElement) {
      onComplete(path[path.length - 1]);
      return;
    }

    const cellSizePct = customMap ? MAP_CELL_SIZE_PCT : LEGACY_CELL_SIZE_PCT;
    const { centerOffset } = getTokenMetrics(cellSizePct);
    const { offsetX, offsetY } = getPlayerOffset(playerIndex, cellSizePct);
    const speedFactor = isFast ? 1.5 : 1;

    const timeline = anime.timeline({
      easing: 'easeInOutQuad',
      duration: 300 / speedFactor,
      complete: () => {
        onComplete(path[path.length - 1]);
      }
    });

    path.forEach((stepIndex) => {
      let x = 0;
      let y = 0;

      if (customMap && customMap.length > 0) {
        const tile = customMap[stepIndex];
        if (tile) { x = tile.x; y = tile.y; }
      } else {
        const coords = getCoordinatesFromCell(stepIndex);
        x = coords.x;
        y = coords.y;
      }

      timeline.add({
        targets: tokenElement,
        left: `${x * cellSizePct + centerOffset + offsetX}%`,
        top: `${y * cellSizePct + centerOffset + offsetY}%`,
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

  /** Sky-drop dice animation — exact anime.js config from CEO directive */
  public static animateSkyDropDice(
    diceElementId: string,
    onComplete: () => void
  ) {
    const el = document.getElementById(diceElementId);
    if (!el) { onComplete(); return; }

    anime({
      targets: el,
      translateY: [
        { value: -800, duration: 0 },
        { value: 0, duration: 1000, easing: 'easeOutBounce' }
      ],
      rotate: { value: '2turn', duration: 1000, easing: 'easeInOutSine' },
      complete: () => { onComplete(); }
    });
  }
}
