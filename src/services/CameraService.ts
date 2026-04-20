import anime from 'animejs';

/**
 * CameraService handles smooth 2D tracking camera movement.
 */
class CameraService {
  /**
   * Translates the camera viewport to center on the target coordinates.
   * 
   * @param targetId The DOM element ID of the camera viewport (e.g., 'camera-viewport')
   * @param containerId The DOM element ID of the container (e.g., 'board-container') to get dimensions
   * @param targetX The actual X coordinate of the target on the board (pixels)
   * @param targetY The actual Y coordinate of the target on the board (pixels)
   */
  public panTo(
    targetId: string,
    _containerId: string,
    targetX: number,
    targetY: number
  ) {
    const el = document.getElementById(targetId);
    if (!el) return;

    // Use window dimensions as the visible viewport
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Center the target in the viewport
    const tx = (width / 2) - targetX;
    const ty = (height / 2) - targetY;

    anime({
      targets: el,
      translateX: tx,
      translateY: ty,
      duration: 300,
      easing: 'easeOutCubic'
    });
  }

  /**
   * Resets the camera to default view (center)
   */
  public resetCamera(targetId: string) {
    const el = document.getElementById(targetId);
    if (!el) return;

    anime.set(el, {
      translateX: 0,
      translateY: 0
    });
  }
}

export const cameraService = new CameraService();
