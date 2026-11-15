import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useRoomStore } from '@/stores/roomStore';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useWsStore } from '@/stores/wsStore';
import { useUiStore } from '@/stores/uiStore';

describe('Pinia Stores Unit Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('roomStore', () => {
    it('initializes with default values and uppercase roomCode', () => {
      const room = useRoomStore();
      expect(room.roomCode).toBe('');
      expect(room.isHost).toBe(false);
      expect(room.settings.enableSuperpowers).toBe(false);
      expect(room.settings.enablePhobias).toBe(true);
      expect(room.settings.enableCharacter).toBe(true);
      expect(room.settings.rerollLimit).toBe(1);

      room.setRoom({ roomCode: 'bunkr' });
      expect(room.roomCode).toBe('BUNKR');
    });

    it('calculates bunker capacity K = floor(N / 2) accurately for various N', () => {
      const room = useRoomStore();

      // N = 4 -> K = 2
      room.playerCount = 4;
      expect(room.capacityK).toBe(2);

      // N = 7 -> K = 3
      room.playerCount = 7;
      expect(room.capacityK).toBe(3);

      // N = 11 -> K = 5
      room.playerCount = 11;
      expect(room.capacityK).toBe(5);

      // N = 20 -> K = 10
      room.playerCount = 20;
      expect(room.capacityK).toBe(10);
    });

    it('updates expansion deck toggles according to GEMINI.md rules', () => {
      const room = useRoomStore();
      room.updateSettings({
        enableSuperpowers: true,
        enablePhobias: false,
        rerollLimit: 3
      });

      expect(room.settings.enableSuperpowers).toBe(true);
      expect(room.settings.enablePhobias).toBe(false);
      expect(room.settings.enableCharacter).toBe(true); // retains default
      expect(room.settings.rerollLimit).toBe(3);
    });

    it('tracks active and eliminated players', () => {
      const room = useRoomStore();
      room.setPlayers([
        { playerId: 'p1', nickname: 'Alice', isHost: true, isConnected: true, isEliminated: false, avatarSeed: 'a1' },
        { playerId: 'p2', nickname: 'Bob', isHost: false, isConnected: true, isEliminated: true, avatarSeed: 'a2' }
      ]);

      expect(room.activePlayers.length).toBe(1);
      expect(room.activePlayers[0].nickname).toBe('Alice');
      expect(room.eliminatedPlayers.length).toBe(1);
      expect(room.eliminatedPlayers[0].nickname).toBe('Bob');
      expect(room.hostPlayer?.nickname).toBe('Alice');
    });
  });

  describe('gameStore', () => {
    it('manages phase progression from lobby to ended', () => {
      const game = useGameStore();
      expect(game.phase).toBe('lobby');

      game.setPhase('phase1');
      expect(game.phase).toBe('phase1');

      game.setPhase('phase2');
      expect(game.phase).toBe('phase2');

      game.setPhase('ended');
      expect(game.isGameOver).toBe(true);
    });

    it('manages voting sessions and results', () => {
      const game = useGameStore();
      expect(game.isVoting).toBe(false);

      game.setPhase('phase1');
      game.startVotingSession({
        isOpen: true,
        timerExpiresAt: Date.now() + 60000,
        timerSeconds: 60,
        nominees: ['p1', 'p2'],
        vetoedPlayerIds: [],
        ballotsCount: 0,
        isTieBreakRound: false
      });

      expect(game.isVoting).toBe(true);

      game.setVoteResult({
        eliminatedPlayerId: 'p2',
        isTieBreak: false,
        stampText: 'EXILED'
      });

      expect(game.phase1.votingSession?.result?.stampText).toBe('EXILED');
      expect(game.phase1.exiledPlayers).toContain('p2');

      game.endVotingSession();
      expect(game.isVoting).toBe(false);
    });

    it('identifies critical resources below 15% and zero resources', () => {
      const game = useGameStore();
      game.setPhase('phase2');

      game.updateResources({ food: 80, air: 10, water: 0 });
      expect(game.isCriticalResource).toBe(true);
      expect(game.zeroResources).toContain('water');
      expect(game.zeroResources).not.toContain('food');
    });

    it('tracks revealed rooms in bunker', () => {
      const game = useGameStore();
      expect(game.phase2.revealedRooms).toContain('room_01_airlock');

      game.revealRoom('room_04_medical_bay');
      expect(game.phase2.revealedRooms).toContain('room_04_medical_bay');
      expect(game.phase2.revealedRooms.length).toBe(2);
    });
  });

  describe('playerStore', () => {
    it('manages 3 AP economy per round and enforces AP costs', () => {
      const player = usePlayerStore();
      expect(player.actionPoints).toBe(3);

      const success = player.spendAp(1); // e.g. voluntary reveal
      expect(success).toBe(true);
      expect(player.actionPoints).toBe(2);

      const fail = player.spendAp(3); // trying to spend 3 when only 2 remain
      expect(fail).toBe(false);
      expect(player.actionPoints).toBe(2);

      player.resetAp();
      expect(player.actionPoints).toBe(3);
    });

    it('processes candidate veto for 2 AP and locks further use', () => {
      const player = usePlayerStore();
      expect(player.canVeto).toBe(true);

      const vetoResult = player.useCandidateVeto();
      expect(vetoResult).toBe(true);
      expect(player.actionPoints).toBe(1); // 3 - 2 = 1
      expect(player.hasUsedVeto).toBe(true);
      expect(player.canVeto).toBe(false); // cannot veto twice
    });

    it('decrements mulligan rerolls and checks boundaries', () => {
      const player = usePlayerStore();
      player.setRerolls(2);
      expect(player.canReroll).toBe(true);

      player.decrementRerolls();
      expect(player.remainingRerolls).toBe(1);

      player.decrementRerolls();
      expect(player.remainingRerolls).toBe(0);
      expect(player.canReroll).toBe(false);
    });

    it('filters revealed, unrevealed, and secret quest cards', () => {
      const player = usePlayerStore();
      player.setHand({
        profession: {
          cardId: 'c1',
          category: 'profession',
          originTag: 'BASE',
          name: 'Инженер',
          description: 'Чинит генераторы',
          isRevealed: false
        },
        health: {
          cardId: 'c2',
          category: 'health',
          originTag: 'ALPHA',
          name: 'Иммунитет',
          description: 'Устойчив к инфекциям',
          isRevealed: true
        },
        special_condition: {
          cardId: 'c3',
          category: 'special_condition',
          originTag: 'NEW',
          name: 'Диверсант',
          description: 'Секретная цель выживания',
          isRevealed: false
        }
      });

      expect(player.cardList.length).toBe(3);
      expect(player.revealedCards.length).toBe(1);
      expect(player.revealedCards[0].category).toBe('health');
      expect(player.unrevealedCards.length).toBe(2);
      expect(player.secretQuest?.name).toBe('Диверсант');

      player.revealCard('profession');
      expect(player.cards.profession.isRevealed).toBe(true);
      expect(player.revealedCards.length).toBe(2);
    });
  });

  describe('wsStore', () => {
    it('manages connection status and tracks ping latency', () => {
      const ws = useWsStore();
      expect(ws.isConnected).toBe(false);
      expect(ws.connectionQuality).toBe('disconnected');

      ws.setConnected(true);
      expect(ws.isConnected).toBe(true);

      ws.setLatency(45);
      expect(ws.latencyMs).toBe(45);
      expect(ws.connectionQuality).toBe('good');

      ws.setLatency(150);
      expect(ws.connectionQuality).toBe('medium');

      ws.setLatency(450);
      expect(ws.connectionQuality).toBe('bad');
    });

    it('tracks reconnect attempts and resets on connection', () => {
      const ws = useWsStore();
      ws.setReconnecting(true);
      expect(ws.reconnectAttempts).toBe(1);
      ws.setReconnecting(true);
      expect(ws.reconnectAttempts).toBe(2);

      ws.setConnected(true);
      expect(ws.reconnectAttempts).toBe(0);
      expect(ws.isReconnecting).toBe(false);
    });
  });

  describe('uiStore', () => {
    it('opens and closes modals and player dossiers', () => {
      const ui = useUiStore();
      expect(ui.activeModal).toBe(null);

      ui.openModal('settings');
      expect(ui.activeModal).toBe('settings');

      ui.openDossier('p42');
      expect(ui.inspectedPlayerId).toBe('p42');
      expect(ui.activeModal).toBe('dossier');

      ui.closeDossier();
      expect(ui.inspectedPlayerId).toBe(null);
      expect(ui.activeModal).toBe(null);
    });

    it('manages toast notifications', () => {
      const ui = useUiStore();
      const id = ui.addToast('Привет, Выживший!', 'success', 0);
      expect(ui.toasts.length).toBe(1);
      expect(ui.toasts[0].message).toBe('Привет, Выживший!');
      expect(ui.toasts[0].type).toBe('success');

      ui.removeToast(id);
      expect(ui.toasts.length).toBe(0);
    });

    it('switches camera modes', () => {
      const ui = useUiStore();
      expect(ui.cameraMode).toBe('SURFACE_WIDE');

      ui.setCameraMode('BUNKER_OVERVIEW');
      expect(ui.cameraMode).toBe('BUNKER_OVERVIEW');
    });
  });
});
