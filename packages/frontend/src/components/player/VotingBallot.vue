<template>
  <div class="w-full bg-[#16162a] border-4 border-[#e02424] p-4 flex flex-col gap-4 shadow-[6px_6px_0_#000]">
    <!-- Voting Header & Timer -->
    <div class="flex items-center justify-between border-b-2 border-[#e02424] pb-2">
      <div>
        <h3 class="font-['Press_Start_2P'] text-xs sm:text-sm text-[#fee2e2] uppercase flex items-center gap-2">
          <PixelIcon name="scale" size="14" />
          <span>ГОЛОСОВАНИЕ НА ИЗГНАНИЕ</span>
        </h3>
        <span v-if="isTieBreak" class="text-[10px] text-[#fcd34d] font-bold flex items-center gap-1 mt-1">
          <PixelIcon name="warning" size="10" />
          <span>ПЕРЕГОЛОСОВАНИЕ ПРИ НИЧЬЕЙ</span>
        </span>
      </div>

      <div class="bg-[#7f1d1d] text-[#fef08a] px-3 py-1 font-['Press_Start_2P'] text-xs border border-[#ef4444] shadow-[2px_2px_0_#000] flex items-center gap-1.5">
        <PixelIcon name="clock" size="12" />
        <span>{{ remainingSeconds }}s</span>
      </div>
    </div>

    <!-- Candidate Veto Action (2 AP) -->
    <div v-if="canUseVeto" class="bg-[#24264a] border border-[#ffc700] p-2 flex items-center justify-between">
      <div class="text-[10px] font-['Silkscreen'] text-zinc-300 flex items-center gap-1.5">
        <PixelIcon name="shield" size="12" />
        <span>Защитное вето кандидата (1 раз за игру)</span>
      </div>
      <PixelButton
        variant="gold"
        :disabled="playerStore.actionPoints < 2 || playerStore.hasUsedVeto"
        @click="handleVeto"
      >
        <span class="text-[9px]">ВЕТО (2 AP)</span>
      </PixelButton>
    </div>

    <!-- Ballot Candidates List -->
    <div class="flex flex-col gap-2">
      <div class="text-[10px] font-['Press_Start_2P'] text-zinc-400">
        ВЫБЕРИТЕ КАНДИДАТА НА ИЗГНАНИЕ:
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div
          v-for="candidate in candidates"
          :key="candidate.playerId"
          class="flex items-center"
        >
          <button
            class="candidate-btn w-full p-3 border-2 font-['Press_Start_2P'] text-xs text-left flex items-center justify-between shadow-[3px_3px_0_#000] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            :class="candidateButtonClass(candidate.playerId)"
            :disabled="hasVoted || isSelf(candidate.playerId)"
            @click="castVote(candidate.playerId)"
          >
            <span class="truncate">{{ candidate.nickname }}</span>

            <span v-if="isSelf(candidate.playerId)" class="text-[8px] text-zinc-400 ml-2">
              (ВЫ - НЕЛЬЗЯ)
            </span>
            <span v-else-if="selectedCandidateId === candidate.playerId" class="text-xs">
              <PixelIcon name="check" size="12" class="text-green-400" />
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Status Message -->
    <div v-if="hasVoted" class="text-center font-['Press_Start_2P'] text-xs text-[#10b981] p-2 bg-[#064e3b] border border-[#059669] flex items-center justify-center gap-2">
      <PixelIcon name="check" size="14" />
      <span>ВАШ ГОЛОС УЧТЁН</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import PixelButton from '@/components/ui/PixelButton.vue';
import PixelIcon from '@/components/ui/PixelIcon.vue';

export interface ICandidate {
  playerId: string;
  nickname: string;
}

const props = withDefaults(
  defineProps<{
    candidates: ICandidate[];
    timerSeconds?: number;
    isTieBreak?: boolean;
    canUseVeto?: boolean;
  }>(),
  {
    timerSeconds: 60,
    isTieBreak: false,
    canUseVeto: true
  }
);

const emit = defineEmits<{
  (e: 'vote', candidateId: string): void;
  (e: 'veto'): void;
}>();

const playerStore = usePlayerStore();
const selectedCandidateId = ref<string | null>(null);
const hasVoted = ref(false);
const remainingSeconds = ref(props.timerSeconds);
let countdownTimer: any = null;

onMounted(() => {
  remainingSeconds.value = props.timerSeconds;
  countdownTimer = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value -= 1;
    } else {
      clearInterval(countdownTimer);
    }
  }, 1000);
});

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});

const isSelf = (id: string) => id === playerStore.playerId;

const castVote = (candidateId: string) => {
  if (hasVoted.value || isSelf(candidateId)) return;
  selectedCandidateId.value = candidateId;
  hasVoted.value = true;
  emit('vote', candidateId);
};

const handleVeto = () => {
  if (playerStore.useCandidateVeto()) {
    emit('veto');
  }
};

const candidateButtonClass = (candidateId: string) => {
  if (isSelf(candidateId)) {
    return 'bg-[#27272a] text-zinc-500 border-zinc-700';
  }
  if (selectedCandidateId.value === candidateId) {
    return 'bg-[#7f1d1d] text-[#fef08a] border-[#e02424]';
  }
  return 'bg-[#1b1c36] text-[#f3f4f6] border-[#3f416d] hover:bg-[#24264a] active:translate-x-0.5 active:translate-y-0.5';
};
</script>
