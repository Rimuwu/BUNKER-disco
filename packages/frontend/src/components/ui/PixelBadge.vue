<template>
  <span
    class="inline-block px-2 py-0.5 text-[10px] font-['Press_Start_2P'] uppercase border tracking-tight"
    :class="tagStyle"
  >
    {{ labelText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    tag?: 'BASE' | 'ALPHA' | 'EXPANSION' | 'NEW' | string;
    text?: string;
  }>(),
  {
    tag: 'BASE'
  }
);

const labelText = computed(() => {
  if (props.text) return props.text;
  switch (props.tag?.toUpperCase()) {
    case 'BASE':
      return '[BASE]';
    case 'ALPHA':
      return '[ALPHA]';
    case 'EXPANSION':
      return '[EXPANSION]';
    case 'NEW':
      return '[NEW]';
    default:
      return props.tag ? `[${props.tag}]` : '';
  }
});

const tagStyle = computed(() => {
  switch (props.tag?.toUpperCase()) {
    case 'BASE':
      return 'bg-[#27272a] text-[#d4d4d8] border-[#71717a] shadow-[2px_2px_0_#000]';
    case 'ALPHA':
      return 'bg-[#581c87] text-[#f3e8ff] border-[#a855f7] shadow-[2px_2px_0_#000]';
    case 'EXPANSION':
      return 'bg-[#78350f] text-[#fef3c7] border-[#d97706] shadow-[2px_2px_0_#000]';
    case 'NEW':
      return 'bg-[#155e75] text-[#cffafe] border-[#06b6d4] shadow-[2px_2px_0_#000]';
    default:
      return 'bg-[#1b1c36] text-[#9ca3af] border-[#3f416d] shadow-[2px_2px_0_#000]';
  }
});
</script>
