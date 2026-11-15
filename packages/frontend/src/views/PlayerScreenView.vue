<template>
  <div class="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-between p-2 sm:p-4 select-none">
    <!-- Mobile Max-Width Container (360px-440px) -->
    <div class="w-full max-w-[440px] flex-1 flex flex-col justify-between bg-[#16162a] border-4 border-[#3f416d] shadow-[8px_8px_0_#000] relative overflow-hidden">
      <!-- Top Header / StatusBar -->
      <div class="bg-[#1b1c36] border-b-2 border-[#3f416d] p-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <PixelIcon name="user" size="14" class="text-[#fcd34d]" />
          <span class="font-['Press_Start_2P'] text-xs text-[#fcd34d] truncate max-w-[140px]">
            {{ playerStore.nickname || 'ВЫЖИВШИЙ' }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[9px] font-['Press_Start_2P'] text-zinc-400">
            {{ roomStore.roomCode }}
          </span>
          <div
            class="w-3 h-3 border border-black shadow-[1px_1px_0_#000]"
            :class="wsStore.isConnected ? 'bg-[#10b981]' : 'bg-[#e02424]'"
          />
        </div>
      </div>

      <!-- State 1: Join / Enter Code Form -->
      <div v-if="!isJoined" class="flex-1 flex flex-col items-center justify-center p-6 gap-4 text-center">
        <h2 class="font-['Press_Start_2P'] text-lg text-[#fcd34d] mb-2">
          ВХОД В БУНКЕР
        </h2>

        <div class="w-full flex flex-col gap-3">
          <div>
            <label class="block text-left text-[10px] font-['Press_Start_2P'] text-zinc-400 mb-1">
              КОД КОМНАТЫ (5 БУКВ):
            </label>
            <input
              v-model="joinCode"
              type="text"
              maxlength="5"
              placeholder="БУНКЕР"
              class="w-full bg-[#0d0d1a] border-2 border-[#3f416d] p-3 font-['Press_Start_2P'] text-center uppercase tracking-widest text-[#ffc700] focus:border-[#ffc700] outline-none"
            />
          </div>

          <div>
            <label class="block text-left text-[10px] font-['Press_Start_2P'] text-zinc-400 mb-1">
              ВАШЕ ИМЯ (НИКНЕЙМ):
            </label>
            <input
              v-model="joinNickname"
              type="text"
              maxlength="16"
              placeholder="Странник"
              class="w-full bg-[#0d0d1a] border-2 border-[#3f416d] p-3 font-['Silkscreen'] text-center text-white focus:border-[#ffc700] outline-none"
            />
          </div>

          <PixelButton
            variant="primary"
            :disabled="!canSubmitJoin"
            :loading="isJoining"
            class="w-full mt-2"
            @click="handleJoin"
          >
            ВОЙТИ В УБЕЖИЩЕ
          </PixelButton>
        </div>
      </div>

      <!-- State 2: Lobby View -->
      <div v-else-if="gameStore.phase === 'lobby'" class="flex-1 overflow-y-auto">
        <LobbyView
          @start-game="handleStartGame"
          @update-settings="handleUpdateSettings"
        />
      </div>

      <!-- State 3: Phase 1 (Selection & Debate) -->
      <div v-else-if="gameStore.phase === 'phase1'" class="flex-1 flex flex-col justify-between overflow-hidden">
        <!-- Active Voting Ballot Overlay -->
        <div v-if="gameStore.isVoting" class="p-3">
          <VotingBallot
            :candidates="votingCandidates"
            :timer-seconds="gameStore.phase1.votingSession?.timerSeconds || 60"
            :is-tie-break="gameStore.phase1.votingSession?.isTieBreakRound"
            @vote="handleCastVote"
            @veto="handleCandidateVeto"
          />
        </div>

        <!-- Normal Phase 1 Card Deck Display -->
        <div v-else class="flex-1 flex flex-col items-center justify-center p-3 overflow-y-auto">
          <!-- Rival Players Dossier Inspection Strip -->
          <div v-if="rivalPlayers.length > 0" class="w-full mb-2 bg-[#0d0d1a] border border-[#3f416d] p-1.5 flex items-center gap-1.5 overflow-x-auto">
            <span class="text-[8px] font-['Press_Start_2P'] text-zinc-400 whitespace-nowrap">ДОСЬЕ:</span>
            <button
              v-for="rival in rivalPlayers"
              :key="rival.playerId"
              class="px-2 py-1 bg-[#1b1c36] border border-[#ffc700] text-[8px] font-['Press_Start_2P'] text-[#fcd34d] hover:bg-[#2b2c4e] whitespace-nowrap shadow-[1px_1px_0_#000]"
              @click="openRivalDossier(rival)"
            >
              {{ rival.nickname }}
            </button>
          </div>

          <!-- Active Card Carousel / Single Card View -->
          <div class="flex flex-col items-center gap-3">
            <TactileCard
              v-if="currentCard"
              :card="currentCard"
              @reveal-requested="handleCardReveal"
            />

            <!-- Card Category Navigation Pips -->
            <div class="flex items-center gap-2 mt-1">
              <button
                class="px-2 py-1 bg-[#1b1c36] border border-[#3f416d] text-xs font-['Press_Start_2P'] flex items-center justify-center disabled:opacity-30"
                :disabled="cardIndex === 0"
                @click="cardIndex = Math.max(0, cardIndex - 1)"
              >
                <PixelIcon name="arrow-left" size="10" />
              </button>
              <span class="text-[10px] font-['Press_Start_2P'] text-zinc-400">
                {{ cardIndex + 1 }} / {{ playerStore.cardList.length || 7 }}
              </span>
              <button
                class="px-2 py-1 bg-[#1b1c36] border border-[#3f416d] text-xs font-['Press_Start_2P'] flex items-center justify-center disabled:opacity-30"
                :disabled="cardIndex >= playerStore.cardList.length - 1"
                @click="cardIndex = Math.min(playerStore.cardList.length - 1, cardIndex + 1)"
              >
                <PixelIcon name="arrow-right" size="10" />
              </button>
            </div>

            <!-- Mulligan / Reroll Button (Appears only when player sees character cards) -->
            <div v-if="playerStore.remainingRerolls > 0" class="w-full max-w-[280px] mt-2">
              <PixelButton
                variant="gold"
                :disabled="!playerStore.canReroll"
                class="w-full flex items-center justify-center gap-2"
                @click="isMulliganOpen = true"
              >
                <PixelIcon name="refresh" size="12" />
                <span class="text-[9px]">ПЕРЕРАНДОМИТЬ ({{ playerStore.remainingRerolls }})</span>
              </PixelButton>
            </div>
          </div>
        </div>

        <!-- Bottom Action Bar (3 AP Economy) -->
        <ActionBar
          @voluntary-reveal="handleVoluntaryReveal"
          @use-ability="handleUseAbility"
          @ask-question="handleAskQuestion"
          @trade-item="handleTradeItem"
        />
      </div>

      <!-- State 4: Phase 2 (Underground Survival) -->
      <div v-else-if="gameStore.phase === 'phase2'" class="flex-1 flex flex-col justify-between p-3 overflow-y-auto gap-3">
        <!-- Bunker Status Bar -->
        <div class="bg-[#1b1c36] border-2 border-[#3f416d] p-3 shadow-[3px_3px_0_#000]">
          <div class="flex justify-between items-center text-[10px] font-['Press_Start_2P'] text-[#ffc700] mb-2">
            <span>ДЕНЬ {{ gameStore.phase2.currentDay }} / 30</span>
            <span>{{ gameStore.phase2.dailyPhase }}</span>
          </div>

          <div class="grid grid-cols-3 gap-1 text-[9px] font-['Silkscreen'] text-zinc-300">
            <div class="flex items-center gap-1"><PixelIcon name="food" size="12" class="text-[#84cc16]" /> Еда: {{ gameStore.phase2.resources.food }}%</div>
            <div class="flex items-center gap-1"><PixelIcon name="water" size="12" class="text-[#06b6d4]" /> Вода: {{ gameStore.phase2.resources.water }}%</div>
            <div class="flex items-center gap-1"><PixelIcon name="air" size="12" class="text-[#e0f2fe]" /> Воздух: {{ gameStore.phase2.resources.air }}%</div>
            <div class="flex items-center gap-1"><PixelIcon name="meds" size="12" class="text-[#f43f5e]" /> Мед: {{ gameStore.phase2.resources.medicine }}%</div>
            <div class="flex items-center gap-1"><PixelIcon name="power" size="12" class="text-[#f97316]" /> Энерг: {{ gameStore.phase2.resources.power }}%</div>
            <div class="flex items-center gap-1"><PixelIcon name="morale" size="12" class="text-[#fbbf24]" /> Мораль: {{ gameStore.phase2.resources.morale }}%</div>
          </div>
        </div>

        <!-- Inventory / Baggage Slots (3-4 Slots) -->
        <div class="bg-[#1b1c36] border-2 border-[#3f416d] p-3 shadow-[3px_3px_0_#000]">
          <h4 class="font-['Press_Start_2P'] text-[10px] text-[#fcd34d] mb-2 flex items-center gap-1.5">
            <PixelIcon name="backpack" size="14" />
            <span>ИНВЕНТАРЬ ВЫЖИВШЕГО ({{ playerStore.inventory.length }}/4 СЛОТА)</span>
          </h4>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="item in playerStore.inventory"
              :key="item.itemId"
              class="bg-[#0d0d1a] border border-[#3f416d] p-2 text-[9px]"
            >
              <div class="font-bold text-white truncate">{{ item.name }}</div>
              <div class="text-zinc-400">Вес: {{ item.weight }} ед.</div>
            </div>
            <div
              v-for="emptySlot in Math.max(0, 4 - playerStore.inventory.length)"
              :key="emptySlot"
              class="bg-[#0d0d1a]/50 border border-dashed border-[#2d2e4d] p-2 flex items-center justify-center text-[9px] text-zinc-600"
            >
              [Пустой слот]
            </div>
          </div>
        </div>

        <!-- Secret Quests Panel -->
        <div v-if="playerStore.secretQuest" class="bg-[#1e1b4b] border-2 border-[#6366f1] p-3 shadow-[3px_3px_0_#000]">
          <div class="flex items-center justify-between text-[9px] font-['Press_Start_2P'] text-[#a5b4fc] mb-1">
            <span class="flex items-center gap-1.5">
              <PixelIcon name="target" size="12" />
              <span>СЕКРЕТНЫЙ КВЕСТ</span>
            </span>
            <span>[ТАЙНА]</span>
          </div>
          <h4 class="text-xs font-bold text-white mb-1">
            {{ playerStore.secretQuest.name }}
          </h4>
          <p class="text-[9px] text-zinc-300 font-['Silkscreen']">
            {{ playerStore.secretQuest.description }}
          </p>
        </div>
      </div>

      <!-- State 5: Game Over -->
      <div v-else-if="gameStore.phase === 'ended'" class="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
        <h2 class="font-['Press_Start_2P'] text-xl text-[#fcd34d]">
          ИГРА ЗАВЕРШЕНА
        </h2>
        <p class="text-xs text-zinc-300 font-['Silkscreen']">
          Спасибо за участие в BUNKER-disco!
        </p>
      </div>

      <!-- Modals -->
      <MulliganModal
        :is-open="isMulliganOpen"
        @close="isMulliganOpen = false"
        @rerolled="handleRerolled"
      />

      <FanDossier
        :is-open="isDossierOpen"
        :player-nickname="inspectedRivalNickname"
        :cards="inspectedRivalCards"
        @close="isDossierOpen = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRoomStore } from '@/stores/roomStore';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore, type IPlayerCard } from '@/stores/playerStore';
import { useWsStore } from '@/stores/wsStore';
import { useUiStore } from '@/stores/uiStore';
import { useWebSocket } from '@/composables/useWebSocket';
import { roomsApi } from '@/api/rooms.api';
import { actionsApi } from '@/api/actions.api';
import { playersApi } from '@/api/players.api';
import PixelButton from '@/components/ui/PixelButton.vue';
import PixelIcon from '@/components/ui/PixelIcon.vue';
import TactileCard from '@/components/player/TactileCard.vue';
import ActionBar from '@/components/player/ActionBar.vue';
import VotingBallot, { type ICandidate } from '@/components/player/VotingBallot.vue';
import MulliganModal from '@/components/player/MulliganModal.vue';
import FanDossier from '@/components/player/FanDossier.vue';
import LobbyView from '@/components/player/LobbyView.vue';

const route = useRoute();
const roomStore = useRoomStore();
const gameStore = useGameStore();
const playerStore = usePlayerStore();
const wsStore = useWsStore();
const uiStore = useUiStore();
const { connect } = useWebSocket();

const joinCode = ref('');
const joinNickname = ref('');
const isJoining = ref(false);
const isMulliganOpen = ref(false);
const isDossierOpen = ref(false);
const inspectedRivalNickname = ref('');
const inspectedRivalCards = ref<IPlayerCard[]>([]);
const cardIndex = ref(0);

onMounted(() => {
  const queryCode = (route.query.code as string)?.toUpperCase();
  if (queryCode) {
    joinCode.value = queryCode;
  }
  const savedToken = localStorage.getItem('bunker_player_token');
  const savedCode = localStorage.getItem('bunker_room_code');
  const savedId = localStorage.getItem('bunker_player_id');
  const savedNick = localStorage.getItem('bunker_player_nick');
  if (savedToken && savedCode && savedId && !playerStore.playerToken) {
    playerStore.setCredentials({
      playerId: savedId,
      playerToken: savedToken,
      nickname: savedNick || 'Выживший'
    });
    roomStore.setRoom({ roomCode: savedCode });
    connect({ token: savedToken });
  }
});

const isJoined = computed(() => !!playerStore.playerToken && !!roomStore.roomCode);

const rivalPlayers = computed(() => {
  return roomStore.players.filter((p) => p.playerId !== playerStore.playerId);
});

const openRivalDossier = (rival: any) => {
  inspectedRivalNickname.value = rival.nickname;
  if (rival.cards) {
    inspectedRivalCards.value = Object.entries(rival.cards).map(([category, card]: [string, any]) => ({
      category,
      name: card?.name || 'Засекречено',
      description: card?.description || '',
      isRevealed: Boolean(card?.isRevealed),
      originTag: card?.originTag || 'BASE',
      rarity: card?.rarity || 'common'
    }));
  } else {
    const categories = ['profession', 'biology', 'health', 'hobby', 'item', 'fact'];
    inspectedRivalCards.value = categories.map((cat) => ({
      category: cat,
      name: 'Засекречено',
      description: 'Карта еще не раскрыта соперником',
      isRevealed: false,
      originTag: 'BASE',
      rarity: 'common'
    }));
  }
  isDossierOpen.value = true;
};

const canSubmitJoin = computed(() => {
  return joinCode.value.trim().length === 5 && joinNickname.value.trim().length >= 2;
});

const currentCard = computed<IPlayerCard | undefined>(() => {
  return playerStore.cardList[cardIndex.value];
});

const votingCandidates = computed<ICandidate[]>(() => {
  const nominees = gameStore.phase1.votingSession?.nominees || [];
  return nominees.map((id) => {
    const p = roomStore.players.find((x) => x.playerId === id);
    return {
      playerId: id,
      nickname: p?.nickname || id
    };
  });
});

const handleJoin = async () => {
  if (!canSubmitJoin.value) return;
  isJoining.value = true;
  try {
    const res = await roomsApi.joinRoom(joinCode.value, joinNickname.value);
    playerStore.setCredentials({
      playerId: res.playerId,
      playerToken: res.playerToken,
      nickname: res.nickname,
      isHost: res.isHost
    });
    localStorage.setItem('bunker_player_token', res.playerToken);
    localStorage.setItem('bunker_player_id', res.playerId);
    localStorage.setItem('bunker_room_code', res.code);
    localStorage.setItem('bunker_player_nick', res.nickname);
    roomStore.setRoom({
      roomId: res.roomId,
      roomCode: res.code
    });
    connect({ token: res.playerToken });
  } catch (err: any) {
    uiStore.addToast(err?.response?.data?.message || 'Ошибка подключения к комнате', 'error');
  } finally {
    isJoining.value = false;
  }
};

const handleStartGame = async () => {
  try {
    await actionsApi.startGame();
  } catch (err: any) {
    uiStore.addToast('Не удалось запустить игру', 'error');
  }
};

const handleUpdateSettings = async (newSettings: any) => {
  try {
    await roomsApi.updateSettings(roomStore.roomCode, newSettings);
  } catch (err: any) {
    uiStore.addToast('Ошибка обновления настроек', 'error');
  }
};

const handleCardReveal = async (card: IPlayerCard) => {
  try {
    await actionsApi.sendAction('REVEAL_CARD', { category: card.category, isVoluntary: false });
    playerStore.revealCard(card.category);
  } catch (err: any) {
    uiStore.addToast('Нельзя открыть карту сейчас', 'error');
  }
};

const handleVoluntaryReveal = async () => {
  if (currentCard.value && !currentCard.value.isRevealed) {
    if (playerStore.spendAp(1)) {
      try {
        await actionsApi.sendAction('REVEAL_CARD', { category: currentCard.value.category, isVoluntary: true });
        playerStore.revealCard(currentCard.value.category);
      } catch {
        playerStore.actionPoints += 1;
      }
    }
  }
};

const handleUseAbility = async () => {
  const ready = playerStore.readyAbilities[0];
  if (ready && playerStore.spendAp(ready.apCost)) {
    try {
      await actionsApi.sendAction('USE_ABILITY', { abilityId: ready.abilityId });
    } catch {
      playerStore.actionPoints += ready.apCost;
    }
  }
};

const handleAskQuestion = () => {
  uiStore.addToast('Выберите игрока для вопроса', 'info');
};

const handleTradeItem = () => {
  uiStore.addToast('Выберите предмет для обмена', 'info');
};

const handleCastVote = async (candidateId: string) => {
  try {
    await actionsApi.sendAction('CAST_VOTE', { nomineeId: candidateId });
    uiStore.addToast('Голос учтён', 'success');
  } catch (err: any) {
    uiStore.addToast('Ошибка голосования', 'error');
  }
};

const handleCandidateVeto = async () => {
  try {
    await actionsApi.sendAction('CANDIDATE_VETO', {});
    uiStore.addToast('Вы применили защитное вето!', 'success');
  } catch {
    uiStore.addToast('Не удалось применить вето', 'error');
  }
};

const handleRerolled = async () => {
  try {
    await playersApi.reroll();
    uiStore.addToast('Новый персонаж сгенерирован!', 'success');
  } catch (err: any) {
    uiStore.addToast('Не удалось перерандомить персонажа', 'error');
  }
};
</script>
