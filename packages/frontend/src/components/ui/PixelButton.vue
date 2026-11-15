<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="relative inline-flex items-center justify-center font-['Press_Start_2P'] uppercase text-xs sm:text-sm px-4 py-3 tracking-wider transition-all duration-75 select-none focus:outline-none border-2 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="variantClasses"
    @click="handleClick"
  >
    <span v-if="loading" class="animate-spin mr-2">⏳</span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTactileAudio } from '@/composables/useTactileAudio';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'gold' | 'ghost';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
  }>(),
  {
    variant: 'primary',
    type: 'button',
    disabled: false,
    loading: false
  }
);

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const { playClick } = useTactileAudio();

const handleClick = (e: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    playClick();
    emit('click', e);
  }
};

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'bg-[#1b1c36] text-[#f3f4f6] border-[#3f416d] shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-[#24264a]';
    case 'danger':
      return 'bg-[#7f1d1d] text-[#fee2e2] border-[#e02424] shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-[#991b1b]';
    case 'gold':
      return 'bg-[#78350f] text-[#fef08a] border-[#ffc700] shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-[#92400e]';
    case 'ghost':
      return 'bg-transparent text-[#9ca3af] border-transparent hover:text-white';
    case 'primary':
    default:
      return 'bg-[#1e3a8a] text-[#dbeafe] border-[#3b82f6] shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-[#1d4ed8]';
  }
});
</script>
