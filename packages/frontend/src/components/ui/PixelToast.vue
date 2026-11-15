<template>
  <teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-2">
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        class="pointer-events-auto p-3 border-2 shadow-[4px_4px_0_#000] font-['Press_Start_2P'] text-xs flex items-center justify-between transition-all"
        :class="toastClasses(toast.type)"
      >
        <span class="break-words mr-2">{{ toast.message }}</span>
        <button
          class="opacity-75 hover:opacity-100 ml-2 cursor-pointer p-0.5 flex items-center justify-center"
          @click="uiStore.removeToast(toast.id)"
        >
          <PixelIcon name="close" size="12" />
        </button>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { useUiStore, type IToast } from '@/stores/uiStore';
import PixelIcon from '@/components/ui/PixelIcon.vue';

const uiStore = useUiStore();

const toastClasses = (type: IToast['type']) => {
  switch (type) {
    case 'error':
      return 'bg-[#7f1d1d] text-[#fee2e2] border-[#e02424]';
    case 'success':
      return 'bg-[#064e3b] text-[#d1fae5] border-[#059669]';
    case 'warning':
      return 'bg-[#78350f] text-[#fef3c7] border-[#ffc700]';
    case 'info':
    default:
      return 'bg-[#1e3a8a] text-[#dbeafe] border-[#3b82f6]';
  }
};
</script>
