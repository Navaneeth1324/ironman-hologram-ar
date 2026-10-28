import { HologramScene } from './scene.js';
import { GestureTracker } from './gestures.js';

class IronManApp {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.video = document.getElementById('camera-video');
    this.handCanvas = document.getElementById('hand-canvas');
    this.statusToast = document.getElementById('status-toast');
    this.metricHands = document.getElementById('metric-hands');
    this.metricExplodeVal = document.getElementById('metric-explode-val');
    this.explodeBar = document.getElementById('explode-bar');
    this.modelFileInput = document.getElementById('model-file-input');
    this.btnReset = document.getElementById('btn-reset');
    this.btnDefaultModel = document.getElementById('btn-default-model');

    this.scene = new HologramScene(this.canvas);
    this.manualExplosion = 0;
    this.hasActiveCamera = false;

    this.initEvents();
    this.startGestures();
  }

  showStatus(msg, timeout = 3500) {
    if (!this.statusToast) return;
    this.statusToast.textContent = msg;
    this.statusToast.style.opacity = '1';
    if (this.statusTimer) clearTimeout(this.statusTimer);
    this.statusTimer = setTimeout(() => {
      this.statusToast.style.opacity = '0';
    }, timeout);
  }

  async startGestures() {
    this.showStatus("INITIALIZING STARK SENSORS & HAND TRACKING...");
    try {
      this.tracker = new GestureTracker(this.video, this.handCanvas, (gesture) => {
        this.onGestureUpdate(gesture);
      });
      await this.tracker.start();
      this.hasActiveCamera = true;
      this.showStatus("JARVIS ONLINE: HAND TRACKING ACTIVE");
    } catch (err) {
      console.warn("Hand tracking initialization warning:", err);
      this.showStatus("WEBCAM GESTURES OFFLINE - USE MOUSE / SLIDER CONTROLS", 6000);
    }
  }

  onGestureUpdate(data) {
    if (this.metricHands) {
      this.metricHands.textContent = data.handCount > 0 ? `${data.handCount} DETECTED` : "SEARCHING...";
    }

    // 1. Two-Hand Explosion Control
    if (data.handCount >= 2) {
      this.scene.applyExplosion(data.explosionFactor);
      const pct = Math.round(data.explosionFactor * 100);
      if (this.metricExplodeVal) this.metricExplodeVal.textContent = `${pct}%`;
      if (this.explodeBar) this.explodeBar.style.width = `${Math.min(pct, 100)}%`;
    }

    // 2. Single-Hand 3D Holographic Orbit Rotation (when not pinching)
    if (data.handCount === 1 && !data.isPinching) {
      this.scene.rotateModel(data.deltaRotateX, data.deltaRotateY);
    }
  }

  initEvents() {
    // 3D Model (.glb / .gltf) upload dropzone
    if (this.modelFileInput) {
      this.modelFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          this.scene.loadGLTF(event.target.result);
          this.showStatus(`UPLOAD COMPLETE: ${file.name.toUpperCase()}`);
        };
        reader.readAsArrayBuffer(file);
      });
    }

    // Reset Model Button
    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => {
        this.scene.applyExplosion(0);
        if (this.metricExplodeVal) this.metricExplodeVal.textContent = "0%";
        if (this.explodeBar) this.explodeBar.style.width = "0%";
        this.showStatus("SUIT INTEGRITY RESTORED: ASSEMBLED");
      });
    }

    // Default Arc Reactor Assembly Button
    if (this.btnDefaultModel) {
      this.btnDefaultModel.addEventListener('click', () => {
        this.scene.buildDefaultReactor();
        this.showStatus("STARK ARC REACTOR CORE LOADED");
      });
    }

    // Mouse Drag fallback to rotate hologram
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    window.addEventListener('mousedown', (e) => {
      if (e.target.closest('.hud-interactive')) return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      this.scene.rotateModel(deltaX * 0.8, deltaY * 0.8);
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Mouse Wheel fallback for explosion zoom
    window.addEventListener('wheel', (e) => {
      if (e.target.closest('.hud-interactive')) return;
      this.manualExplosion = Math.min(Math.max(this.manualExplosion + e.deltaY * 0.001, 0), 1.2);
      this.scene.applyExplosion(this.manualExplosion);
      const pct = Math.round(this.manualExplosion * 100);
      if (this.metricExplodeVal) this.metricExplodeVal.textContent = `${pct}%`;
      if (this.explodeBar) this.explodeBar.style.width = `${Math.min(pct, 100)}%`;
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new IronManApp();
});
