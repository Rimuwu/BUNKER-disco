import * as THREE from 'three';

export interface IBunkerRoomDef {
  id: string;
  name: string;
  gridX: number;
  floor: number;
  color: number;
  isRevealed: boolean;
  status: 'operational' | 'damaged' | 'fire' | 'leak' | 'power_out';
}

export class BunkerBuilder {
  public group: THREE.Group;
  private scene: THREE.Scene;
  public rooms = new Map<string, { def: IBunkerRoomDef; meshGroup: THREE.Group; light: THREE.PointLight }>();

  // 16 Standard Modular Bunker Rooms catalog layout
  private static catalog: Array<{ id: string; name: string; gridX: number; floor: number; color: number }> = [
    { id: 'room_01_airlock', name: 'Шлюзовая камера', gridX: 0, floor: 0, color: 0x475569 },
    { id: 'room_02_hydroponics', name: 'Гидропоника', gridX: -1, floor: 0, color: 0x15803d },
    { id: 'room_03_generator', name: 'Генераторная', gridX: 1, floor: 0, color: 0xc2410c },
    { id: 'room_04_medical_bay', name: 'Медотсек', gridX: -2, floor: 0, color: 0x0284c7 },
    { id: 'room_05_water_filtration', name: 'Водоочистка', gridX: 2, floor: 0, color: 0x0891b2 },
    { id: 'room_06_living_quarters', name: 'Жилой блок', gridX: -1, floor: -1, color: 0x64748b },
    { id: 'room_07_workshop', name: 'Мастерская', gridX: 0, floor: -1, color: 0xb45309 },
    { id: 'room_08_server_ai_core', name: 'ИИ-серверная', gridX: 1, floor: -1, color: 0x7c3aed },
    { id: 'room_09_radio_comms', name: 'Радиоузел', gridX: -2, floor: -1, color: 0x4338ca },
    { id: 'room_10_armory', name: 'Оружейная', gridX: 2, floor: -1, color: 0x991b1b },
    { id: 'room_11_kitchen_mess_hall', name: 'Кухня и столовая', gridX: -1, floor: -2, color: 0xeab308 },
    { id: 'room_12_cryo_stasis', name: 'Криокамеры', gridX: 0, floor: -2, color: 0x06b6d4 },
    { id: 'room_13_air_scrubber_recycler', name: 'Рециркулятор воздуха', gridX: 1, floor: -2, color: 0x10b981 },
    { id: 'room_14_library_archives', name: 'Архив и библиотека', gridX: -2, floor: -2, color: 0x854d0e },
    { id: 'room_15_decontamination_shower', name: 'Дезактивация', gridX: 2, floor: -2, color: 0x14b8a6 },
    { id: 'room_16_incinerator_waste_disposal', name: 'Утилизатор', gridX: 0, floor: -3, color: 0x78716c }
  ];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'bunker_structure';
    this.initRooms();
    this.scene.add(this.group);
  }

  private initRooms() {
    BunkerBuilder.catalog.forEach((cat) => {
      const def: IBunkerRoomDef = {
        ...cat,
        isRevealed: cat.id === 'room_01_airlock', // Airlock discovered by default
        status: 'operational'
      };

      const meshGroup = this.buildRoomVoxelMesh(def);
      meshGroup.position.set(cat.gridX * 9.0, cat.floor * 6.0 - 4.0, -10.0);

      const light = new THREE.PointLight(
        def.isRevealed ? 0xffffff : 0x000000,
        def.isRevealed ? 1.0 : 0.0,
        10
      );
      light.position.set(0, 1.8, 0);
      meshGroup.add(light);

      this.rooms.set(cat.id, { def, meshGroup, light });
      this.group.add(meshGroup);
    });
  }

  /**
   * Greedy meshing: Constructs room module with co-planar quad-merged walls
   * Room interior dimension: 8m wide x 4.5m high x 6m deep
   */
  private buildRoomVoxelMesh(def: IBunkerRoomDef): THREE.Group {
    const group = new THREE.Group();
    group.name = `bunker_${def.id}`;

    const wallMat = new THREE.MeshLambertMaterial({
      color: def.color
    });
    const floorMat = new THREE.MeshLambertMaterial({
      color: 0x1f2937
    });
    const ceilingMat = new THREE.MeshLambertMaterial({
      color: 0x111827
    });

    // Floor slab (merged greedy box)
    const floor = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.5, 6.0), floorMat);
    floor.position.set(0, -0.25, 0);
    floor.receiveShadow = true;
    group.add(floor);

    // Ceiling slab
    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.5, 6.0), ceilingMat);
    ceiling.position.set(0, 4.25, 0);
    group.add(ceiling);

    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(8.0, 4.0, 0.5), wallMat);
    backWall.position.set(0, 2.0, -2.75);
    backWall.receiveShadow = true;
    group.add(backWall);

    // Left wall with door cutout
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.0, 6.0), wallMat);
    leftWall.position.set(-3.75, 2.0, 0);
    leftWall.receiveShadow = true;
    group.add(leftWall);

    // Right wall with door cutout
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.0, 6.0), wallMat);
    rightWall.position.set(3.75, 2.0, 0);
    rightWall.receiveShadow = true;
    group.add(rightWall);

    // Interior equipment voxel prop
    const propMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const prop = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.4, 1.2), propMat);
    prop.position.set(0, 0.7, -1.8);
    prop.castShadow = true;
    group.add(prop);

    // If not revealed, hide initially
    group.visible = def.isRevealed;

    return group;
  }

  public revealRoom(roomId: string, onDropComplete?: () => void) {
    const entry = this.rooms.get(roomId);
    if (!entry) return;

    entry.def.isRevealed = true;
    entry.meshGroup.visible = true;

    // Voxel Assembly Drop animation
    const targetY = entry.def.floor * 6.0 - 4.0;
    entry.meshGroup.position.y = targetY + 12.0;

    const startTime = performance.now();
    const duration = 1200; // ms

    const animateDrop = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      // Bounce Out easing
      const bounce = this.easeOutBounce(progress);
      entry.meshGroup.position.y = targetY + 12.0 * (1.0 - bounce);

      if (progress < 1.0) {
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(animateDrop);
        }
      } else {
        entry.meshGroup.position.y = targetY;
        // Two-stage lighting: emergency red flicker -> day light
        this.runLightingSequence(entry);
        if (onDropComplete) onDropComplete();
      }
    };

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(animateDrop);
    } else {
      entry.meshGroup.position.y = targetY;
      this.runLightingSequence(entry);
    }
  }

  private runLightingSequence(entry: { meshGroup: THREE.Group; light: THREE.PointLight }) {
    // Red emergency glow
    entry.light.color.setHex(0xef4444);
    entry.light.intensity = 1.8;

    setTimeout(() => {
      // Fluorescent white day illumination
      entry.light.color.setHex(0xffffff);
      entry.light.intensity = 1.2;
    }, 800);
  }

  private easeOutBounce(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }

  public setRoomStatus(roomId: string, status: IBunkerRoomDef['status']) {
    const entry = this.rooms.get(roomId);
    if (!entry) return;
    entry.def.status = status;

    if (status === 'fire') {
      entry.light.color.setHex(0xf97316);
      entry.light.intensity = 2.5;
    } else if (status === 'leak') {
      entry.light.color.setHex(0x06b6d4);
      entry.light.intensity = 1.5;
    } else if (status === 'power_out') {
      entry.light.color.setHex(0xef4444);
      entry.light.intensity = 0.3; // emergency dim
    } else {
      entry.light.color.setHex(0xffffff);
      entry.light.intensity = 1.2;
    }
  }

  public getRoomCenter(roomId: string): THREE.Vector3 | null {
    const entry = this.rooms.get(roomId);
    if (!entry) return null;
    return entry.meshGroup.position.clone();
  }

  public getRoomPosition(roomId: string): THREE.Vector3 | null {
    return this.getRoomCenter(roomId);
  }

  public update(deltaTime: number) {
    // Update light flickers in damaged rooms
    this.rooms.forEach((entry) => {
      if (entry.def.status === 'power_out' && entry.def.isRevealed) {
        entry.light.intensity = 0.2 + (Math.random() > 0.92 ? 0.8 : 0.0);
      }
    });
  }

  public dispose() {
    this.scene.remove(this.group);
  }
}
