import * as THREE from 'three';

export type BlastDoorState = 'SEALED' | 'OPENING' | 'LOCKDOWN';

export class SurfaceScene {
  public group: THREE.Group;
  private scene: THREE.Scene;

  // Campfire components
  private campfireLight: THREE.PointLight;
  private emberParticles: THREE.Points;
  private emberPositions: Float32Array;
  private emberVelocities: Float32Array;
  private emberLifetimes: Float32Array;
  private particleCount = 80;

  // Blast Door components
  public blastDoorMesh: THREE.Group;
  public doorState: BlastDoorState = 'SEALED';
  private hydraulicCylinders: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'surface_scene';

    // 1. Ground plane
    this.createGround();

    // 2. Pine trees
    this.createForest();

    // 3. Campfire & sparks
    this.campfireLight = new THREE.PointLight(0xff7722, 2.0, 15);
    this.campfireLight.position.set(0, 0.8, -4);
    this.campfireLight.castShadow = true;
    this.group.add(this.campfireLight);

    const { points, pos, vel, life } = this.createEmberParticles();
    this.emberParticles = points;
    this.emberPositions = pos;
    this.emberVelocities = vel;
    this.emberLifetimes = life;
    this.group.add(this.emberParticles);
    this.createCampfireLogs();

    // 4. Hermetic Blast Door
    this.blastDoorMesh = this.createBlastDoor();
    this.group.add(this.blastDoorMesh);

    // 5. Speaker Podium
    this.createSpeakerPodium();

