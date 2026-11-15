import { io, type Socket } from 'socket.io-client';
import { useRoomStore } from '@/stores/roomStore';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useWsStore } from '@/stores/wsStore';
import { useUiStore } from '@/stores/uiStore';

let socketInstance: Socket | null = null;
let pingTimer: any = null;

export function useWebSocket() {
  const roomStore = useRoomStore();
  const gameStore = useGameStore();
  const playerStore = usePlayerStore();
  const wsStore = useWsStore();
  const uiStore = useUiStore();

  const connect = (options: {
    isBigScreen?: boolean;
    roomCode?: string;
    token?: string;
    url?: string;
  }) => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }

    const wsUrl = options.url || window.location.origin;
    const authData: Record<string, any> = {};

    if (options.isBigScreen) {
      authData.isBigScreen = true;
      authData.clientType = 'bigscreen';
      if (options.roomCode) authData.roomCode = options.roomCode;
    } else if (options.token) {
      authData.token = options.token;
    } else if (playerStore.playerToken) {
      authData.token = playerStore.playerToken;
    }

    wsStore.setReconnecting(false);

    socketInstance = io(`${wsUrl}/game`, {
      transports: ['websocket', 'polling'],
      auth: authData,
      query: authData,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5
    });

    socketInstance.on('connect', () => {
      wsStore.setConnected(true);
      startHeartbeat();

      // Upon reconnect, request full state
      if (wsStore.reconnectAttempts > 0) {
        socketInstance?.emit('request_full_state');
      }
    });

    socketInstance.on('disconnect', () => {
      wsStore.setConnected(false);
      stopHeartbeat();
    });

    socketInstance.on('reconnect_attempt', () => {
      wsStore.setReconnecting(true);
    });

    socketInstance.on('pong', (data: { timestamp: number }) => {
      wsStore.recordPongReceived(data?.timestamp);
    });

    // Game lifecycle events
    socketInstance.on('lobby_update', (data: any) => {
      if (data.players) roomStore.setPlayers(data.players);
      if (data.settings) roomStore.updateSettings(data.settings);
    });

    socketInstance.on('settings_updated', (data: any) => {
      if (data.settings) roomStore.updateSettings(data.settings);
    });

    socketInstance.on('cards_dealt', (data: any) => {
      if (data.cards) playerStore.setHand(data.cards);
    });

    socketInstance.on('player_rerolled', (data: any) => {
      if (data.playerId === playerStore.playerId) {
        if (data.cards) playerStore.setHand(data.cards);
        if (data.remainingRerolls !== undefined) {
          playerStore.setRerolls(data.remainingRerolls);
        }
      }
    });

    socketInstance.on('card_revealed', (data: any) => {
      if (data.playerId === playerStore.playerId && data.category) {
        playerStore.revealCard(data.category);
      }
    });

    socketInstance.on('phase1_start', () => {
      gameStore.setPhase('phase1');
    });

    socketInstance.on('phase2_start', () => {
      gameStore.setPhase('phase2');
    });

    socketInstance.on('active_speaker_changed', (data: any) => {
      gameStore.setActiveSpeaker(data.speakerId, data.timerSeconds);
    });

    socketInstance.on('vote_started', (data: any) => {
      gameStore.startVotingSession({
        isOpen: true,
        timerExpiresAt: Date.now() + (data.timerSeconds || 60) * 1000,
        timerSeconds: data.timerSeconds || 60,
        nominees: data.nominees || [],
        vetoedPlayerIds: data.vetoedPlayerIds || [],
        ballotsCount: 0,
        isTieBreakRound: !!data.isTieBreak
      });
    });

    socketInstance.on('vote_result', (data: any) => {
      gameStore.setVoteResult({
        eliminatedPlayerId: data.eliminatedPlayerId || null,
        isTieBreak: !!data.tieBreak,
        stampText: data.eliminatedPlayerId ? 'EXILED' : 'SPARED'
      });
    });

    socketInstance.on('day_start', (data: any) => {
      gameStore.setDay(data.day, data.phase);
    });

    socketInstance.on('resource_update', (data: any) => {
      gameStore.updateResources(data.resources, data.deltas);
    });

    socketInstance.on('threat_incoming', (data: any) => {
      gameStore.addThreat(data);
    });

    socketInstance.on('threat_resolved', (data: any) => {
      gameStore.resolveThreat(data.threatId);
    });

    socketInstance.on('scene_directive', (data: any) => {
      if (data.cameraMode) {
        uiStore.setCameraMode(data.cameraMode);
      }
      if (data.fogHole) {
        // Handled by 3D scene listener
      }
    });

    socketInstance.on('reconnect_state', (fullState: any) => {
      if (fullState.room) roomStore.setRoom(fullState.room);
      if (fullState.game) {
        gameStore.setPhase(fullState.game.phase);
        if (fullState.game.phase1) gameStore.setPhase1State(fullState.game.phase1);
        if (fullState.game.phase2) gameStore.setPhase2State(fullState.game.phase2);
      }
      if (fullState.player) {
        if (fullState.player.cards) playerStore.setHand(fullState.player.cards);
        if (fullState.player.actionPoints !== undefined) {
          playerStore.actionPoints = fullState.player.actionPoints;
        }
      }
    });

    return socketInstance;
  };

  const startHeartbeat = () => {
    stopHeartbeat();
    pingTimer = setInterval(() => {
      if (socketInstance?.connected) {
        const timestamp = wsStore.recordPingSent();
        socketInstance.emit('ping', { timestamp });
      }
    }, 10000);
  };

  const stopHeartbeat = () => {
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
  };

  const disconnect = () => {
    stopHeartbeat();
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
    wsStore.setConnected(false);
  };

  return {
    connect,
    disconnect,
    getSocket: () => socketInstance
  };
}
