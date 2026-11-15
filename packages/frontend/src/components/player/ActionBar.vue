<template>
  <div class="w-full bg-[#16162a] border-t-2 border-[#3f416d] p-3 flex flex-col gap-3 shadow-[0_-4px_0_#000]">
    <!-- AP Economy Indicator (3 AP per round) -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-[10px] font-['Press_Start_2P'] uppercase text-[#fcd34d]">
          ОЧКИ ДЕЙСТВИЙ:
        </span>
        <div class="flex gap-1.5">
          <div
            v-for="pip in 3"
            :key="pip"
            class="w-5 h-5 border-2 shadow-[2px_2px_0_#000] flex items-center justify-center font-['Press_Start_2P'] text-[9px] transition-all"
            :class="pip <= playerStore.actionPoints ? 'bg-[#ffc700] text-black border-[#b45309]' : 'bg-[#1f2937] text-zinc-600 border-[#374151]'"
          >
            <PixelIcon name="power" size="10" />
          </div>
        </div>
      </div>

      <span class="text-[10px] text-zinc-400 font-['Press_Start_2P']">
        {{ playerStore.actionPoints }} / 3 AP
      </span>
    </div>

    <!-- Action Triggers -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <!-- 1. Voluntary Card Reveal (1 AP) -->
      <PixelButton
        variant="secondary"
        :disabled="playerStore.actionPoints < 1 || unrevealedList.length === 0"
        @click="emit('voluntary-reveal')"
      >
        <span class="text-[10px] flex items-center justify-center gap-1.5">
          <PixelIcon name="eye" size="12" />
          <span>ВСКРЫТЬ (1 AP)</span>
        </span>
      </PixelButton>

      <!-- 2. Active Ability Trigger -->
      <PixelButton
        variant="primary"
        :disabled="playerStore.actionPoints < 1 || readyAbilities.length === 0"
        @click="emit('use-ability')"
      >
        <span class="text-[10px] flex items-center justify-center gap-1.5">
          <PixelIcon name="power" size="12" />
          <span>НАВЫК</span>
        </span>
      </PixelButton>

      <!-- 3. Direct Question (Debate) -->
      <PixelButton
        variant="secondary"
        @click="emit('ask-question')"
      >
        <span class="text-[10px] flex items-center justify-center gap-1.5">
          <PixelIcon name="help" size="12" />
          <span>ВОПРОС</span>
        </span>
      </PixelButton>

      <!-- 4. Trade Item (1 AP) -->
      <PixelButton
        variant="gold"
        :disabled="playerStore.actionPoints < 1"
        @click="emit('trade-item')"
      >
        <span class="text-[10px] flex items-center justify-center gap-1.5">
          <PixelIcon name="trade" size="12" />
          <span>ОБМЕН (1 AP)</span>
        </span>
      </PixelButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import PixelButton from '@/components/ui/PixelButton.vue';
import PixelIcon from '@/components/ui/PixelIcon.vue';

const playerStore = usePlayerStore();

const emit = defineEmits<{
  (e: 'voluntary-reveal'): void;
  (e: 'use-ability'): void;
  (e: 'ask-question'): void;
  (e: 'trade-item'): void;
}>();

const unrevealedList = computed(() => {
  return Object.values(playerStore.cards).filter((c) => !c.isRevealed && c.category !== 'special_condition');
});

const readyAbilities = computed(() => {
  return playerStore.abilities.filter((a) => a.cooldownRemaining <= 0);
});
</script>
