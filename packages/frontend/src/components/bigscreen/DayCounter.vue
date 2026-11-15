<template>
  <div class="fixed top-4 left-6 z-30 pointer-events-none">
    <div class="bg-[#16162a]/95 border-2 border-[#3f416d] p-3 shadow-[4px_4px_0_#000] flex flex-col gap-1 pointer-events-auto">
      <div class="flex items-center gap-2">
        <PixelIcon v-if="currentDay >= 30" name="flame" size="14" class="text-[#ef4444] animate-pulse" />
        <PixelIcon v-else name="calendar" size="14" class="text-[#fcd34d]" />
        <span class="text-xs font-['Press_Start_2P'] uppercase text-[#fcd34d]" :class="{ 'text-[#ef4444] animate-pulse': currentDay >= 30 }">
          {{ currentDay >= 30 ? 'ФИНАЛЬНЫЙ ДЕНЬ 30/30' : `ДЕНЬ ${currentDay} / 30` }}
        </span>
      </div>

      <div class="text-[10px] text-zinc-400 font-['Silkscreen'] uppercase">
        ЭТАП: <strong class="text-[#38bdf8]">{{ dailyPhase }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PixelIcon from '@/components/ui/PixelIcon.vue';

withDefaults(
  defineProps<{
    currentDay: number;
    dailyPhase?: string;
  }>(),
  {
    currentDay: 1,
    dailyPhase: 'Production'
  }
);
</script>
