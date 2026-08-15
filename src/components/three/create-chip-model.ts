/**
 * Procedural CPU chip package — the img2threejs reference object for the
 * HardTech preloader.
 *
 * Decision record (see preload-sequence.tsx for the full writeup): the
 * HardTech mark (public/images/brand/hardtech-logo.png) is a flat 2D badge —
 * a gear outline, PCB trace linework, an Android/Apple glyph pair, and two
 * lines of set type, all on a transparent plane with no depth cues. There is
 * no volume to sculpt: extruding it would produce a coin-shaped medallion
 * whose "3D-ness" reads as a bevel, not a form. Per the skill's fallback for
 * flat marks, this factory instead builds a generic technology object that
 * *does* have a real three-dimensional identity — a QFP-style CPU package —
 * finished in HardTech's brand green.
 *
 * This is code-only procedural geometry: primitives + one instanced mesh for
 * the lead pins. No imported mesh, texture, or GLB asset.
 *
 * Identity-defining features reproduced from a real CPU package (the
 * reference *class*, not a specific photograph):
 *  - a substrate/PCB base plate
 *  - a raised lid/heatspreader
 *  - a glowing die visible through the lid opening (brand green, this is the
 *    HardTech-specific reskin of the reference class)
 *  - right-angle PCB trace linework on the exposed substrate margin
 *  - a ring of lead pins around all four edges (instanced, not hand-placed)
 *  - a pin-1 orientation indicator at one corner
 *
 * `createChipModel()` returns a factory result, not a renderer object, so
 * the render loop (chip-scene.tsx) never has to know how the group was
 * assembled — matching the architecture rule that presentational/render code
 * stays separate from the object's reconstruction data.
 */

import * as THREE from "three";

const NEON = 0x4ade80; // --neon dark theme value, see globals.css

export type ChipModel = {
  group: THREE.Group;
  /** Releases every geometry/material this factory allocated. Call on unmount. */
  dispose: () => void;
};

