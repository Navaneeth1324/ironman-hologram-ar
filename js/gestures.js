/**
 * GestureTracker: Uses MediaPipe Hands to detect 21 landmarks per hand
 * and calculates suit explosion distance, rotational tilt, and pinch gestures.
 */
export class GestureTracker {
  constructor(videoElement, canvasElement, onGestureUpdate) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.onGestureUpdate = onGestureUpdate;

    this.prevPrimaryHandPos = null;
    this.smoothExplosion = 0;
    this.hands = null;
    this.camera = null;
  }

  async start() {
    if (!window.Hands || !window.Camera) {
      throw new Error("MediaPipe Hands library not loaded from CDN.");
    }

    this.hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6
    });

    this.hands.onResults((results) => this.processResults(results));

    this.camera = new window.Camera(this.video, {
      onFrame: async () => {
        await this.hands.send({ image: this.video });
      },
      width: 640,
      height: 480
    });

    await this.camera.start();
  }

  processResults(results) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const handsLandmarks = results.multiHandLandmarks;
    const handCount = handsLandmarks ? handsLandmarks.length : 0;

    let explosionFactor = 0;
    let deltaRotateX = 0;
    let deltaRotateY = 0;
    let isPinching = false;

    if (handCount >= 1) {
      // Draw skeleton HUD on the PiP camera
      for (const landmarks of handsLandmarks) {
        if (window.drawConnectors && window.drawLandmarks) {
          window.drawConnectors(this.ctx, landmarks, window.HAND_CONNECTIONS, {
            color: '#00f0ff',
            lineWidth: 2
          });
          window.drawLandmarks(this.ctx, landmarks, {
            color: '#ffaa00',
            lineWidth: 1,
            radius: 3
          });
        }
      }

      // 1. Single Hand Interaction: Rotation & Pinch
      const primaryHand = handsLandmarks[0];
      const wrist = primaryHand[0];
      const indexTip = primaryHand[8];
      const thumbTip = primaryHand[4];

      // Measure pinch distance (thumb to index)
      const pinchDist = Math.hypot(
        indexTip.x - thumbTip.x,
        indexTip.y - thumbTip.y,
        indexTip.z - thumbTip.z
      );
      isPinching = pinchDist < 0.08;

      if (this.prevPrimaryHandPos) {
        deltaRotateX = (wrist.x - this.prevPrimaryHandPos.x) * 400;
        deltaRotateY = (wrist.y - this.prevPrimaryHandPos.y) * 400;
      }
      this.prevPrimaryHandPos = { x: wrist.x, y: wrist.y };
    } else {
      this.prevPrimaryHandPos = null;
    }

    // 2. Two-Hand Interaction: Suit Expansion / Explosion
    if (handCount >= 2) {
      const handA = handsLandmarks[0][0]; // Wrist Hand 1
      const handB = handsLandmarks[1][0]; // Wrist Hand 2

      // Euclidean distance between hands across the camera plane
      const separation = Math.hypot(handA.x - handB.x, handA.y - handB.y);

      // Map separation: 0.18 (close) -> 0.0 explosion, 0.65 (wide) -> 1.0 explosion
      const rawExplode = (separation - 0.18) / 0.45;
      const targetExplosion = Math.min(Math.max(rawExplode, 0), 1.4);

      // Smooth interpolation
      this.smoothExplosion += (targetExplosion - this.smoothExplosion) * 0.2;
      explosionFactor = this.smoothExplosion;
    }

    if (this.onGestureUpdate) {
      this.onGestureUpdate({
        handCount,
        explosionFactor,
        deltaRotateX,
        deltaRotateY,
        isPinching
      });
    }
  }
}
