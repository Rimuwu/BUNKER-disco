<template>
  <div v-if="isActive" class="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
    <!-- Red heat pulse & screen shudder -->
    <div
      class="absolute inset-0 bg-red-600/30 animate-ping"
      style="animation-duration: 0.4s"
    />

    <!-- Shattered padlock -->
    <div
      class="animate-bounce"
      :class="{ 'opacity-0 scale-150 transition-all duration-300': isShattered }"
    >
      <PixelIcon name="lock" size="48" class="text-red-500" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTactileAudio } from '@/composables/useTactileAudio';
import PixelIcon from '@/components/ui/PixelIcon.vue';

const { playLockShatter } = useTactileAudio();

const isActive = ref(false);
const isShattered = ref(false);

const trigger = (onComplete?: () => void) => {
  isActive.value = true;
  isShattered.value = false;
  playLockShatter();

  setTimeout(() => {
    isShattered.value = true;
  }, 180);

  setTimeout(() => {
    isActive.value = false;
    if (onComplete) onComplete();
  }, 350);
};

defineExpose({
  trigger
});
</script>
