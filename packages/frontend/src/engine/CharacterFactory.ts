import * as THREE from 'three';

export type CharacterAnimationState =
  | 'idle'
  | 'walk'
  | 'talk'
  | 'shock'
  | 'work'
  | 'die';

export interface ICharacterModel {
  group: THREE.Group;
  head: THREE.Mesh;
  torso: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  accessory?: THREE.Mesh;
  state: CharacterAnimationState;
  animTime: number;
  seed: string;
  professionId?: string;
  nickname: string;
  baseY?: number;
}

export class CharacterFactory {
  // Common reusable box geometries for 25-voxel chibi proportions
  private static voxelSize = 0.2; // 20cm per voxel unit
  private static headGeo = new THREE.BoxGeometry(
    CharacterFactory.voxelSize * 2,
    CharacterFactory.voxelSize * 2,
    CharacterFactory.voxelSize * 2
  );
  private static torsoGeo = new THREE.BoxGeometry(
    CharacterFactory.voxelSize * 2,
    CharacterFactory.voxelSize * 3,
    CharacterFactory.voxelSize * 2
  );
  private static limbGeo = new THREE.BoxGeometry(
    CharacterFactory.voxelSize * 1,
    CharacterFactory.voxelSize * 3,
    CharacterFactory.voxelSize * 1
  );
  private static hatGeo = new THREE.BoxGeometry(
    CharacterFactory.voxelSize * 2.4,
    CharacterFactory.voxelSize * 0.8,
    CharacterFactory.voxelSize * 2.4
  );

  private static skinColors = [0xffdfc4, 0xf0c59e, 0xd2996c, 0xa1653e, 0x5c3826];
  private static hairColors = [0x1a1a1a, 0x4a2e18, 0x8b5a2b, 0xd4af37, 0x808080];
  private static clothColors = [0x2563eb, 0x059669, 0xd97706, 0xdc2626, 0x7c3aed, 0x4b5563];

  private static hashSeed(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  public static createCharacter(
    nickname: string,
    seed: string = 'survivor',
    professionId?: string
  ): ICharacterModel {
    const group = new THREE.Group();
    group.name = `character_${nickname}`;

    const hash = this.hashSeed(seed + (professionId || ''));
    const skinColor = this.skinColors[hash % this.skinColors.length];
    const hairColor = this.hairColors[(hash >> 2) % this.hairColors.length];
    const clothColor = this.clothColors[(hash >> 4) % this.clothColors.length];

    const skinMat = new THREE.MeshLambertMaterial({ color: skinColor });
    const hairMat = new THREE.MeshLambertMaterial({ color: hairColor });
    const clothMat = new THREE.MeshLambertMaterial({ color: clothColor });
    const darkPantsMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 });

    const vs = this.voxelSize;

    // Torso: center around y = 0.9 (height 0.6)
    const torso = new THREE.Mesh(this.torsoGeo, clothMat);
    torso.position.set(0, vs * 4.5, 0);
    torso.castShadow = true;
    group.add(torso);

    // Head: above torso around y = 1.4 (height 0.4)
    const head = new THREE.Mesh(this.headGeo, skinMat);
    head.position.set(0, vs * 7.0, 0);
    head.castShadow = true;
    group.add(head);

    // Hair / Hat accessory
    const accessory = new THREE.Mesh(this.hatGeo, hairMat);
    accessory.position.set(0, vs * 8.0, 0);
    accessory.castShadow = true;
    group.add(accessory);

    // Legs
    const leftLeg = new THREE.Mesh(this.limbGeo, darkPantsMat);
    leftLeg.position.set(-vs * 0.55, vs * 1.5, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(this.limbGeo, darkPantsMat);
    rightLeg.position.set(vs * 0.55, vs * 1.5, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Arms
    const leftArm = new THREE.Mesh(this.limbGeo, clothMat);
    leftArm.position.set(-vs * 1.55, vs * 4.5, 0);
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(this.limbGeo, clothMat);
    rightArm.position.set(vs * 1.55, vs * 4.5, 0);
    rightArm.castShadow = true;
    group.add(rightArm);

    return {
      group,
      head,
      torso,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      accessory,
      state: 'idle',
      animTime: Math.random() * 5,
      seed,
      professionId,
      nickname
    };
  }

  public static animateCharacter(char: ICharacterModel, deltaTime: number) {
    char.animTime += deltaTime;
    const t = char.animTime;
    const vs = this.voxelSize;
    const baseY = char.baseY ?? 0;

    switch (char.state) {
      case 'idle': {
        // Breathing bob
        const bob = Math.sin(t * 2.5) * 0.02;
        char.head.position.y = vs * 7.0 + bob;
        if (char.accessory) char.accessory.position.y = vs * 8.0 + bob;
        char.torso.position.y = vs * 4.5 + bob * 0.5;
        char.leftArm.rotation.x = Math.sin(t * 2.0) * 0.05;
        char.rightArm.rotation.x = -Math.sin(t * 2.0) * 0.05;
        char.leftLeg.rotation.x = 0;
        char.rightLeg.rotation.x = 0;
        char.group.position.y = baseY;
        break;
      }

      case 'walk': {
        // Pendulum leg & arm swing (amplitude ~25 deg = ~0.44 rad)
        const walkSwing = Math.sin(t * 6.0) * 0.45;
        char.leftLeg.rotation.x = walkSwing;
        char.rightLeg.rotation.x = -walkSwing;
        char.leftArm.rotation.x = -walkSwing * 0.8;
        char.rightArm.rotation.x = walkSwing * 0.8;
        char.group.position.y = baseY + Math.abs(Math.sin(t * 6.0)) * 0.04;
        break;
      }

      case 'talk': {
        // Body gestures and hand waving
        const gesture = Math.sin(t * 4.0) * 0.6;
        char.rightArm.rotation.x = -0.5 + gesture;
        char.rightArm.rotation.z = 0.2;
        char.leftArm.rotation.x = Math.sin(t * 2.5) * 0.2;
        char.torso.rotation.y = Math.sin(t * 2.0) * 0.15;
        char.head.rotation.y = Math.sin(t * 2.5) * 0.2;
        char.leftLeg.rotation.x = 0;
        char.rightLeg.rotation.x = 0;
        char.group.position.y = baseY;
        break;
      }

      case 'shock': {
        // Hopping vertically with arms raised
        const hop = Math.abs(Math.sin(t * 8.0)) * 0.15;
        char.group.position.y = baseY + hop;
        char.leftArm.rotation.x = -2.5;
        char.rightArm.rotation.x = -2.5;
        char.leftArm.rotation.z = -0.3;
        char.rightArm.rotation.z = 0.3;
        char.head.rotation.y = Math.sin(t * 12.0) * 0.2;
        break;
      }

      case 'work': {
        // Leaning forward + hammering motion
        char.torso.rotation.x = 0.25;
        char.head.rotation.x = 0.3;
        const hammer = Math.sin(t * 7.0) * 0.7;
        char.rightArm.rotation.x = -0.8 + hammer;
        char.leftArm.rotation.x = 0.2;
        char.leftLeg.rotation.x = 0;
        char.rightLeg.rotation.x = 0;
        char.group.position.y = baseY;
        break;
      }

      case 'die': {
        // Falling backward
        char.group.rotation.x = Math.min(Math.PI / 2, char.group.rotation.x + deltaTime * 3.0);
        char.leftArm.rotation.x = -1.0;
        char.rightArm.rotation.x = -1.0;
        break;
      }
    }
  }
}
