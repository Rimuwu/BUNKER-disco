import { ref, onMounted, onUnmounted, type Ref } from 'vue';

export function useCardGyroscope(cardElementRef: Ref<HTMLElement | null>) {
  const tiltX = ref(0);
  const tiltY = ref(0);
  const hasGyro = ref(false);

  const onOrientation = (e: DeviceOrientationEvent) => {
    if (!cardElementRef.value || e.gamma === null || e.beta === null) return;
    hasGyro.value = true;
    const clampedX = Math.min(Math.max(e.gamma, -30), 30);
    const clampedY = Math.min(Math.max(e.beta - 45, -30), 30);
    tiltX.value = clampedX;
    tiltY.value = clampedY;
    cardElementRef.value.style.setProperty('--gyro-tilt-x', `${clampedX * 2}deg`);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (hasGyro.value || !cardElementRef.value) return;
    const rect = cardElementRef.value.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const normalizedX = (x / (rect.width / 2)) * 25;
    const normalizedY = (y / (rect.height / 2)) * 25;
    const clampedX = Math.min(Math.max(normalizedX, -30), 30);
    const clampedY = Math.min(Math.max(normalizedY, -30), 30);
    tiltX.value = clampedX;
    tiltY.value = clampedY;
    cardElementRef.value.style.setProperty('--gyro-tilt-x', `${clampedX * 2}deg`);
  };

  const onMouseLeave = () => {
    if (hasGyro.value || !cardElementRef.value) return;
    tiltX.value = 0;
    tiltY.value = 0;
    cardElementRef.value.style.setProperty('--gyro-tilt-x', '0deg');
  };

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('deviceorientation', onOrientation);
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('deviceorientation', onOrientation);
    }
  });

  return {
    tiltX,
    tiltY,
    hasGyro,
    onMouseMove,
    onMouseLeave
  };
}
