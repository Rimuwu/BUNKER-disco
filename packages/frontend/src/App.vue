<template>
  <div
    class="w-full min-h-screen bg-[#0d0d1a] text-[#f3f4f6] flex flex-col relative"
    :class="{ 'crt-overlay': uiStore.crtEffect }"
  >
    <router-view />
    <PixelToast />
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/uiStore';
import PixelToast from '@/components/ui/PixelToast.vue';

const uiStore = useUiStore();
</script>
