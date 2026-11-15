<template>
  <div class="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-center p-4 select-none">
    <div class="w-full max-w-md bg-[#16162a] border-4 border-[#3f416d] p-6 shadow-[8px_8px_0_#000] flex flex-col gap-6 text-center">
      <div>
        <h1 class="font-['Press_Start_2P'] text-2xl text-[#fcd34d] tracking-wider mb-2">
          BUNKER-DISCO
        </h1>
        <p class="text-xs text-zinc-400 font-['Silkscreen']">
          Постапокалиптическая игра на выживание и социальную дедукцию
        </p>
      </div>

      <div class="flex flex-col gap-3">
        <!-- Create Room & Launch BigScreen -->
        <PixelButton
          variant="primary"
          :loading="isCreating"
          class="w-full text-xs flex items-center justify-center gap-2"
          @click="handleCreateRoom"
        >
          <PixelIcon name="crown" size="14" class="text-[#ffc700]" />
          <span>СОЗДАТЬ ИГРУ (ВЕДУЩИЙ)</span>
        </PixelButton>

        <!-- Existing BigScreen (TV/Projector) -->
        <router-link to="/screen" class="w-full">
          <PixelButton variant="primary" class="w-full text-xs flex items-center justify-center gap-2">
            <PixelIcon name="tv" size="14" class="text-[#38bdf8]" />
            <span>БОЛЬШОЙ ЭКРАН (ТВ)</span>
          </PixelButton>
        </router-link>

        <!-- PlayerScreen Mode (Mobile) -->
        <router-link to="/play" class="w-full">
          <PixelButton variant="gold" class="w-full text-xs flex items-center justify-center gap-2">
            <PixelIcon name="phone" size="14" class="text-[#0d0d1a]" />
            <span>ЭКРАН ИГРОКА (ТЕЛЕФОН)</span>
          </PixelButton>
        </router-link>
      </div>

      <div v-if="errorMessage" class="text-xs text-red-400 font-['Silkscreen']">
        {{ errorMessage }}
      </div>

      <div class="border-t border-[#3f416d] pt-3 text-[10px] text-zinc-500 font-['Silkscreen']">
        Интерактивная игра на выживание в бункере
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { roomsApi } from '@/api/rooms.api';
import { useRoomStore } from '@/stores/roomStore';
import { usePlayerStore } from '@/stores/playerStore';
import PixelButton from '@/components/ui/PixelButton.vue';
import PixelIcon from '@/components/ui/PixelIcon.vue';

const router = useRouter();
const roomStore = useRoomStore();
const playerStore = usePlayerStore();
const isCreating = ref(false);
const errorMessage = ref('');

const handleCreateRoom = async () => {
  isCreating.value = true;
  errorMessage.value = '';
  try {
    const res = await roomsApi.createRoom('ВЕДУЩИЙ');
    const token = res.playerToken || res.token || res.data?.playerToken || res.data?.token;
    const hostId = res.playerId || res.data?.playerId;
    const code = res.code || res.roomCode || res.data?.code || res.data?.roomCode;
    const roomId = res.roomId || res.data?.roomId;

    if (token && hostId) {
      playerStore.setCredentials({
        playerId: hostId,
        playerToken: token,
        nickname: 'ВЕДУЩИЙ',
        isHost: true
      });
      localStorage.setItem('bunker_player_token', token);
      localStorage.setItem('bunker_player_id', hostId);
      localStorage.setItem('bunker_room_code', code);
    }

    roomStore.setRoom({
      roomId,
      roomCode: code,
      isHost: true
    });
    router.push({ path: '/screen', query: { code } });
  } catch (err: any) {
    errorMessage.value = err?.response?.data?.message || 'Не удалось создать комнату';
  } finally {
    isCreating.value = false;
  }
};
</script>
