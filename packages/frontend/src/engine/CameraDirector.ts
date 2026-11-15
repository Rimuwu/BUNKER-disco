import * as THREE from 'three';

export type CameraMode =
  | 'SURFACE_WIDE'
  | 'SPEAKER_FOCUS'
  | 'VOTE_ARENA'
  | 'BUNKER_OVERVIEW'
  | 'EMERGENCY_TRACK';

export class CameraDirector {
  public camera: THREE.PerspectiveCamera;
  public currentMode: CameraMode = 'SURFACE_WIDE';

  public targetPosition = new THREE.Vector3(0, 18, 32);
  public currentLookAt = new THREE.Vector3(0, 3, 0);
  public targetLookAt = new THREE.Vector3(0, 3, 0);
  public targetFov = 40;

  // Transition parameters
  private transitionDuration = 2.0; // seconds
  private transitionProgress = 1.0; // 0..1
  private startPosition = new THREE.Vector3();
  private startLookAt = new THREE.Vector3();
  private startFov = 40;

  // Screen shake parameters
  private shakeIntensity = 0;
  private shakeDuration = 0;
  private shakeElapsed = 0;
  private preShakePosition = new THREE.Vector3();
  private isShaking = false;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.camera.position.copy(this.targetPosition);
    this.camera.lookAt(this.targetLookAt);
    this.camera.fov = this.targetFov;
    this.camera.updateProjectionMatrix();
  }

  public toSurfaceWide(duration = 2.0) {
    this.currentMode = 'SURFACE_WIDE';
    this.smoothTransition(
      new THREE.Vector3(0, 18, 32),
      new THREE.Vector3(0, 3, 0),
      duration,
      40
    );
  }

  public focusOnSpeaker(characterPosition: THREE.Vector3, duration = 1.2) {
    this.currentMode = 'SPEAKER_FOCUS';
    const cameraOffset = new THREE.Vector3(
      characterPosition.x + 4,
      characterPosition.y + 3,
      characterPosition.z + 8
    );
    this.smoothTransition(cameraOffset, characterPosition.clone(), duration, 32);
  }

  public toVotingArena(duration = 1.5) {
    this.currentMode = 'VOTE_ARENA';
    this.smoothTransition(
      new THREE.Vector3(0, 25, 20),
      new THREE.Vector3(0, 0, 0),
      duration,
      45
    );
  }

  public toBunkerOverview(bunkerCenter: THREE.Vector3, depth = 30, duration = 2.5) {
    this.currentMode = 'BUNKER_OVERVIEW';
    const targetPos = new THREE.Vector3(
      bunkerCenter.x + 35,
      bunkerCenter.y + 15,
      bunkerCenter.z + 45
    );
    const lookAtPos = new THREE.Vector3(
      bunkerCenter.x,
      -depth / 2,
      bunkerCenter.z
    );
    this.smoothTransition(targetPos, lookAtPos, duration, 40);
  }

  public trackEmergency(target: THREE.Vector3, duration = 1.0) {
    this.currentMode = 'EMERGENCY_TRACK';
    const cameraPos = new THREE.Vector3(target.x + 6, target.y + 4, target.z + 10);
    this.smoothTransition(cameraPos, target.clone(), duration, 36);
  }

  public smoothTransition(
    pos: THREE.Vector3,
    lookAt: THREE.Vector3,
    durationSec = 2.0,
    fov = 40
  ) {
    this.startPosition.copy(this.camera.position);
    this.startLookAt.copy(this.currentLookAt);
    this.startFov = this.camera.fov;

    this.targetPosition.copy(pos);
    this.targetLookAt.copy(lookAt);
    this.targetFov = fov;

    this.transitionDuration = Math.max(0.001, durationSec);
    this.transitionProgress = 0.0;
  }

  public triggerShake(intensity = 0.8, durationMs = 800) {
    if (this.isShaking) {
      this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
      this.shakeDuration = Math.max(this.shakeDuration, durationMs / 1000);
      this.shakeElapsed = 0;
      return;
    }

    this.isShaking = true;
    this.preShakePosition.copy(this.camera.position);
    this.shakeIntensity = intensity;
    this.shakeDuration = durationMs / 1000;
    this.shakeElapsed = 0;
  }

  private cubicOut(t: number): number {
    const f = t - 1.0;
    return f * f * f + 1.0;
  }

  public update(deltaTime: number) {
    // 1. Process mode smooth transition
    if (this.transitionProgress < 1.0) {
      this.transitionProgress += deltaTime / this.transitionDuration;
      if (this.transitionProgress >= 1.0) {
        this.transitionProgress = 1.0;
      }

      const ease = this.cubicOut(this.transitionProgress);

      this.camera.position.lerpVectors(this.startPosition, this.targetPosition, ease);
      this.currentLookAt.lerpVectors(this.startLookAt, this.targetLookAt, ease);
      this.camera.lookAt(this.currentLookAt);

      this.camera.fov = THREE.MathUtils.lerp(this.startFov, this.targetFov, ease);
      this.camera.updateProjectionMatrix();
    } else if (!this.isShaking) {
      this.camera.lookAt(this.targetLookAt);
    }

    // 2. Process camera screen shake
    if (this.isShaking) {
      this.shakeElapsed += deltaTime;
      if (this.shakeElapsed >= this.shakeDuration) {
        this.isShaking = false;
        this.camera.position.copy(this.preShakePosition);
      } else {
        const damping = 1.0 - this.shakeElapsed / this.shakeDuration;
        const offsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity * damping;
        const offsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity * damping;
        this.camera.position.x = this.preShakePosition.x + offsetX;
        this.camera.position.y = this.preShakePosition.y + offsetY;
      }
    }
  }
}
