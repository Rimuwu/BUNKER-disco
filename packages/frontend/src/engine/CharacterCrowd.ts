import * as THREE from 'three';
import { CharacterFactory, type ICharacterModel, type CharacterAnimationState } from './CharacterFactory';

export interface ICrowdSlot {
  index: number;
  tier: 1 | 2;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  occupiedBy?: string; // playerId
}

export class CharacterCrowd {
  private scene: THREE.Scene;
  private characters = new Map<string, { model: ICharacterModel; hudSprite: THREE.Sprite }>();
  public slots: ICrowdSlot[] = [];
  public speakerPodiumPosition = new THREE.Vector3(0, 0, 2);

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initSlots();
  }

  private initSlots() {
    this.slots = [];
    const campfireCenter = new THREE.Vector3(0, 0, -4);

    // Tier 1: 12 slots, radius 8m, y = 0
    const tier1Radius = 8.0;
    const tier1StartAngle = Math.PI * 0.15;
    const tier1EndAngle = Math.PI * 0.85;

    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      const angle = tier1StartAngle + t * (tier1EndAngle - tier1StartAngle);
      const x = campfireCenter.x + Math.cos(angle) * tier1Radius;
      const z = campfireCenter.z + Math.sin(angle) * tier1Radius;

      this.slots.push({
        index: i,
        tier: 1,
        position: new THREE.Vector3(x, 0, z),
        lookAt: campfireCenter.clone()
      });
    }

    // Tier 2: 12 slots, radius 12m, elevated y = 1.0m
    const tier2Radius = 12.0;
    const tier2StartAngle = Math.PI * 0.1;
    const tier2EndAngle = Math.PI * 0.9;

    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      const angle = tier2StartAngle + t * (tier2EndAngle - tier2StartAngle);
      const x = campfireCenter.x + Math.cos(angle) * tier2Radius;
      const z = campfireCenter.z + Math.sin(angle) * tier2Radius;

      this.slots.push({
        index: i + 12,
        tier: 2,
        position: new THREE.Vector3(x, 1.0, z),
        lookAt: campfireCenter.clone()
      });
    }
  }

  public syncPlayers(
    players: Array<{
      playerId: string;
      nickname: string;
      avatarSeed?: string;
      professionId?: string;
      isEliminated?: boolean;
    }>,
    activeSpeakerId: string | null = null
  ) {
    const currentIds = new Set(players.map((p) => p.playerId));

    // Remove characters that left
    for (const [id, entry] of this.characters.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(entry.model.group);
        this.scene.remove(entry.hudSprite);
        this.characters.delete(id);
      }
    }

    // Clear slot assignments
    this.slots.forEach((s) => (s.occupiedBy = undefined));

    // Position and update each player
    players.forEach((p, index) => {
      let entry = this.characters.get(p.playerId);
      if (!entry) {
        const model = CharacterFactory.createCharacter(
          p.nickname,
          p.avatarSeed || p.playerId,
          p.professionId
        );
        const hudSprite = this.createHudSprite(p.nickname, p.professionId);
        this.scene.add(model.group);
        this.scene.add(hudSprite);
        entry = { model, hudSprite };
        this.characters.set(p.playerId, entry);
      }

      if (p.isEliminated) {
        entry.model.state = 'die';
        entry.model.baseY = 0;
        // Move outside/off to the side
        entry.model.group.position.set(-18 + index * 1.5, 0, 15);
        entry.model.group.lookAt(-18 + index * 1.5, 0, 30);
      } else if (p.playerId === activeSpeakerId) {
        entry.model.state = 'talk';
        entry.model.baseY = this.speakerPodiumPosition.y;
        entry.model.group.position.copy(this.speakerPodiumPosition);
        entry.model.group.lookAt(0, 0, -4);
      } else {
        entry.model.state = 'idle';
        const slotIdx = Math.min(index, this.slots.length - 1);
        const slot = this.slots[slotIdx];
        slot.occupiedBy = p.playerId;
        entry.model.baseY = slot.position.y;
        entry.model.group.position.copy(slot.position);
        entry.model.group.lookAt(slot.lookAt);
      }

      // Update HUD Billboard Sprite position above head
      entry.hudSprite.position.set(
        entry.model.group.position.x,
        entry.model.group.position.y + 2.2,
        entry.model.group.position.z
      );
    });
  }

  private createHudSprite(nickname: string, professionId?: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(13, 13, 26, 0.85)';
      ctx.fillRect(0, 0, 256, 64);
      ctx.strokeStyle = '#ffc700';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 252, 60);

      ctx.font = 'bold 22px monospace';
      ctx.fillStyle = '#f3f4f6';
      ctx.textAlign = 'center';
      ctx.fillText(nickname.slice(0, 14), 128, 28);

      if (professionId) {
        ctx.font = '14px monospace';
        ctx.fillStyle = '#ffc700';
        ctx.fillText(professionId.toUpperCase().slice(0, 20), 128, 50);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.0, 0.5, 1.0);
    sprite.matrixAutoUpdate = true;
    return sprite;
  }

  public setCharacterState(playerId: string, state: CharacterAnimationState) {
    const entry = this.characters.get(playerId);
    if (entry) {
      entry.model.state = state;
    }
  }

  public update(deltaTime: number) {
    for (const [_, entry] of this.characters) {
      CharacterFactory.animateCharacter(entry.model, deltaTime);
      entry.hudSprite.position.set(
        entry.model.group.position.x,
        entry.model.group.position.y + 2.2,
        entry.model.group.position.z
      );
    }
  }

  public getCharacterPosition(playerId: string): THREE.Vector3 | null {
    const entry = this.characters.get(playerId);
    return entry ? entry.model.group.position.clone() : null;
  }

  public dispose() {
    for (const [_, entry] of this.characters) {
      this.scene.remove(entry.model.group);
      this.scene.remove(entry.hudSprite);
    }
    this.characters.clear();
  }
}
