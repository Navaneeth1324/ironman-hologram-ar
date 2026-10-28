import { Exploder } from './exploder.js';

export class HologramScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.exploder = new Exploder();
    this.currentModel = null;
    this.rotationVelocity = { x: 0, y: 0 };
    this.targetRotation = { x: 0.2, y: 0 };

    this.init();
    this.buildDefaultReactor();
    this.animate();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020813, 0.04);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.5, 7);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Hologram Lighting
    const ambientLight = new THREE.AmbientLight(0x005577, 1.5);
    this.scene.add(ambientLight);

    const cyanPointLight = new THREE.PointLight(0x00f0ff, 3, 20);
    cyanPointLight.position.set(0, 2, 4);
    this.scene.add(cyanPointLight);

    const blueRimLight = new THREE.PointLight(0x0044ff, 2, 20);
    blueRimLight.position.set(-3, -2, -3);
    this.scene.add(blueRimLight);

    // Hologram grid plane beneath the suit/core
    const gridHelper = new THREE.GridHelper(14, 28, 0x00f0ff, 0x002244);
    gridHelper.position.y = -2;
    this.scene.add(gridHelper);

    // Hologram Concentric Target Rings on the floor
    const ringGeo = new THREE.RingGeometry(1.8, 1.85, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -1.99;
    this.scene.add(ringMesh);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  getHologramMaterial(emissiveColor = 0x00f0ff, opacity = 0.85) {
    return new THREE.MeshStandardMaterial({
      color: 0x002b44,
      emissive: emissiveColor,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: false,
      transparent: true,
      opacity: opacity,
      depthWrite: true
    });
  }

  /**
   * Procedurally builds a Stark Arc Reactor Assembly composed of 20+ distinct components.
   * This guarantees the exploded view works immediately out-of-the-box.
   */
  buildDefaultReactor() {
    if (this.currentModel) {
      this.scene.remove(this.currentModel);
    }

    const reactorGroup = new THREE.Group();
    reactorGroup.name = "Stark_Arc_Reactor";

    const cyanMat = this.getHologramMaterial(0x00f0ff, 0.85);
    const goldMat = this.getHologramMaterial(0xffaa00, 0.9);
    const blueMat = this.getHologramMaterial(0x0055ff, 0.8);
    const coreLightMat = new THREE.MeshBasicMaterial({ color: 0xcceeff });

    // 1. Central Core Sphere
    const coreGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const coreMesh = new THREE.Mesh(coreGeo, coreLightMat);
    coreMesh.name = "Central_Palladium_Core";
    reactorGroup.add(coreMesh);

    // 2. Inner Magnetic Ring
    const innerRingGeo = new THREE.TorusGeometry(0.85, 0.08, 16, 64);
    const innerRing = new THREE.Mesh(innerRingGeo, cyanMat);
    innerRing.name = "Inner_Magnetic_Stabilizer";
    reactorGroup.add(innerRing);

    // 3. Copper Coils (10 radial inductor coils)
    const numCoils = 10;
    for (let i = 0; i < numCoils; i++) {
      const angle = (i / numCoils) * Math.PI * 2;
      const coilGeo = new THREE.BoxGeometry(0.2, 0.35, 0.25);
      const coil = new THREE.Mesh(coilGeo, goldMat);
      coil.position.set(Math.cos(angle) * 1.1, Math.sin(angle) * 1.1, 0);
      coil.rotation.z = angle + Math.PI / 2;
      coil.name = `Inductor_Coil_${i + 1}`;
      reactorGroup.add(coil);
    }

    // 4. Secondary Accelerator Torus
    const midRingGeo = new THREE.TorusGeometry(1.35, 0.06, 16, 64);
    const midRing = new THREE.Mesh(midRingGeo, blueMat);
    midRing.name = "Flux_Compression_Torus";
    reactorGroup.add(midRing);

    // 5. Outer Armor Brackets (6 segmented exterior casing shields)
    const numBrackets = 6;
    for (let i = 0; i < numBrackets; i++) {
      const angle = (i / numBrackets) * Math.PI * 2;
      const bracketGeo = new THREE.CylinderGeometry(1.7, 1.7, 0.2, 8, 1, false, angle - 0.2, 0.4);
      const bracket = new THREE.Mesh(bracketGeo, cyanMat);
      bracket.rotation.x = Math.PI / 2;
      bracket.name = `Armor_Segment_${i + 1}`;
      reactorGroup.add(bracket);
    }

    // 6. Rear Power Bus Coupling
    const rearCapGeo = new THREE.CylinderGeometry(0.6, 0.7, 0.3, 32);
    const rearCap = new THREE.Mesh(rearCapGeo, blueMat);
    rearCap.rotation.x = Math.PI / 2;
    rearCap.position.z = -0.35;
    rearCap.name = "Rear_Power_Coupling";
    reactorGroup.add(rearCap);

    // 7. Front Protective Lens Retainer
    const frontLensGeo = new THREE.TorusGeometry(1.55, 0.04, 16, 64);
    const frontLens = new THREE.Mesh(frontLensGeo, cyanMat);
    frontLens.position.z = 0.25;
    frontLens.name = "Front_Focusing_Lens_Retainer";
    reactorGroup.add(frontLens);

    this.scene.add(reactorGroup);
    this.currentModel = reactorGroup;
    this.exploder.registerModel(this.currentModel);
    return reactorGroup;
  }

  loadGLTF(arrayBuffer) {
    if (!window.THREE.GLTFLoader) {
      console.error("GLTFLoader not ready");
      return;
    }
    const loader = new window.THREE.GLTFLoader();
    loader.parse(arrayBuffer, '', (gltf) => {
      if (this.currentModel) {
        this.scene.remove(this.currentModel);
      }
      const model = gltf.scene;

      // Apply holographic material styling
      model.traverse((child) => {
        if (child.isMesh) {
          child.material = this.getHologramMaterial(0x00f0ff, 0.85);
        }
      });

      // Center and normalize scale
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.8 / maxDim;
      model.scale.setScalar(scale);

      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.sub(center.multiplyScalar(scale));

      this.scene.add(model);
      this.currentModel = model;
      this.exploder.registerModel(this.currentModel);
    }, (error) => {
      console.error("Error parsing GLTF model:", error);
    });
  }

  applyExplosion(factor) {
    this.exploder.setExplosionFactor(factor);
  }

  rotateModel(deltaX, deltaY) {
    this.targetRotation.y += deltaX * 0.005;
    this.targetRotation.x += deltaY * 0.005;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.currentModel) {
      // Smooth interpolation for hologram rotation
      this.currentModel.rotation.y += (this.targetRotation.y - this.currentModel.rotation.y) * 0.1;
      this.currentModel.rotation.x += (this.targetRotation.x - this.currentModel.rotation.x) * 0.1;
      
      // Subtle hovering idle animation
      this.currentModel.position.y = Math.sin(Date.now() * 0.0015) * 0.08;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
