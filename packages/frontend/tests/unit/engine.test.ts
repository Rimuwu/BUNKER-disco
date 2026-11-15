import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { CameraDirector } from '@/engine/CameraDirector';
import { CharacterFactory } from '@/engine/CharacterFactory';
import { CharacterCrowd } from '@/engine/CharacterCrowd';
import { BunkerBuilder } from '@/engine/BunkerBuilder';
import { FogOfWarShader } from '@/engine/FogOfWarShader';

describe('Three.js Voxel Engine Unit Tests', () => {
  describe('CameraDirector', () => {
    it('initializes in SURFACE_WIDE mode with target vectors', () => {
      const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.5, 1000);
      const director = new CameraDirector(camera);

      expect(director.currentMode).toBe('SURFACE_WIDE');
      expect(camera.position.x).toBe(0);
      expect(camera.position.y).toBe(18);
      expect(camera.position.z).toBe(32);
      expect(camera.fov).toBe(40);
    });

    it('transitions smoothly between cinematic modes with Cubic.Out easing', () => {
      const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.5, 1000);
      const director = new CameraDirector(camera);

      // Transition to VOTE_ARENA
      director.toVotingArena(1.0);
      expect(director.currentMode).toBe('VOTE_ARENA');
      expect(director.targetPosition.y).toBe(25);
      expect(director.targetPosition.z).toBe(20);
      expect(director.targetFov).toBe(45);

      // Advance delta time 0.5s (50% progress)
      director.update(0.5);
      expect(camera.position.y).toBeGreaterThan(18);
      expect(camera.position.y).toBeLessThan(25);

      // Advance remaining time to complete transition
      director.update(0.6);
      expect(camera.position.y).toBeCloseTo(25, 1);
      expect(camera.position.z).toBeCloseTo(20, 1);
      expect(camera.fov).toBeCloseTo(45, 1);
    });

    it('focuses on active speaker with narrow 32 degree FOV offset', () => {
      const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.5, 1000);
      const director = new CameraDirector(camera);

      const speakerPos = new THREE.Vector3(2, 0, 5);
      director.focusOnSpeaker(speakerPos, 1.0);

      expect(director.currentMode).toBe('SPEAKER_FOCUS');
      expect(director.targetPosition.x).toBe(6); // 2 + 4
      expect(director.targetPosition.y).toBe(3); // 0 + 3
      expect(director.targetPosition.z).toBe(13); // 5 + 8
      expect(director.targetFov).toBe(32);
    });

    it('switches to BUNKER_OVERVIEW showing isometric subterranean cross-section', () => {
      const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.5, 1000);
      const director = new CameraDirector(camera);

      director.toBunkerOverview(new THREE.Vector3(0, 0, -10), 30, 1.0);
      expect(director.currentMode).toBe('BUNKER_OVERVIEW');
      expect(director.targetPosition.x).toBe(35);
      expect(director.targetPosition.y).toBe(15);
      expect(director.targetPosition.z).toBe(35);
    });

    it('triggers screen shake with damping and resets to baseline position', () => {
      const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.5, 1000);
      const director = new CameraDirector(camera);

      const initialPos = camera.position.clone();
      director.triggerShake(1.5, 500); // 500ms shake

      // During shake, position varies
      director.update(0.1);
      // Completing shake resets strictly to baseline
      director.update(0.5);
      expect(camera.position.x).toBe(initialPos.x);
      expect(camera.position.y).toBe(initialPos.y);
      expect(camera.position.z).toBe(initialPos.z);
    });
  });

  describe('CharacterFactory', () => {
    it('procedurally builds 25-voxel chibi avatar hierarchy with hat/accessory', () => {
      const model = CharacterFactory.createCharacter('Доктор', 'seed_123', 'doctor');

      expect(model.nickname).toBe('Доктор');
      expect(model.group).toBeDefined();
      expect(model.head).toBeDefined();
      expect(model.torso).toBeDefined();
      expect(model.leftArm).toBeDefined();
      expect(model.rightArm).toBeDefined();
      expect(model.leftLeg).toBeDefined();
      expect(model.rightLeg).toBeDefined();
      expect(model.accessory).toBeDefined();

      // Ensure all parts are attached to the group
      expect(model.group.children.length).toBeGreaterThanOrEqual(7);
    });

    it('executes 6 procedural animation loops without errors', () => {
      const model = CharacterFactory.createCharacter('Тестер', 'seed_anim');

      const animationStates: Array<'idle' | 'walk' | 'talk' | 'shock' | 'work' | 'die'> = [
        'idle',
        'walk',
        'talk',
        'shock',
        'work',
        'die'
      ];

      animationStates.forEach((state) => {
        model.state = state;
        CharacterFactory.animateCharacter(model, 0.016);
        expect(model.animTime).toBeGreaterThan(0);
      });
    });
  });

  describe('CharacterCrowd', () => {
    it('initializes 24 crowd positioning slots in 2 amphitheater tiers', () => {
      const scene = new THREE.Scene();
      const crowd = new CharacterCrowd(scene);

      expect(crowd.slots.length).toBe(24);

      // Tier 1: slots 0-11 at y = 0
      for (let i = 0; i < 12; i++) {
        expect(crowd.slots[i].tier).toBe(1);
        expect(crowd.slots[i].position.y).toBe(0);
      }

      // Tier 2: slots 12-23 at y = 1.0 (elevated for > 12 players)
      for (let i = 12; i < 24; i++) {
        expect(crowd.slots[i].tier).toBe(2);
        expect(crowd.slots[i].position.y).toBe(1.0);
      }
    });

    it('positions up to 20 players and assigns active speaker to podium (0, 0, 2)', () => {
      const scene = new THREE.Scene();
      const crowd = new CharacterCrowd(scene);

      const players = Array.from({ length: 15 }, (_, i) => ({
        playerId: `p_${i}`,
        nickname: `Игрок ${i}`,
        avatarSeed: `seed_${i}`,
        isEliminated: false
      }));

      crowd.syncPlayers(players, 'p_3');

      // p_3 is speaker -> placed at podium
      const speakerPos = crowd.getCharacterPosition('p_3');
      expect(speakerPos?.x).toBe(0);
      expect(speakerPos?.y).toBe(0);
      expect(speakerPos?.z).toBe(2);

      // p_14 is player 15 -> placed on Tier 2
      const p14Pos = crowd.getCharacterPosition('p_14');
      expect(p14Pos?.y).toBe(1.0);

      // Verify Tier 2 elevation is strictly retained across animation updates
      crowd.update(0.1);
      const p14PosAfterUpdate = crowd.getCharacterPosition('p_14');
      expect(p14PosAfterUpdate?.y).toBe(1.0);
    });
  });

  describe('BunkerBuilder', () => {
    it('constructs catalog of 16 modular bunker rooms with greedy meshing slabs', () => {
      const scene = new THREE.Scene();
      const builder = new BunkerBuilder(scene);

      expect(builder.rooms.size).toBe(16);
      expect(builder.rooms.has('room_01_airlock')).toBe(true);
      expect(builder.rooms.has('room_02_hydroponics')).toBe(true);
      expect(builder.rooms.has('room_16_incinerator_waste_disposal')).toBe(true);
    });

    it('reveals room and updates crisis statuses', () => {
      const scene = new THREE.Scene();
      const builder = new BunkerBuilder(scene);

      const hydro = builder.rooms.get('room_02_hydroponics');
      expect(hydro?.def.isRevealed).toBe(false);

      builder.revealRoom('room_02_hydroponics');
      expect(hydro?.def.isRevealed).toBe(true);
      expect(hydro?.meshGroup.visible).toBe(true);

      builder.setRoomStatus('room_02_hydroponics', 'fire');
      expect(hydro?.def.status).toBe('fire');
      expect(hydro?.light.color.getHex()).toBe(0xf97316);
    });
  });

  describe('FogOfWarShader', () => {
    it('burns circular hole in mask canvas on room discovery', () => {
      const scene = new THREE.Scene();
      const fow = new FogOfWarShader(scene, 60, 60);

      expect(fow.mesh).toBeDefined();
      expect(fow.maskCanvas).toBeDefined();

      const burnPos = new THREE.Vector3(10, 0, -5);
      fow.burnHoleInFog(burnPos, 4.0);

      expect(fow.maskTexture.version).toBeGreaterThan(0);
    });
  });
});