    this.scene.add(this.group);
  }

  private createGround() {
    const groundGeo = new THREE.PlaneGeometry(60, 60, 30, 30);
    groundGeo.rotateX(-Math.PI / 2);

    // Weathered apocalyptic dirt / ash color
    const groundMat = new THREE.MeshLambertMaterial({
      color: 0x1f2421
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    ground.position.y = -0.01;
    this.group.add(ground);
  }

  private createForest() {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x3d2817 });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x223824 });

    const treePositions = [
      [-16, -10], [-20, 0], [-18, 12], [-14, 20],
      [16, -10], [20, 0], [18, 12], [14, 20],
      [-10, 24], [10, 24], [-22, -18], [22, -18]
    ];

    const count = treePositions.length;
    const trunkGeo = new THREE.BoxGeometry(0.8, 4.0, 0.8);
    const foliage1Geo = new THREE.BoxGeometry(3.0, 1.8, 3.0);
    const foliage2Geo = new THREE.BoxGeometry(2.0, 1.6, 2.0);

    const trunkInstanced = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
    const foliage1Instanced = new THREE.InstancedMesh(foliage1Geo, leafMat, count);
    const foliage2Instanced = new THREE.InstancedMesh(foliage2Geo, leafMat, count);

    trunkInstanced.name = 'forest_trunks_instanced';
    foliage1Instanced.name = 'forest_foliage1_instanced';
    foliage2Instanced.name = 'forest_foliage2_instanced';

    trunkInstanced.castShadow = true;
    foliage1Instanced.castShadow = true;
    foliage2Instanced.castShadow = true;

    const dummy = new THREE.Object3D();

    treePositions.forEach(([x, z], i) => {
      // Voxel trunk
      dummy.position.set(x, 2.0, z);
      dummy.scale.set(1, 1, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      trunkInstanced.setMatrixAt(i, dummy.matrix);

      // Foliage layer 1
      dummy.position.set(x, 4.5, z);
      dummy.updateMatrix();
      foliage1Instanced.setMatrixAt(i, dummy.matrix);

      // Foliage layer 2
      dummy.position.set(x, 5.8, z);
      dummy.updateMatrix();
      foliage2Instanced.setMatrixAt(i, dummy.matrix);
    });

    trunkInstanced.instanceMatrix.needsUpdate = true;
    foliage1Instanced.instanceMatrix.needsUpdate = true;
    foliage2Instanced.instanceMatrix.needsUpdate = true;

    this.group.add(trunkInstanced);
    this.group.add(foliage1Instanced);
    this.group.add(foliage2Instanced);
  }

  private createCampfireLogs() {
    const logMat = new THREE.MeshLambertMaterial({ color: 0x2e1a0d });
    const logGeo = new THREE.BoxGeometry(0.4, 0.4, 1.8);

    for (let i = 0; i < 4; i++) {
      const log = new THREE.Mesh(logGeo, logMat);
      log.position.set(0, 0.2, -4);
      log.rotation.y = (i * Math.PI) / 4;
      log.rotation.z = (Math.random() - 0.5) * 0.2;
      log.castShadow = true;
      this.group.add(log);
    }
  }

  private createEmberParticles() {
    const count = this.particleCount;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const life = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.6;
      pos[i * 3 + 1] = 0.2 + Math.random() * 0.4;
      pos[i * 3 + 2] = -4 + (Math.random() - 0.5) * 0.6;

      vel[i * 3] = (Math.random() - 0.5) * 0.4;
      vel[i * 3 + 1] = 0.8 + Math.random() * 1.2;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

      life[i] = Math.random() * 2.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffaa33,
      size: 0.15,
      transparent: true,
      opacity: 0.85
    });

    const points = new THREE.Points(geo, mat);
    return { points, pos, vel, life };
  }

  private createBlastDoor(): THREE.Group {
    const doorGroup = new THREE.Group();
    doorGroup.name = 'blast_door';
    doorGroup.position.set(0, 0, -18);

    // Concrete reinforced portal surround
    const archMat = new THREE.MeshLambertMaterial({ color: 0x374151 });
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(14, 3, 2), archMat);
    archTop.position.set(0, 7.5, 0);
    archTop.castShadow = true;
    doorGroup.add(archTop);

    const archLeft = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 2), archMat);
    archLeft.position.set(-5, 3, 0);
    doorGroup.add(archLeft);

    const archRight = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 2), archMat);
    archRight.position.set(5, 3, 0);
    doorGroup.add(archRight);

    // Heavy vault door leaf with hazard yellow-black stripes
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 1.2), doorMat);
    doorLeaf.position.set(0, 3, 0);
    doorLeaf.castShadow = true;
    doorGroup.add(doorLeaf);

    // Hazard stripe band across door
    const stripeMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(8.05, 0.6, 1.25), stripeMat);
    stripe.position.set(0, 3, 0);
    doorGroup.add(stripe);

    // Hydraulic locking bolts
    const boltMat = new THREE.MeshLambertMaterial({ color: 0x9ca3af });
    for (let i = 0; i < 4; i++) {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.8), boltMat);
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(i % 2 === 0 ? -4.2 : 4.2, 1.5 + (i > 1 ? 3 : 0), 0);
      doorGroup.add(bolt);
      this.hydraulicCylinders.push(bolt);
    }

    return doorGroup;
  }

  private createSpeakerPodium() {
    const podiumMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    const podiumGeo = new THREE.BoxGeometry(2.4, 0.4, 2.0);
    const podium = new THREE.Mesh(podiumGeo, podiumMat);
    podium.position.set(0, 0.2, 2);
    podium.receiveShadow = true;
    this.group.add(podium);

    // Lectern / microphone stand
    const standMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 0.3), standMat);
    stand.position.set(0, 1.0, 1.4);
    stand.castShadow = true;
    this.group.add(stand);
  }

  public setDoorState(state: BlastDoorState) {
    this.doorState = state;
    if (state === 'OPENING') {
      this.blastDoorMesh.position.y = 4.0;
    } else {
      this.blastDoorMesh.position.y = 0;
    }
  }

  public update(deltaTime: number) {
    // 1. Flicker campfire light
    const noise = Math.sin(Date.now() * 0.015) * 0.4 + Math.cos(Date.now() * 0.027) * 0.3;
    this.campfireLight.intensity = 2.0 + noise;

    // 2. Update ember particles
    const pos = this.emberPositions;
    const vel = this.emberVelocities;
    const life = this.emberLifetimes;
    const count = this.particleCount;

    for (let i = 0; i < count; i++) {
      life[i] -= deltaTime;
      if (life[i] <= 0) {
        // Recycle particle
        pos[i * 3] = (Math.random() - 0.5) * 0.6;
        pos[i * 3 + 1] = 0.2;
        pos[i * 3 + 2] = -4 + (Math.random() - 0.5) * 0.6;
        life[i] = 1.5 + Math.random() * 1.0;
      } else {
        pos[i * 3] += vel[i * 3] * deltaTime;
        pos[i * 3 + 1] += vel[i * 3 + 1] * deltaTime;
        pos[i * 3 + 2] += vel[i * 3 + 2] * deltaTime;
      }
    }

    this.emberParticles.geometry.attributes.position.needsUpdate = true;
  }

  public dispose() {
    this.scene.remove(this.group);
  }
}
