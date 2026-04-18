import anime from 'animejs';

/**
 * CameraService handles the parabolic camera movement.
 */
class CameraService {
  private isAnimating = false;

  /**
   * Performs a parabolic camera movement to focus on a specific point.
   * 
   * @param targetId The DOM element ID of the camera wrapper (the element to transform)
   * @param tx The target X translation (to center the focal point)
   * @param ty The target Y translation (to center the focal point)
   * @param containerWidth The width of the viewport container
   * @param containerHeight The height of the viewport container
   * @param targetX The actual X coordinate of the target on the board
   * @param targetY The actual Y coordinate of the target on the board
   * @param onComplete Callback when the animation finishes
   */
  public animateParabolic(
    targetId: string,
    containerWidth: number,
    containerHeight: number,
    targetX: number,
    targetY: number,
    onComplete?: () => void
  ) {
    if (this.isAnimating) return;
    
    const el = document.getElementById(targetId);
    if (!el) return;

    this.isAnimating = true;

    // Calculate translation needed to center the target
    // If the board is huge, we translate it so (targetX, targetY) is at (containerWidth/2, containerHeight/2)
    const tx = (containerWidth / 2) - targetX;
    const ty = (containerHeight / 2) - targetY;

    const tl = anime.timeline({
      easing: 'easeInOutSine',
      complete: () => {
        this.isAnimating = false;
        if (onComplete) onComplete();
      }
    });

    // Phase 1: Zoom out
    tl.add({
      targets: el,
      scale: 0.5,
      duration: 400,
      easing: 'easeOutQuad'
    });

    // Phase 2: Pan to target
    tl.add({
      targets: el,
      translateX: tx,
      translateY: ty,
      duration: 600,
      easing: 'easeInOutCubic'
    });

    // Phase 3: Zoom in (landing)
    tl.add({
      targets: el,
      scale: 1, // Final scale 1
      duration: 400,
      easing: 'easeOutBack'
    });
  }

  /**
   * Resets the camera to default view (center, scale 1)
   */
  public resetCamera(targetId: string) {
    const el = document.getElementById(targetId);
    if (!el) return;

    anime.set(el, {
      translateX: 0,
      translateY: 0,
      scale: 1
    });
  }
}

export const cameraService = new CameraService();
