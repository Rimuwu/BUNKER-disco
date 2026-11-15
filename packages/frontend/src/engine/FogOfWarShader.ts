import * as THREE from 'three';

export class FogOfWarShader {
  public mesh: THREE.Mesh;
  public maskCanvas: HTMLCanvasElement;
  public maskCtx: CanvasRenderingContext2D | null;
  public maskTexture: THREE.CanvasTexture;
  private material: THREE.ShaderMaterial;
  private scene: THREE.Scene;

  // Debris particle system
  private debrisPoints?: THREE.Points;
  private debrisPositions?: Float32Array;
  private debrisVelocities?: Float32Array;
  private debrisLifetimes?: Float32Array;

  constructor(scene: THREE.Scene, width = 60, depth = 60) {
    this.scene = scene;

    // Mask texture canvas (512x512)
    this.maskCanvas = document.createElement('canvas');
    this.maskCanvas.width = 512;
    this.maskCanvas.height = 512;
    this.maskCtx = this.maskCanvas.getContext('2d');

    // Fill completely black initially (unrevealed)
    if (this.maskCtx) {
      this.maskCtx.fillStyle = '#000000';
      this.maskCtx.fillRect(0, 0, 512, 512);
      // Airlock room revealed by default in center
      this.maskCtx.fillStyle = '#ffffff';
      this.maskCtx.beginPath();
      this.maskCtx.arc(256, 256, 32, 0, Math.PI * 2);
      this.maskCtx.fill();
    }

    this.maskTexture = new THREE.CanvasTexture(this.maskCanvas);
    this.maskTexture.minFilter = THREE.LinearFilter;
    this.maskTexture.magFilter = THREE.LinearFilter;

    // Custom GLSL Shader Material
    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const fragmentShader = `
      uniform sampler2D uRoomMask;
      uniform float uTime;
      varying vec3 vWorldPosition;

      void main() {
        // Map world position XZ to [0..1] UV
        vec2 uv = (vWorldPosition.xz + 30.0) / 60.0;
        uv = clamp(uv, 0.0, 1.0);

        float maskValue = texture2D(uRoomMask, uv).r;

        if (maskValue > 0.5) {
          discard; // Revealed room is clear
        }

        // Animated noise pulse across volumetric shroud
        float noise = sin(vWorldPosition.x * 0.4 + uTime * 2.0) * cos(vWorldPosition.z * 0.4 + uTime * 2.0);
        vec3 fogColor = vec3(0.04, 0.05, 0.09) + vec3(noise * 0.02);

        gl_FragColor = vec4(fogColor, 0.96);
      }
    `;

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uRoomMask: { value: this.maskTexture },
        uTime: { value: 0 }
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const geo = new THREE.BoxGeometry(width, 20, depth);
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.position.set(0, -10.0, 0); // Sits underneath surface level
    this.mesh.name = 'fog_of_war_mesh';

    this.scene.add(this.mesh);
  }

  public burnHoleInFog(worldPos: THREE.Vector3, radius = 5.0) {
    if (!this.maskCtx) return;

    // Convert world XZ coordinates [-30..30] to canvas coordinates [0..512]
    const normX = (worldPos.x + 30.0) / 60.0;
    const normZ = (worldPos.z + 30.0) / 60.0;

    const px = Math.floor(Math.min(Math.max(normX, 0), 1) * 512);
    const pz = Math.floor(Math.min(Math.max(normZ, 0), 1) * 512);
    const pixelRadius = Math.max(16, (radius / 60.0) * 512);

    this.maskCtx.fillStyle = '#ffffff';
    this.maskCtx.beginPath();
    this.maskCtx.arc(px, pz, pixelRadius, 0, Math.PI * 2);
    this.maskCtx.fill();

    this.maskTexture.needsUpdate = true;
    this.spawnDebrisParticles(worldPos, 150);
  }

  public spawnDebrisParticles(center: THREE.Vector3, count = 100) {
    if (this.debrisPoints) {
      this.scene.remove(this.debrisPoints);
    }

    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const life = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = center.x + (Math.random() - 0.5) * 4.0;
      pos[i * 3 + 1] = center.y + (Math.random() - 0.5) * 2.0;
      pos[i * 3 + 2] = center.z + (Math.random() - 0.5) * 4.0;

      vel[i * 3] = (Math.random() - 0.5) * 2.0;
      vel[i * 3 + 1] = -1.5 - Math.random() * 3.0; // falling down with gravity
      vel[i * 3 + 2] = (Math.random() - 0.5) * 2.0;

      life[i] = 1.0 + Math.random() * 1.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x78716c,
      size: 0.2,
      transparent: true,
      opacity: 0.8
    });

    this.debrisPositions = pos;
    this.debrisVelocities = vel;
    this.debrisLifetimes = life;
    this.debrisPoints = new THREE.Points(geo, mat);
    this.scene.add(this.debrisPoints);
  }

  public update(deltaTime: number) {
    this.material.uniforms.uTime.value += deltaTime;

    // Update falling debris particles if active
    if (this.debrisPoints && this.debrisPositions && this.debrisVelocities && this.debrisLifetimes) {
      const pos = this.debrisPositions;
      const vel = this.debrisVelocities;
      const life = this.debrisLifetimes;
      const count = life.length;
      let activeCount = 0;

      for (let i = 0; i < count; i++) {
        if (life[i] > 0) {
          life[i] -= deltaTime;
          pos[i * 3] += vel[i * 3] * deltaTime;
          pos[i * 3 + 1] += vel[i * 3 + 1] * deltaTime;
          pos[i * 3 + 2] += vel[i * 3 + 2] * deltaTime;
          activeCount++;
        }
      }

      this.debrisPoints.geometry.attributes.position.needsUpdate = true;

      if (activeCount === 0) {
        this.scene.remove(this.debrisPoints);
        this.debrisPoints = undefined;
      }
    }
  }

  public dispose() {
    this.scene.remove(this.mesh);
    if (this.debrisPoints) {
      this.scene.remove(this.debrisPoints);
    }
    this.maskTexture.dispose();
  }
}
