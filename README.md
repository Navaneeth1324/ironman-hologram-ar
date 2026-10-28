# Iron Man Hologram AR (Hand-Controlled 3D Exploded View)

An augmented-reality web application inspired by Tony Stark's holographic workshop interface. Control, rotate, and explode 3D models and scans into individual components in real time using webcam hand gestures via Google MediaPipe Hands and Three.js.

![Iron Man Hologram HUD](https://img.shields.io/badge/Interface-Iron%20Man%20HUD-00e5ff?style=for-the-badge)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=for-the-badge&logo=three.js)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Hand%20Tracking-blue?style=for-the-badge&logo=google)

---

## ✨ Features

- 🖐️ **Two-Hand Suit Expansion**: Pull your hands apart to explode the 3D model into its individual components; bring hands closer to snap the suit back together.
- 🔄 **Holographic Gesture Rotation**: Move your primary hand to rotate and inspect the floating holographic assembly.
- ⚡ **Iron Man Hologram Shader**: Neon cyan arc-reactor glow with dynamic scanlines, bloom, and wireframe pulse.
- 📦 **Scan / 3D Model Dropzone**: Upload any `.glb` or `.gltf` 3D model or scan to immediately view and explode it.
- 🎯 **Fallback Built-in Model**: Automatically generates a procedural multi-part Stark Arc Reactor / Core Assembly so it runs instantly out-of-the-box with zero assets required.
- 🚀 **Zero-Install / Static Web Delivery**: Runs completely client-side in any modern browser with webcam support.

---

## 🎮 Hand Controls

| Gesture | Action |
|---|---|
| **Two Hands Apart / Together** | **Explode / Reassemble parts** along their normal vectors. |
| **Move Hand Left / Right / Up / Down** | **Rotate holographic assembly** in 3D space. |
| **Pinch (Thumb + Index)** | **Focus / Lock rotation**. |
| **Sliders / Manual Controls** | Available in the top HUD if webcam is unavailable. |

---

## 🚀 Quick Start

### Option 1: Instant Local Python Server
```bash
# Clone the repository
git clone https://github.com/your-username/ironman-hologram-ar.git
cd ironman-hologram-ar

# Start local server
python3 -m http.server 8080
```
Open [http://localhost:8080](http://localhost:8080) in Chrome/Brave/Edge and allow camera access.

---

## 🛠️ Project Structure
```text
ironman-hologram-ar/
├── index.html        # Main Stark Industries holographic HUD & camera overlay
├── css/
│   └── style.css     # Sci-fi holographic styling, scanlines, and HUD brackets
├── js/
│   ├── app.js        # Main coordinator (Webcam, MediaPipe, Three.js bridge)
│   ├── scene.js      # Three.js 3D rendering, lighting & procedural Stark Reactor
│   ├── gestures.js   # MediaPipe Hands pipeline & gesture recognizer
│   └── exploder.js   # Vector explosion algorithm for sub-meshes
└── README.md
```
