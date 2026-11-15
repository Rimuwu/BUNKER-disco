<template>
  <div
    class="w-full bg-[#16162a]/95 border-b-2 p-3 transition-colors duration-300"
    :class="hasCriticalResource ? 'border-[#e02424] animate-pulse bg-red-950/40' : 'border-[#3f416d]'"
  >
    <div class="max-w-6xl mx-auto grid grid-cols-3 sm:grid-cols-6 gap-3">
      <div
        v-for="res in resourceList"
        :key="res.key"
        class="bg-[#0d0d1a] border-2 border-[#2d2e4d] p-2 flex flex-col gap-1 shadow-[2px_2px_0_#000]"
        :class="{ 'border-red-600 animate-bounce': res.value <= 0 }"
      >
        <div class="flex items-center justify-between text-[9px] font-['Press_Start_2P'] uppercase">
          <span class="flex items-center gap-1.5" :style="{ color: res.color }">
            <PixelIcon :name="res.iconName" size="12" />
            <span>{{ res.label }}</span>
          </span>
          <span :class="valueClass(res.value)">{{ res.value }}%</span>
        </div>

        <!-- Gauge Bar -->
        <div class="w-full h-3 bg-[#1b1c36] border border-black overflow-hidden relative">
          <div
            class="h-full transition-all duration-300"
            :style="{
              width: `${Math.max(0, Math.min(res.value, 100))}%`,
              backgroundColor: gaugeColor(res.value, res.color)
            }"
            :class="{ 'animate-pulse': res.value < 15 }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IGameResources } from '@/stores/gameStore';
import PixelIcon from '@/components/ui/PixelIcon.vue';

const props = defineProps<{
  resources: IGameResources;
}>();

const resourceList = computed(() => [
  { key: 'food', label: 'ЕДА', iconName: 'food', value: props.resources.food, color: '#84cc16' },
  { key: 'water', label: 'ВОДА', iconName: 'water', value: props.resources.water, color: '#06b6d4' },
  { key: 'air', label: 'ВОЗДУХ', iconName: 'air', value: props.resources.air, color: '#e0f2fe' },
  { key: 'medicine', label: 'МЕД.', iconName: 'meds', value: props.resources.medicine, color: '#f43f5e' },
  { key: 'power', label: 'ЭНЕРГИЯ', iconName: 'power', value: props.resources.power, color: '#f97316' },
  { key: 'morale', label: 'МОРАЛЬ', iconName: 'morale', value: props.resources.morale, color: '#fbbf24' }
]);

const hasCriticalResource = computed(() => {
  return resourceList.value.some((r) => r.value < 15);
});

const valueClass = (val: number) => {
  if (val <= 0) return 'text-[#ef4444] animate-pulse font-bold';
  if (val < 15) return 'text-[#ef4444]';
  if (val <= 30) return 'text-[#eab308]';
  return 'text-[#10b981]';
};

const gaugeColor = (val: number, defaultColor: string) => {
  if (val <= 0) return '#000000';
  if (val < 15) return '#e02424'; // Red
  if (val <= 30) return '#eab308'; // Yellow
  return defaultColor;
};
</script>
