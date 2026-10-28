/**
 * Exploder: Computes explosion trajectories for complex 3D models or assemblies.
 */
export class Exploder {
  constructor() {
    this.parts = [];
    this.center = new THREE.Vector3();
    this.maxRadius = 1;
  }

  registerModel(rootObject) {
    this.parts = [];
    const box = new THREE.Box3().setFromObject(rootObject);
    box.getCenter(this.center);
    const size = new THREE.Vector3();
    box.getSize(size);
    this.maxRadius = Math.max(size.x, size.y, size.z) * 0.5 || 1;

    // Traverse all mesh parts in the assembly
    rootObject.traverse((node) => {
      if (node.isMesh) {
        // Calculate the individual mesh's world bounding box center
        node.geometry.computeBoundingBox();
        const meshBox = node.geometry.boundingBox.clone();
        const localCenter = new THREE.Vector3();
        meshBox.getCenter(localCenter);

        // Convert to world space to compute directional explosion vector
        const worldCenter = localCenter.clone().applyMatrix4(node.matrixWorld);
        const explosionDir = new THREE.Vector3().subVectors(worldCenter, this.center);

        if (explosionDir.lengthSq() < 0.0001) {
          // If coincident with center, push slightly along random or local normal
          explosionDir.set(
            (Math.random() - 0.5) * 0.5,
            Math.random() * 0.8 + 0.2,
            (Math.random() - 0.5) * 0.5
          );
        }
        explosionDir.normalize();

        this.parts.push({
          mesh: node,
          initialPosition: node.position.clone(),
          initialRotation: node.rotation.clone(),
          direction: explosionDir,
          // Stagger distance factor based on distance from core
          factor: 1.5 + Math.random() * 1.5
        });
      }
    });

    return this.parts.length;
  }

  /**
   * Apply explosion factor [0.0 to 1.0+]
   */
  setExplosionFactor(factor, spreadDistance = 3.0) {
    const clamped = Math.max(0, factor);
    for (const part of this.parts) {
      const offset = part.direction.clone().multiplyScalar(clamped * spreadDistance * part.factor);
      part.mesh.position.copy(part.initialPosition).add(offset);
      
      // Slight outward pitch during explosion for dynamic Iron Man suit effect
      part.mesh.rotation.x = part.initialRotation.x + clamped * 0.2 * part.direction.z;
      part.mesh.rotation.z = part.initialRotation.z - clamped * 0.2 * part.direction.x;
    }
  }

  reset() {
    for (const part of this.parts) {
      part.mesh.position.copy(part.initialPosition);
      part.mesh.rotation.copy(part.initialRotation);
    }
  }
}
