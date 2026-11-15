<template>
  <div class="w-full flex flex-col gap-1">
    <div v-if="label || showValue" class="flex justify-between items-center text-[10px] font-['Press_Start_2P'] uppercase">
      <span v-if="label" :style="{ color: labelColor }">{{ label }}</span>
      <span v-if="showValue" class="text-zinc-400">{{ clampedValue }} / {{ max }}</span>
    </div>

    <div
      class="w-full h-4 bg-[#0d0d1a] border-2 border-black p-0.5 shadow-[2px_2px_0_#000] relative overflow-hidden"
    >
      <div
        class="h-full transition-all duration-300"
        :style="{
          width: `${percentage}%`,
          backgroundColor: barColor
        }"
        :class="{ 'animate-pulse': isCritical }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    value: number;
    max?: number;
    label?: string;
    labelColor?: string;
    color?: string;
    showValue?: boolean;
    criticalThreshold?: number;
  }>(),
  {
    max: 100,
    showValue: true,
    criticalThreshold: 15
  }
);

const clampedValue = computed(() => Math.max(0, Math.min(props.value, props.max)));
const percentage = computed(() => (clampedValue.value / props.max) * 100);

const isCritical = computed(() => percentage.value <= props.criticalThreshold);

const barColor = computed(() => {
  if (props.color) return props.color;
  if (percentage.value <= 0) return '#000000';
  if (percentage.value <= 15) return '#e02424'; // Red
  if (percentage.value <= 30) return '#eab308'; // Yellow
  return '#10b981'; // Green
});
</script>
