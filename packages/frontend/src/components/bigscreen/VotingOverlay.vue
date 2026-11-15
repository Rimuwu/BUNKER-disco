<template>
  <div
    v-if="session?.isOpen"
    class="fixed inset-0 z-40 flex items-center justify-center p-6 bg-black/60 pointer-events-none"
  >
    <div
      class="w-full max-w-4xl bg-[#16162a]/95 border-4 border-[#e02424] p-6 shadow-[10px_10px_0_#000] text-[#f3f4f6] flex flex-col items-center gap-6 pointer-events-auto relative overflow-hidden"
    >
      <!-- Title & Countdown -->
      <div class="w-full flex items-center justify-between border-b-2 border-[#e02424] pb-4">
        <div>
          <h2 class="text-xl sm:text-2xl font-['Press_Start_2P'] text-[#fee2e2] tracking-wider uppercase flex items-center gap-3">
            <PixelIcon name="scale" size="24" />
            <span>ГОЛОСОВАНИЕ ЗА ИЗГНАНИЕ</span>
          </h2>
          <span v-if="session.isTieBreakRound" class="text-xs font-['Press_Start_2P'] text-[#ffc700] mt-1 flex items-center gap-1.5">
            <PixelIcon name="warning" size="12" />
            <span>ПЕРЕГОЛОСОВАНИЕ: НИЧЬЯ</span>
          </span>
        </div>

        <div class="bg-[#7f1d1d] text-[#fef08a] px-4 py-2 font-['Press_Start_2P'] text-lg border-2 border-[#ef4444] shadow-[4px_4px_0_#000] flex items-center gap-2">
          <PixelIcon name="clock" size="16" />
          <span>{{ timerRemaining }}с</span>
        </div>
      </div>

      <!-- Center Nominee Portrait & Bust -->
      <div class="flex flex-col items-center my-2 text-center">
        <div class="w-24 h-24 sm:w-32 sm:h-32 bg-[#1b1c36] border-4 border-[#ffc700] shadow-[6px_6px_0_#000] flex items-center justify-center mb-3 animate-pulse">
          <PixelIcon name="user" size="48" class="text-[#ffc700]" />
        </div>
        <h3 class="font-['Press_Start_2P'] text-lg text-[#fcd34d]">
          КАНДИДАТЫ: {{ nomineeNames }}
        </h3>
      </div>

      <!-- Voter Status LED Lamps -->
      <div class="w-full bg-[#0d0d1a] border-2 border-[#3f416d] p-4">
        <div class="text-[10px] font-['Press_Start_2P'] text-[#9ca3af] mb-3 text-center uppercase">
          СТАТУС ГОЛОСОВАНИЯ ВЫЖИВШИХ:
        </div>
        <div class="flex flex-wrap justify-center gap-3">
          <div
            v-for="voter in voters"
            :key="voter.playerId"
            class="flex items-center gap-1.5 px-2 py-1 bg-[#1b1c36] border border-[#3f416d]"
          >
            <div
              class="w-3 h-3 border border-black shadow-[1px_1px_0_#000]"
              :class="voter.hasVoted ? 'bg-[#10b981] animate-pulse' : 'bg-[#e02424]'"
            />
            <span class="text-[10px] font-['Silkscreen'] text-zinc-300">
              {{ voter.nickname }}
            </span>
          </div>
        </div>
      </div>

      <!-- Stamp Reveal Animation on Vote Conclusion -->
      <div
        v-if="session.result?.stampText"
        class="absolute inset-0 z-50 flex items-center justify-center bg-black/80 animate-in fade-in zoom-in duration-300"
      >
        <div
          class="border-8 px-8 py-4 font-['Press_Start_2P'] text-3xl sm:text-5xl uppercase tracking-widest transform -rotate-12 shadow-[8px_8px_0_#000]"
          :class="session.result.stampText === 'EXILED' ? 'border-[#e02424] text-[#ef4444] bg-[#7f1d1d]/80' : 'border-[#10b981] text-[#34d399] bg-[#064e3b]/80'"
        >
          [ {{ session.result.stampText }} ]
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { IVotingSession } from '@/stores/gameStore';
import type { IRoomPlayer } from '@/stores/roomStore';
import PixelIcon from '@/components/ui/PixelIcon.vue';

const props = defineProps<{
  session: IVotingSession | null;
  players: IRoomPlayer[];
}>();

const timerRemaining = ref(props.session?.timerSeconds || 60);
let interval: any = null;

onMounted(() => {
  if (props.session) {
    timerRemaining.value = props.session.timerSeconds || 60;
    interval = setInterval(() => {
      if (timerRemaining.value > 0) {
        timerRemaining.value -= 1;
      }
    }, 1000);
  }
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});

const nomineeNames = computed(() => {
  if (!props.session?.nominees?.length) return 'Все участники';
  return props.session.nominees
    .map((id) => props.players.find((p) => p.playerId === id)?.nickname || id)
    .join(', ');
});

const voters = computed(() => {
  return props.players.map((p) => ({
    ...p,
    hasVoted: !!props.session?.votes && !!props.session.votes[p.playerId]
  }));
});
</script>
