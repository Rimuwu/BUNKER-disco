import * as THREE from 'three';
import { CameraDirector } from './CameraDirector';
import { SurfaceScene } from './SurfaceScene';
import { BunkerBuilder } from './BunkerBuilder';
import { CharacterCrowd } from './CharacterCrowd';
import { FogOfWarShader } from './FogOfWarShader';

export class VoxelEngine {
  public canvas: HTMLCanvasElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  public cameraDirector: CameraDirector;
  public surfaceScene: SurfaceScene;
  public bunkerBuilder: BunkerBuilder;
  public characterCrowd: CharacterCrowd;
  public fogOfWar: FogOfWarShader;

  private isRunning = false;
  private animFrameId: number | null = null;
  private lastTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
      stencil: true
    });
    this.renderer.setPixelRatio(1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f111a);

    const aspect = canvas.clientWidth > 0 && canvas.clientHeight > 0
      ? canvas.clientWidth / canvas.clientHeight
      : 16 / 9;

    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.5, 1000);
    this.cameraDirector = new CameraDirector(this.camera);

    this.initLighting();

    this.surfaceScene = new SurfaceScene(this.scene);
    this.bunkerBuilder = new BunkerBuilder(this.scene);
    this.characterCrowd = new CharacterCrowd(this.scene);
    this.fogOfWar = new FogOfWarShader(this.scene);

    this.handleResize = this.handleResize.bind(this);
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize);
    }
  }

  private initLighting() {
    // Upper cold post-apocalyptic sunlight
    const sunLight = new THREE.DirectionalLight(0xdde8ff, 1.2);
    sunLight.position.set(40, 60, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    this.scene.add(sunLight);

    // Dark ambient lighting
    const ambientLight = new THREE.AmbientLight(0x2a2b3d, 0.6);
    this.scene.add(ambientLight);
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private loop = () => {
    if (!this.isRunning) return;

    const now = performance.now();
    const deltaTime = Math.min(0.1, (now - this.lastTime) / 1000.0);
    this.lastTime = now;

    this.update(deltaTime);
    this.render();

    if (typeof requestAnimationFrame !== 'undefined') {
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  };

  public update(deltaTime: number) {
    this.cameraDirector.update(deltaTime);
    this.surfaceScene.update(deltaTime);
    this.bunkerBuilder.update(deltaTime);
    this.characterCrowd.update(deltaTime);
    this.fogOfWar.update(deltaTime);
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  public handleResize() {
    if (!this.canvas || typeof window === 'undefined') return;
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    if (width > 0 && height > 0) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false);
    }
  }

  public destroy() {
    this.stop();
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize);
    }
    this.surfaceScene.dispose();
    this.bunkerBuilder.dispose();
    this.characterCrowd.dispose();
    this.fogOfWar.dispose();
    this.renderer.dispose();
  }
}
