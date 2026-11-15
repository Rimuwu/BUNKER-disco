<template>
  <div
    v-if="event"
    class="fixed top-8 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-2xl px-4 pointer-events-none"
  >
    <div
      class="bg-[#7f1d1d]/95 border-4 border-[#e02424] p-4 shadow-[8px_8px_0_#000] text-[#fee2e2] flex flex-col gap-2 relative overflow-hidden pointer-events-auto"
    >
      <!-- Hazard Stripes Top Bar -->
      <div class="h-2 w-full bg-gradient-to-r from-yellow-400 via-black to-yellow-400 mb-1" />

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <PixelIcon name="alert" size="20" class="text-yellow-300 animate-pulse" />
          <h3 class="font-['Press_Start_2P'] text-sm uppercase text-[#fef08a]">
            ТРЕВОГА: {{ event.title }}
          </h3>
        </div>

        <span
          class="px-2 py-0.5 text-[9px] font-['Press_Start_2P'] uppercase border border-white"
          :class="severityBadgeClass"
        >
          {{ event.severity }}
        </span>
      </div>

      <p class="text-xs font-['Silkscreen'] leading-relaxed text-zinc-200">
        {{ event.description }}
      </p>

      <!-- Resource Penalties -->
      <div v-if="event.penalties" class="flex flex-wrap gap-2 pt-2 border-t border-red-800">
        <span
          v-for="(val, res) in event.penalties"
          :key="res"
          class="text-[9px] font-['Press_Start_2P'] text-yellow-300 flex items-center gap-1"
        >
          <PixelIcon name="arrow-down" size="10" class="text-red-400" />
          <span>{{ res.toUpperCase() }}: -{{ Math.abs(val) }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IPhase2Threat } from '@/stores/gameStore';
import PixelIcon from '@/components/ui/PixelIcon.vue';

const props = defineProps<{
  event: IPhase2Threat | null;
}>();

const severityBadgeClass = computed(() => {
  switch (props.event?.severity) {
    case 'critical':
      return 'bg-black text-red-500 border-red-500 animate-pulse';
    case 'high':
      return 'bg-red-900 text-yellow-300 border-yellow-400';
    case 'medium':
      return 'bg-amber-900 text-amber-200 border-amber-300';
    case 'low':
    default:
      return 'bg-blue-900 text-blue-200 border-blue-300';
  }
});
</script>
