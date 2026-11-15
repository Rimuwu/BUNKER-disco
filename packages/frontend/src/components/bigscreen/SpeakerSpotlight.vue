<template>
  <div
    v-if="speaker"
    class="fixed bottom-6 left-6 z-30 max-w-lg w-full transition-all duration-300 transform pointer-events-none"
  >
    <div
      class="bg-[#16162a]/95 border-4 border-[#ffc700] p-4 shadow-[8px_8px_0_#000] text-[#f3f4f6] flex items-center gap-4 pointer-events-auto"
    >
      <!-- Speaker Avatar -->
      <div class="w-16 h-16 bg-[#27272a] border-2 border-[#ffc700] flex items-center justify-center shadow-[3px_3px_0_#000]">
        <PixelIcon name="mic" size="32" class="text-[#ffc700]" />
      </div>

      <!-- Details -->
      <div class="flex-1 flex flex-col gap-1 overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-[9px] font-['Press_Start_2P'] text-[#ffc700] uppercase">
            ВЫСТУПАЕТ:
          </span>
          <span class="text-xs font-['Press_Start_2P'] text-[#fee2e2] flex items-center gap-1">
            <PixelIcon name="clock" size="10" />
            <span>{{ timerRemaining }}с</span>
          </span>
        </div>

        <h3 class="font-['Press_Start_2P'] text-sm text-[#f3f4f6] truncate">
          {{ speaker.nickname }}
        </h3>

        <div v-if="speaker.profession" class="text-xs text-[#a5b4fc] font-['Silkscreen'] flex items-center gap-1">
          <PixelIcon name="briefcase" size="12" />
          <span>{{ speaker.profession }}</span>
        </div>

        <!-- Speech Timer Bar -->
        <div class="w-full h-2 bg-[#0d0d1a] border border-[#3f416d] mt-1 overflow-hidden">
          <div
            class="h-full bg-[#ffc700] transition-all duration-1000"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import PixelIcon from '@/components/ui/PixelIcon.vue';

export interface ISpeaker {
  playerId: string;
  nickname: string;
  profession?: string;
  timerSeconds?: number;
}

const props = defineProps<{
  speaker: ISpeaker | null;
}>();

const timerRemaining = ref(props.speaker?.timerSeconds || 60);
const initialTimer = ref(props.speaker?.timerSeconds || 60);
let timer: any = null;

const startCountdown = () => {
  if (timer) clearInterval(timer);
  if (props.speaker) {
    initialTimer.value = props.speaker.timerSeconds || 60;
    timerRemaining.value = initialTimer.value;
    timer = setInterval(() => {
      if (timerRemaining.value > 0) {
        timerRemaining.value -= 1;
      }
    }, 1000);
  }
};

watch(() => props.speaker?.playerId, startCountdown);

onMounted(startCountdown);
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const progressPercent = computed(() => {
  if (initialTimer.value <= 0) return 0;
  return (timerRemaining.value / initialTimer.value) * 100;
});
</script>
