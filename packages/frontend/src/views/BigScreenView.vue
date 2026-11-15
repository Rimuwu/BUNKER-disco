<template>
  <div class="relative w-screen h-screen overflow-hidden bg-[#0f111a] select-none">
    <!-- 3D Voxel Engine Canvas -->
    <canvas ref="canvasRef" class="w-full h-full block" />

    <!-- Top Phase 2 HUD: ResourceBar & DayCounter -->
    <div v-if="gameStore.phase === 'phase2'" class="absolute top-0 left-0 right-0 z-20 flex flex-col pointer-events-none">
      <DayCounter
        :current-day="gameStore.phase2.currentDay"
        :daily-phase="gameStore.phase2.dailyPhase"
      />
      <ResourceBar
        :resources="gameStore.phase2.resources"
        class="pointer-events-auto"
      />
    </div>

    <!-- Top Right Room Code & WS Status -->
    <div class="absolute top-4 right-6 z-30 flex items-center gap-3">
      <div class="bg-[#16162a]/90 border-2 border-[#ffc700] px-4 py-2 shadow-[4px_4px_0_#000]">
        <span class="text-[9px] font-['Press_Start_2P'] text-zinc-400 mr-2">КОД:</span>
        <span class="text-lg font-['Press_Start_2P'] text-[#fcd34d] tracking-widest">
          {{ roomStore.roomCode || 'ROOM' }}
        </span>
      </div>

      <div
        class="w-4 h-4 border-2 border-black shadow-[2px_2px_0_#000]"
        :class="wsStore.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'"
        :title="wsStore.isConnected ? 'Связь установлена' : 'Нет связи'"
      />
    </div>

    <!-- Active Speaker Lower-Third Spotlight -->
    <SpeakerSpotlight
      v-if="gameStore.phase === 'phase1' && activeSpeaker"
      :speaker="activeSpeaker"
    />

    <!-- Broadcast Voting Overlay -->
    <VotingOverlay
      v-if="gameStore.isVoting"
      :session="gameStore.phase1.votingSession"
      :players="roomStore.players"
    />

    <!-- Crisis Event Banner (Phase 2) -->
    <EventOverlay
      v-if="gameStore.phase === 'phase2' && activeCrisis"
      :event="activeCrisis"
    />

    <!-- Inspected Dossier Modal -->
    <PlayerDossierModal
      :is-open="uiStore.activeModal === 'dossier'"
      :player="inspectedPlayer"
      :cards="inspectedCards"
      @close="uiStore.closeDossier"
    />

    <!-- Lobby Broadcast Overlay -->
    <div
      v-if="gameStore.phase === 'lobby'"
      class="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-black/40 pointer-events-none"
    >
      <div class="w-full max-w-3xl bg-[#16162a]/95 border-4 border-[#ffc700] p-6 shadow-[10px_10px_0_#000] text-center flex flex-col gap-5 pointer-events-auto max-h-[90vh] overflow-y-auto">
        <div>
          <span class="text-xs font-['Press_Start_2P'] text-zinc-400 uppercase tracking-widest">
            ПОДКЛЮЧАЙТЕСЬ К ИГРЕ СО СМАРТФОНА
          </span>
          <h1 class="text-4xl sm:text-6xl font-['Press_Start_2P'] text-[#fcd34d] tracking-widest my-2">
            {{ roomStore.roomCode || '-----' }}
          </h1>
          <p class="text-xs text-zinc-300 font-['Silkscreen']">
            Вместимость бункера: K = ⌊{{ roomStore.players.length }}/2⌋ =
            <strong class="text-[#10b981]">{{ roomStore.capacityK }}</strong> мест
          </p>
        </div>

        <!-- Host Game Settings Controls (Deck Toggles) -->
        <div class="bg-[#1b1c36] border-2 border-[#3f416d] p-3 text-left shadow-[4px_4px_0_#000] flex flex-col gap-2">
          <div class="flex items-center gap-2 border-b border-[#3f416d] pb-1.5">
            <PixelIcon name="settings" size="14" class="text-[#ffc700]" />
            <span class="font-['Press_Start_2P'] text-[10px] text-[#fcd34d]">
              НАСТРОЙКИ КОЛОД ВЕДУЩЕГО
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-['Silkscreen']">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                :checked="roomStore.settings.enableSuperpowers"
                class="w-4 h-4 rounded-none accent-[#ffc700]"
                @change="handleScreenSettingChange('enableSuperpowers', ($event.target as HTMLInputElement).checked)"
              />
              <span>Суперсилы</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                :checked="roomStore.settings.enablePhobias"
                class="w-4 h-4 rounded-none accent-[#ffc700]"
                @change="handleScreenSettingChange('enablePhobias', ($event.target as HTMLInputElement).checked)"
              />
              <span>Фобии</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                :checked="roomStore.settings.enableCharacter"
                class="w-4 h-4 rounded-none accent-[#ffc700]"
                @change="handleScreenSettingChange('enableCharacter', ($event.target as HTMLInputElement).checked)"
              />
              <span>Черты характера</span>
            </label>

            <div class="flex items-center justify-between gap-2">
              <span>Лимит смены:</span>
              <select
                :value="roomStore.settings.rerollLimit"
                class="bg-[#0d0d1a] border border-[#3f416d] text-[#fcd34d] px-2 py-0.5 text-[10px] font-['Press_Start_2P']"
                @change="handleScreenSettingChange('rerollLimit', Number(($event.target as HTMLSelectElement).value))"
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

        <!-- Roster Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0d0d1a] p-3 border-2 border-[#3f416d] max-h-48 overflow-y-auto">
          <div
            v-for="p in roomStore.players"
            :key="p.playerId"
            class="bg-[#1b1c36] border border-[#3f416d] p-2 flex items-center gap-2 shadow-[2px_2px_0_#000]"
          >
            <PixelIcon v-if="p.isHost" name="crown" size="14" class="text-[#ffc700]" />
            <PixelIcon v-else name="user" size="14" class="text-zinc-400" />
            <span class="font-['Press_Start_2P'] text-[10px] text-white truncate">
              {{ p.nickname }}
            </span>
          </div>
        </div>

        <!-- Host Start Game Button -->
        <div class="flex justify-center">
          <PixelButton
            variant="primary"
            :disabled="roomStore.players.length < 2"
            class="px-6 py-3 flex items-center gap-2"
            @click="handleScreenStartGame"
          >
            <PixelIcon name="play" size="16" />
            <span class="text-xs sm:text-sm font-['Press_Start_2P']">
              {{ roomStore.players.length < 2 ? 'ОЖИДАНИЕ ИГРОКОВ (МИН. 2)' : 'НАЧАТЬ ИГРУ' }}
            </span>
          </PixelButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useRoomStore } from '@/stores/roomStore';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useWsStore } from '@/stores/wsStore';
