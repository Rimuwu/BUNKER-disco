<template>
  <teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-h-[85vh] bg-[#16162a] border-t-4 border-[#ffc700] p-4 flex flex-col shadow-[0_-8px_0_#000]"
      >
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b-2 border-[#3f416d] mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-[#27272a] border-2 border-[#ffc700] flex items-center justify-center font-['Press_Start_2P'] text-sm">
              {{ playerNickname.slice(0, 2).toUpperCase() }}
            </div>
            <div>
              <h3 class="font-['Press_Start_2P'] text-sm text-[#fcd34d]">
                ДОСЬЕ: {{ playerNickname }}
              </h3>
              <span class="text-xs text-zinc-400">
                Открыто карт: {{ revealedCount }} / {{ safeCards.length }}
              </span>
            </div>
          </div>
          <button
            class="p-2 text-zinc-400 hover:text-red-500"
            @click="emit('close')"
          >
            <PixelIcon name="close" size="14" />
          </button>
        </div>

        <!-- Arc Fan Card Deck -->
        <div class="overflow-x-auto py-4">
          <div class="fan-deck-container min-w-[700px] h-[320px] mx-auto">
            <div
              v-for="(card, index) in safeCards"
              :key="card.cardId || card.category"
              class="fan-card-item"
              :style="fanTransform(index, safeCards.length)"
            >
              <div class="w-48 h-72">
                <TactileCard
                  :card="card"
                  :interactive="false"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Footer / Status -->
        <div class="pt-3 border-t-2 border-[#3f416d] text-center text-xs text-zinc-400 font-['Silkscreen'] flex items-center justify-center gap-2">
          <PixelIcon name="warning" size="12" class="text-yellow-400" />
          <span>Секретные цели и квесты соперника замаскированы протоколом безопасности бункера.</span>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IPlayerCard } from '@/stores/playerStore';
import TactileCard from './TactileCard.vue';
import PixelIcon from '@/components/ui/PixelIcon.vue';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    playerNickname: string;
    cards: IPlayerCard[];
  }>(),
  {
    isOpen: false,
    playerNickname: 'Игрок',
    cards: () => []
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// Exclude secret quest cards completely to adhere to SECRET_QUEST_REVEAL_FORBIDDEN
const safeCards = computed(() => {
  return props.cards.filter((c) => c.category !== 'special_condition');
});

const revealedCount = computed(() => {
  return safeCards.value.filter((c) => c.isRevealed).length;
});

const fanTransform = (index: number, total: number) => {
  if (total <= 1) return { transform: 'none' };
  const mid = (total - 1) / 2;
  const offset = index - mid;
  const angle = offset * 6; // +/- 6 degrees per card
  const translateY = Math.abs(offset) * 12; // arc curve
  const translateX = offset * 48; // spreading apart

  return {
    transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${angle}deg)`,
    zIndex: `${index + 10}`
  };
};
</script>