export function createChipModel(): ChipModel {
  const disposables: Array<{ dispose: () => void }> = [];
  const track = <T extends { dispose: () => void }>(resource: T): T => {
    disposables.push(resource);
    return resource;
  };

  const root = new THREE.Group();
  root.name = "hardtech-chip";

  // --- substrate (PCB base) ---------------------------------------------
  const substrateGeo = track(new THREE.BoxGeometry(2.2, 0.2, 2.2));
  const substrateMat = track(
    new THREE.MeshStandardMaterial({ color: 0x2a3542, metalness: 0.3, roughness: 0.55 }),
  );
  const substrate = new THREE.Mesh(substrateGeo, substrateMat);
  substrate.name = "substrate";
  substrate.position.y = 0;
  root.add(substrate);

  // --- lid / heatspreader --------------------------------------------------
  const lidGeo = track(new THREE.BoxGeometry(1.5, 0.14, 1.5));
  const lidMat = track(
    new THREE.MeshStandardMaterial({ color: 0x36434f, metalness: 0.5, roughness: 0.3 }),
  );
  const lid = new THREE.Mesh(lidGeo, lidMat);
  lid.name = "lid";
  lid.position.y = 0.1 + 0.07;
  root.add(lid);

  // --- glowing die, visible through the lid opening ------------------------
  const coreGeo = track(new THREE.BoxGeometry(0.86, 0.05, 0.86));
  const coreMat = track(
    new THREE.MeshStandardMaterial({
      color: NEON,
      emissive: NEON,
      emissiveIntensity: 2.4,
      metalness: 0.1,
      roughness: 0.25,
    }),
  );
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.name = "die";
  core.position.y = 0.1 + 0.14 + 0.025 + 0.001;
  root.add(core);

  // --- PCB trace linework on the exposed substrate margin -------------------
  const traceMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x24392e,
      emissive: NEON,
      emissiveIntensity: 0.9,
      metalness: 0.2,
      roughness: 0.5,
    }),
  );
  const traceY = 0.1 + 0.002;
  const traceThickness = 0.035;
  const traceHeight = 0.02;

  type TraceSegment = { length: number; x: number; z: number; rotY: number };
  const segments: TraceSegment[] = [];
  // Four traces, one per edge, each an "L": a stub off the lid edge, then a
  // run parallel to the edge toward that side's pin row.
  const armLength = 0.42;
  const runLength = 0.5;
  const offsets = [0.32, -0.32];
  for (const side of [0, 1, 2, 3]) {
    for (const offset of offsets) {
      const angle = (side * Math.PI) / 2;
      const dirX = Math.cos(angle);
      const dirZ = Math.sin(angle);
      const perpX = -dirZ;
      const perpZ = dirX;
      const armStartX = dirX * 0.75 + perpX * offset;
      const armStartZ = dirZ * 0.75 + perpZ * offset;
      const armMidX = dirX * (0.75 + armLength / 2);
      const armMidZ = dirZ * (0.75 + armLength / 2);
      segments.push({ length: armLength, x: armMidX, z: armMidZ, rotY: -angle });

      const runStartX = dirX * (0.75 + armLength);
      const runStartZ = dirZ * (0.75 + armLength);
      const runMidX = runStartX + perpX * (runLength / 2) * Math.sign(offset || 1);
      const runMidZ = runStartZ + perpZ * (runLength / 2) * Math.sign(offset || 1);
      segments.push({
        length: runLength,
        x: runMidX,
        z: runMidZ,
        rotY: -angle - Math.PI / 2,
      });
      void armStartX;
      void armStartZ;
    }
  }

  const traceGroup = new THREE.Group();
  traceGroup.name = "traces";
  for (const seg of segments) {
    const geo = track(new THREE.BoxGeometry(seg.length, traceHeight, traceThickness));
    const mesh = new THREE.Mesh(geo, traceMat);
    mesh.position.set(seg.x, traceY, seg.z);
    mesh.rotation.y = seg.rotY;
    traceGroup.add(mesh);
  }
  root.add(traceGroup);

  // --- lead pins, instanced around all four edges ---------------------------
  const pinsPerSide: number = 10;
  const pinCount = pinsPerSide * 4;
  const pinGeo = track(new THREE.BoxGeometry(0.16, 0.05, 0.045));
  const pinMat = track(
    new THREE.MeshStandardMaterial({ color: 0xb9c1c9, metalness: 0.85, roughness: 0.3 }),
  );
  const pins = new THREE.InstancedMesh(pinGeo, pinMat, pinCount);
  pins.name = "pins";
  const dummy = new THREE.Object3D();
  const edge = 1.1;
  const pinReach = 0.12;
  const span = 1.9; // pin row length along an edge, centered
  let instanceIndex = 0;
  for (let side = 0; side < 4; side++) {
    const angle = (side * Math.PI) / 2;
    const dirX = Math.cos(angle);
    const dirZ = Math.sin(angle);
    const perpX = -dirZ;
    const perpZ = dirX;
    for (let i = 0; i < pinsPerSide; i++) {
      const t = pinsPerSide === 1 ? 0 : i / (pinsPerSide - 1) - 0.5;
      const alongX = perpX * t * span;
      const alongZ = perpZ * t * span;
      const px = dirX * (edge + pinReach) + alongX;
      const pz = dirZ * (edge + pinReach) + alongZ;
      dummy.position.set(px, 0, pz);
      dummy.rotation.set(0, -angle, 0);
      dummy.updateMatrix();
      pins.setMatrixAt(instanceIndex, dummy.matrix);
      instanceIndex++;
    }
  }
  pins.instanceMatrix.needsUpdate = true;
  root.add(pins);

  // --- pin-1 orientation indicator ------------------------------------------
  const pin1Geo = track(new THREE.SphereGeometry(0.055, 12, 10));
  const pin1Mat = track(
    new THREE.MeshStandardMaterial({ color: NEON, emissive: NEON, emissiveIntensity: 2.2 }),
  );
  const pin1 = new THREE.Mesh(pin1Geo, pin1Mat);
  pin1.name = "pin1-indicator";
  pin1.position.set(-0.98, 0.11, -0.98);
  root.add(pin1);

  const dispose = () => {
    for (const resource of disposables) resource.dispose();
  };

  return { group: root, dispose };
}