import { useUiStore } from '@/stores/uiStore';
import { useWebSocket } from '@/composables/useWebSocket';
import { roomsApi } from '@/api/rooms.api';
import { actionsApi } from '@/api/actions.api';
import { VoxelEngine } from '@/engine/VoxelEngine';
import PixelButton from '@/components/ui/PixelButton.vue';
import PixelIcon from '@/components/ui/PixelIcon.vue';
import ResourceBar from '@/components/bigscreen/ResourceBar.vue';
import DayCounter from '@/components/bigscreen/DayCounter.vue';
import SpeakerSpotlight, { type ISpeaker } from '@/components/bigscreen/SpeakerSpotlight.vue';
import VotingOverlay from '@/components/bigscreen/VotingOverlay.vue';
import EventOverlay from '@/components/bigscreen/EventOverlay.vue';
import PlayerDossierModal from '@/components/bigscreen/PlayerDossierModal.vue';

const route = useRoute();
const canvasRef = ref<HTMLCanvasElement | null>(null);
let voxelEngine: VoxelEngine | null = null;

const roomStore = useRoomStore();
const gameStore = useGameStore();
const playerStore = usePlayerStore();
const wsStore = useWsStore();
const uiStore = useUiStore();
const { connect, disconnect } = useWebSocket();

onMounted(async () => {
  if (canvasRef.value) {
    voxelEngine = new VoxelEngine(canvasRef.value);
    voxelEngine.start();
  }

  // Bind code from route query if present
  const queryCode = (route.query.code as string)?.toUpperCase();
  if (queryCode) {
    roomStore.roomCode = queryCode;
    const savedCode = localStorage.getItem('bunker_room_code');
    const savedToken = localStorage.getItem('bunker_player_token');
    const savedId = localStorage.getItem('bunker_player_id');
    if (savedCode === queryCode && savedToken && savedId && !playerStore.playerToken) {
      playerStore.setCredentials({
        playerId: savedId,
        playerToken: savedToken,
        nickname: 'ВЕДУЩИЙ',
        isHost: true
      });
    }
  } else if (!roomStore.roomCode) {
    // Automatically initialize a room for host BigScreen if none set
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
    } catch (err) {
      console.warn('BigScreen room auto-creation deferred:', err);
    }
  }

  // Connect to WebSocket as BigScreen
  connect({
    isBigScreen: true,
    roomCode: roomStore.roomCode
  });
});

