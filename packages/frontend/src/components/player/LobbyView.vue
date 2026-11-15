<template>
  <div class="w-full max-w-2xl mx-auto flex flex-col gap-6 p-4">
    <!-- Room Code Banner -->
    <div class="bg-[#16162a] border-4 border-[#3f416d] p-4 text-center shadow-[6px_6px_0_#000]">
      <span class="text-[10px] font-['Press_Start_2P'] text-[#9ca3af] uppercase tracking-wider block mb-1">
        КОД КОМНАТЫ:
      </span>
      <h1 class="text-3xl sm:text-4xl font-['Press_Start_2P'] text-[#fcd34d] tracking-widest">
        {{ roomStore.roomCode || '-----' }}
      </h1>
      <span class="text-xs text-zinc-400 font-['Silkscreen'] mt-2 block">
        Вместимость бункера: <strong class="text-[#10b981]">{{ roomStore.capacityK }}</strong> мест (из {{ roomStore.players.length }})
      </span>
    </div>

    <!-- Host Settings & Deck Toggles (Shown ONLY to Host) -->
    <div v-if="isHost" class="bg-[#1b1c36] border-2 border-[#3f416d] p-4 shadow-[4px_4px_0_#000] flex flex-col gap-3">
      <div class="flex items-center justify-between border-b border-[#3f416d] pb-2">
        <div class="flex items-center gap-2">
          <PixelIcon name="settings" size="14" class="text-[#ffc700]" />
          <h3 class="font-['Press_Start_2P'] text-xs text-[#fcd34d]">
            НАСТРОЙКИ КОЛОД
          </h3>
        </div>
        <span class="text-[9px] text-[#ffc700] font-['Press_Start_2P']">
          ВЕДУЩИЙ
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-['Silkscreen']">
        <!-- Toggle: Superpowers -->
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            :checked="roomStore.settings.enableSuperpowers"
            class="w-4 h-4 rounded-none accent-[#ffc700]"
            @change="updateDeckToggle('enableSuperpowers', ($event.target as HTMLInputElement).checked)"
          />
          <span>Суперсилы</span>
        </label>

        <!-- Toggle: Phobias -->
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            :checked="roomStore.settings.enablePhobias"
            class="w-4 h-4 rounded-none accent-[#ffc700]"
            @change="updateDeckToggle('enablePhobias', ($event.target as HTMLInputElement).checked)"
          />
          <span>Фобии</span>
        </label>

        <!-- Toggle: Character -->
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            :checked="roomStore.settings.enableCharacter"
            class="w-4 h-4 rounded-none accent-[#ffc700]"
            @change="updateDeckToggle('enableCharacter', ($event.target as HTMLInputElement).checked)"
          />
          <span>Черты характера</span>
        </label>

        <!-- Reroll Limit -->
        <div class="flex items-center justify-between gap-2">
          <span>Лимит смены персонажа:</span>
          <select
            :value="roomStore.settings.rerollLimit"
            class="bg-[#0d0d1a] border border-[#3f416d] text-[#fcd34d] px-2 py-1 text-xs font-['Press_Start_2P']"
            @change="updateRerollLimit(Number(($event.target as HTMLSelectElement).value))"
          >
            <option :value="0">0 (Без права на ошибку)</option>
            <option :value="1">1 попытка</option>
            <option :value="2">2 попытки</option>
            <option :value="3">3 попытки</option>
            <option :value="5">5 попыток</option>
            <option :value="999">Без ограничений</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Non-Host Status Message -->
    <div v-else class="bg-[#1b1c36] border-2 border-[#3f416d] p-3 text-center shadow-[4px_4px_0_#000]">
      <div class="flex items-center justify-center gap-2 text-xs font-['Press_Start_2P'] text-[#38bdf8] mb-1">
        <PixelIcon name="check" size="14" class="text-[#10b981]" />
        <span>ВЫ В УБЕЖИЩЕ</span>
      </div>
      <p class="text-[10px] text-zinc-400 font-['Silkscreen']">
        Ожидайте настройки параметров и старта игры ведущим...
      </p>
    </div>

    <!-- Players Roster -->
    <div class="bg-[#16162a] border-2 border-[#3f416d] p-4 shadow-[4px_4px_0_#000] flex flex-col gap-3">
      <div class="flex items-center justify-between border-b border-[#3f416d] pb-2">
        <div class="flex items-center gap-2">
          <PixelIcon name="users" size="14" class="text-zinc-400" />
          <h3 class="font-['Press_Start_2P'] text-xs text-[#f3f4f6]">
            ИГРОКИ ({{ roomStore.players.length }}/{{ roomStore.settings.maxPlayers }})
          </h3>
        </div>
        <span class="text-[9px] text-zinc-400 font-['Press_Start_2P']">
          МИН: 2
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div
          v-for="p in roomStore.players"
          :key="p.playerId"
          class="bg-[#1b1c36] border border-[#3f416d] p-2 flex items-center gap-2 shadow-[2px_2px_0_#000]"
        >
          <div class="w-8 h-8 bg-[#27272a] border border-[#71717a] flex items-center justify-center">
            <PixelIcon v-if="p.isHost" name="crown" size="14" class="text-[#ffc700]" />
            <PixelIcon v-else name="user" size="14" class="text-zinc-400" />
          </div>
          <div class="overflow-hidden">
            <span class="font-['Press_Start_2P'] text-[10px] truncate block text-[#f3f4f6]">
              {{ p.nickname }}
            </span>
            <span class="text-[8px] text-zinc-500 font-['Silkscreen']">
              {{ p.isConnected ? 'В сети' : 'Офлайн' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Start Game Button (Host Only) -->
    <div v-if="isHost" class="flex justify-center pt-2">
      <PixelButton
        variant="primary"
        :disabled="roomStore.players.length < 2"
        class="flex items-center gap-2"
        @click="emit('start-game')"
      >
        <PixelIcon name="play" size="14" />
        <span class="text-xs sm:text-sm">
          {{ roomStore.players.length < 2 ? 'ОЖИДАНИЕ ИГРОКОВ (МИН. 2)' : 'НАЧАТЬ ИГРУ' }}
        </span>
      </PixelButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoomStore } from '@/stores/roomStore';
import { usePlayerStore } from '@/stores/playerStore';
import PixelButton from '@/components/ui/PixelButton.vue';
import PixelIcon from '@/components/ui/PixelIcon.vue';

const roomStore = useRoomStore();
const playerStore = usePlayerStore();

const emit = defineEmits<{
  (e: 'update-settings', settings: Partial<typeof roomStore.settings>): void;
  (e: 'start-game'): void;
}>();

const isHost = computed(() => {
  return roomStore.isHost || playerStore.isHost;
});

const updateDeckToggle = (field: 'enableSuperpowers' | 'enablePhobias' | 'enableCharacter', value: boolean) => {
  if (!isHost.value) return;
  const update = { [field]: value };
  roomStore.updateSettings(update);
  emit('update-settings', update);
};

const updateRerollLimit = (limit: number) => {
  if (!isHost.value) return;
  const update = { rerollLimit: limit };
  roomStore.updateSettings(update);
  emit('update-settings', update);
};
</script>
