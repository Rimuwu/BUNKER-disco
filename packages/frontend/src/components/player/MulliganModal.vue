<template>
  <PixelModal
    :is-open="isOpen"
    title="ПЕРЕРАНДОМ ПЕРСОНАЖА"
    @close="emit('close')"
  >
    <div class="flex flex-col gap-4 text-center p-2">
      <p class="text-xs text-zinc-300 font-['Silkscreen'] leading-relaxed">
        Если текущие характеристики, болезни или профессия кажутся вам безнадёжными, вы можете сбросить руку и получить совершенно нового персонажа.
      </p>

      <!-- Reroll Attempts Counter -->
      <div class="bg-[#1b1c36] border-2 border-[#3f416d] p-3 shadow-[3px_3px_0_#000]">
        <div class="text-[10px] font-['Press_Start_2P'] text-[#9ca3af] mb-1">
          ЛИМИТ ПЕРЕРАНДОМА
        </div>
        <div class="text-sm font-['Press_Start_2P'] text-[#fcd34d]">
          {{ attemptsText }}
        </div>
      </div>

      <div class="flex justify-center pt-2">
        <PixelButton
          variant="gold"
          :disabled="isLocked || !canReroll"
          :loading="isLocked"
          @click="handleReroll"
        >
          <span class="text-xs flex items-center gap-1.5">
            <PixelIcon v-if="!isLocked" name="refresh" size="12" />
            <span>{{ isLocked ? 'ПЕРЕТАСОВКА...' : 'СГЕНЕРИРОВАТЬ НОВОГО' }}</span>
          </span>
        </PixelButton>
      </div>
    </div>
  </PixelModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import { useRoomStore } from '@/stores/roomStore';
import { useTactileAudio } from '@/composables/useTactileAudio';
import PixelModal from '@/components/ui/PixelModal.vue';
import PixelButton from '@/components/ui/PixelButton.vue';
import PixelIcon from '@/components/ui/PixelIcon.vue';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
  }>(),
  {
    isOpen: false
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'rerolled'): void;
}>();

const playerStore = usePlayerStore();
const roomStore = useRoomStore();
const { playLockShatter } = useTactileAudio();

const isLocked = ref(false);

const canReroll = computed(() => {
  if (roomStore.settings.rerollLimit === 999) return true;
  return playerStore.remainingRerolls > 0;
});

const attemptsText = computed(() => {
  if (roomStore.settings.rerollLimit === 999) {
    return 'НЕОГРАНИЧЕННО (Party Mode)';
  }
  return `ОСТАЛОСЬ: ${playerStore.remainingRerolls} ИЗ ${roomStore.settings.rerollLimit}`;
});

const handleReroll = () => {
  if (isLocked.value || !canReroll.value) return;

  isLocked.value = true;
  playLockShatter();
  playerStore.decrementRerolls();

  emit('rerolled');

  // 2-second debounce lock to prevent duplicate queue submissions
  setTimeout(() => {
    isLocked.value = false;
    emit('close');
  }, 2000);
};
</script>