onUnmounted(() => {
  if (voxelEngine) {
    voxelEngine.destroy();
    voxelEngine = null;
  }
  disconnect();
});

// Sync crowd avatars with players list
watch(
  () => [roomStore.players, gameStore.phase1.activeSpeakerId],
  () => {
    if (voxelEngine) {
      voxelEngine.characterCrowd.syncPlayers(
        roomStore.players,
        gameStore.phase1.activeSpeakerId
      );
    }
  },
  { deep: true }
);

// Switch camera mode automatically based on phase & events
watch(
  () => gameStore.phase,
  (newPhase) => {
    if (!voxelEngine) return;
    if (newPhase === 'phase1') {
      voxelEngine.cameraDirector.toSurfaceWide();
      voxelEngine.surfaceScene.setDoorState('SEALED');
    } else if (newPhase === 'phase2') {
      voxelEngine.surfaceScene.setDoorState('LOCKDOWN');
      voxelEngine.cameraDirector.toBunkerOverview({ x: 0, y: 0, z: -10 } as any, 30);
    }
  }
);

watch(
  () => gameStore.isVoting,
  (isVoting) => {
    if (!voxelEngine) return;
    if (isVoting) {
      voxelEngine.cameraDirector.toVotingArena();
    } else if (gameStore.phase === 'phase1') {
      voxelEngine.cameraDirector.toSurfaceWide();
    }
  }
);

watch(
  () => gameStore.phase1.activeSpeakerId,
  (speakerId) => {
    if (!voxelEngine) return;
    if (speakerId) {
      const pos = voxelEngine.characterCrowd.getCharacterPosition(speakerId);
      if (pos) {
        voxelEngine.cameraDirector.focusOnSpeaker(pos);
      }
    } else if (gameStore.phase === 'phase1' && !gameStore.isVoting) {
      voxelEngine.cameraDirector.toSurfaceWide();
    }
  }
);

// Wire Fog of War and Bunker room reveal upon room discovery
watch(
  () => gameStore.phase2.revealedRooms,
  (rooms, oldRooms) => {
    if (!voxelEngine) return;
    const oldSet = new Set(oldRooms || []);
    for (const roomId of rooms) {
      if (!oldSet.has(roomId)) {
        voxelEngine.bunkerBuilder.revealRoom(roomId);
        const roomPos = voxelEngine.bunkerBuilder.getRoomPosition(roomId);
        if (roomPos) {
          voxelEngine.fogOfWar.burnHoleInFog(roomPos, 8.0);
        }
      }
    }
  },
  { deep: true }
);

const activeSpeaker = computed<ISpeaker | null>(() => {
  const id = gameStore.phase1.activeSpeakerId;
  if (!id) return null;
  const player = roomStore.players.find((p) => p.playerId === id);
  return {
    playerId: id,
    nickname: player?.nickname || 'Оратор',
    timerSeconds: gameStore.phase1.debateTimerRemaining || 60
  };
});

const activeCrisis = computed(() => {
  return gameStore.phase2.activeThreats[0] || null;
});

const inspectedPlayer = computed(() => {
  const id = uiStore.inspectedPlayerId;
  return roomStore.players.find((p) => p.playerId === id) || null;
});

const inspectedCards = computed(() => {
  const p = inspectedPlayer.value;
  if (!p || !p.cards) return [];
  return Object.entries(p.cards).map(([category, card]: [string, any]) => ({
    cardId: card?.cardId || `${p.playerId}_${category}`,
    category: card?.category || category,
    originTag: card?.originTag || 'BASE',
    name: card?.name || 'Засекречено',
    description: card?.description || '',
    isRevealed: Boolean(card?.isRevealed),
    rarity: card?.rarity || 'common'
  }));
});

const handleScreenSettingChange = async (field: string, value: any) => {
  const update = { [field]: value };
  roomStore.updateSettings(update);
  try {
    await roomsApi.updateSettings(roomStore.roomCode, update);
  } catch (err) {
    console.warn('Failed to update settings from BigScreen:', err);
  }
};

const handleScreenStartGame = async () => {
  try {
    await actionsApi.startGame();
  } catch (err: any) {
    console.error('Failed to start game from BigScreen:', err);
    const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || '';
    uiStore.addToast(msg ? `Не удалось запустить игру: ${msg}` : 'Не удалось запустить игру', 'error');
  }
};
</script>
