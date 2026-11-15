<template>
  <PixelModal
    :is-open="isOpen"
    :title="`ДОСЬЕ ВЫЖИВШЕГО: ${player?.nickname || 'НЕИЗВЕСТНЫЙ'}`"
    @close="emit('close')"
  >
    <div class="flex flex-col gap-4 p-2">
      <div class="flex items-center gap-4 bg-[#1b1c36] p-3 border border-[#3f416d]">
        <div class="w-16 h-16 bg-[#27272a] border-2 border-[#ffc700] flex items-center justify-center shadow-[2px_2px_0_#000]">
          <PixelIcon name="user" size="32" class="text-[#fcd34d]" />
        </div>
        <div>
          <h4 class="font-['Press_Start_2P'] text-sm text-[#fcd34d]">
            {{ player?.nickname }}
          </h4>
          <span class="text-xs text-zinc-400 font-['Silkscreen'] flex items-center gap-1.5 mt-1">
            <span>Статус:</span>
            <template v-if="player?.isEliminated">
              <PixelIcon name="skull" size="12" class="text-red-500" />
              <span class="text-red-400">Изгнан из бункера</span>
            </template>
            <template v-else>
              <PixelIcon name="check" size="12" class="text-green-500" />
              <span class="text-green-400">В строю выживших</span>
            </template>
          </span>
        </div>
      </div>

      <!-- Cards Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div
          v-for="card in cards"
          :key="card.category"
          class="bg-[#0d0d1a] border-2 p-2 flex flex-col justify-between min-h-[120px] shadow-[2px_2px_0_#000]"
          :class="card.isRevealed ? 'border-[#3f416d]' : 'border-[#e02424] opacity-80'"
        >
          <div class="flex items-center justify-between border-b border-[#2d2e4d] pb-1">
            <span class="text-[8px] font-['Press_Start_2P'] text-[#ffc700] truncate max-w-[90px]">
              {{ card.category }}
            </span>
            <PixelBadge :tag="card.originTag" />
          </div>

          <div v-if="card.isRevealed" class="my-auto py-1">
            <div class="text-[10px] font-['Press_Start_2P'] text-white">
              {{ card.name }}
            </div>
            <p class="text-[9px] text-zinc-400 line-clamp-2 mt-0.5">
              {{ card.description }}
            </p>
          </div>
          <div v-else class="my-auto text-center py-2 flex flex-col items-center">
            <PixelIcon name="lock" size="20" class="text-red-500 mb-1" />
            <span class="text-[8px] font-['Press_Start_2P'] text-[#ef4444]">[LOCKED]</span>
          </div>
        </div>
      </div>
    </div>
  </PixelModal>
</template>

<script setup lang="ts">
import type { IPlayerCard } from '@/stores/playerStore';
import type { IRoomPlayer } from '@/stores/roomStore';
import PixelModal from '@/components/ui/PixelModal.vue';
import PixelBadge from '@/components/ui/PixelBadge.vue';
import PixelIcon from '@/components/ui/PixelIcon.vue';

defineProps<{
  isOpen: boolean;
  player: IRoomPlayer | null;
  cards: IPlayerCard[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>
