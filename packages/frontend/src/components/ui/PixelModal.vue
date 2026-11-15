<template>
  <teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      @click.self="handleBackdropClick"
    >
      <div
        class="w-full max-w-lg bg-[#16162a] border-4 border-[#3f416d] shadow-[8px_8px_0_#000] p-4 text-[#f3f4f6] relative max-h-[90vh] flex flex-col"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-3 border-b-2 border-[#3f416d] mb-4">
          <h3 class="font-['Press_Start_2P'] text-sm uppercase text-[#fcd34d] truncate">
            {{ title }}
          </h3>
          <button
            class="text-[#9ca3af] hover:text-[#e02424] p-1 ml-2 transition-colors flex items-center justify-center"
            @click="close"
          >
            <PixelIcon name="close" size="14" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="overflow-y-auto flex-1 pr-1">
          <slot />
        </div>

        <!-- Modal Footer -->
        <div v-if="$slots.footer" class="pt-4 border-t-2 border-[#3f416d] mt-4 flex justify-end gap-2">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import PixelIcon from '@/components/ui/PixelIcon.vue';
const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    title?: string;
    closeOnBackdrop?: boolean;
  }>(),
  {
    title: '',
    closeOnBackdrop: true
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const close = () => {
  emit('close');
};

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close();
  }
};
</script>
