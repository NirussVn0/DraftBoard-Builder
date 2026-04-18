import anime from 'animejs';
import { getCoordinatesFromCell, getPlayerOffset } from '../core/Pathfinding';
import type { Tile } from '../core/MapBuilderState';
import { audioService } from './AudioService';
import { cameraService } from './CameraService';

/** Must match BoardGrid.TILE_PX */
const TILE_PX = 64;

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

    const gridSize = customMap ? 15 : 10;
    const cellSizePct = 100 / gridSize;
    const { offsetX, offsetY } = getPlayerOffset(playerIndex, cellSizePct);
    const boardPx = gridSize * TILE_PX;
    const tokenPx = TILE_PX * 0.7;
    const tokenCenter = (TILE_PX - tokenPx) / 2;
    const pxOffsetX = (offsetX / 100) * boardPx;
    const pxOffsetY = (offsetY / 100) * boardPx;
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

      const targetLeft = x * TILE_PX + tokenCenter + pxOffsetX;
      const targetTop = y * TILE_PX + tokenCenter + pxOffsetY;

      timeline.add({
        targets: tokenElement,
        left: targetLeft,
        top: targetTop,
        translateY: [
          { value: -20, duration: 150 / speedFactor, easing: 'easeOutQuad' },
          { value: 0, duration: 150 / speedFactor, easing: 'easeInQuad' }
        ],
        scale: [
          { value: 1.2, duration: 150 / speedFactor, easing: 'easeOutQuad' },
          { value: 1, duration: 150 / speedFactor, easing: 'easeInQuad' }
        ],
        begin: () => { 
          audioService.playTokenBounce(); 
          // Center camera on the token as it lands (add half token size to point to center)
          cameraService.panTo('camera-viewport', 'board-container', targetLeft + (tokenPx / 2), targetTop + (tokenPx / 2));
        }
      });
    });
  }

  /** Sky-drop dice animation — anime.js config with per-frame update callback */
  public static animateSkyDropDice(
    diceElementId: string,
    onComplete: () => void,
    onUpdate?: () => void
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
      update: () => { onUpdate?.(); },
      complete: () => { onComplete(); }
    });
  }
}
