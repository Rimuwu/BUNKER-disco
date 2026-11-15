import { defineStore } from 'pinia';

export interface IRoomPlayer {
  playerId: string;
  nickname: string;
  isHost: boolean;
  isConnected: boolean;
  isEliminated: boolean;
  avatarSeed: string;
}

export interface IRoomSettings {
  enableSuperpowers: boolean;
  enablePhobias: boolean;
  enableCharacter: boolean;
  rerollLimit: number;
  maxPlayers: number;
  bunkerCapacity: number;
  phase1Duration?: string;
  discussionTimerSeconds?: number;
  votingTimerSeconds?: number;
  timelineMode?: string;
  language?: string;
}

export const useRoomStore = defineStore('room', {
  state: () => ({
    roomId: null as string | null,
    roomCode: '',
    isHost: false,
    playerCount: 0,
    players: [] as IRoomPlayer[],
    settings: {
      enableSuperpowers: false,
      enablePhobias: true,
      enableCharacter: true,
      rerollLimit: 1,
      maxPlayers: 10,
      bunkerCapacity: 5,
      phase1Duration: 'medium',
      discussionTimerSeconds: 120,
      votingTimerSeconds: 60,
      timelineMode: 'procedural',
      language: 'ru'
    } as IRoomSettings
  }),

  getters: {
    capacityK(state): number {
      const count = state.players.length > 0 ? state.players.length : state.playerCount;
      return Math.max(1, Math.floor(count / 2));
    },
    activePlayers(state): IRoomPlayer[] {
      return state.players.filter((p) => !p.isEliminated);
    },
    eliminatedPlayers(state): IRoomPlayer[] {
      return state.players.filter((p) => p.isEliminated);
    },
    hostPlayer(state): IRoomPlayer | undefined {
      return state.players.find((p) => p.isHost);
    }
  },

  actions: {
    setRoom(payload: {
      roomId?: string;
      roomCode: string;
      isHost?: boolean;
      players?: IRoomPlayer[];
      settings?: Partial<IRoomSettings>;
      playerCount?: number;
    }) {
      if (payload.roomId) this.roomId = payload.roomId;
      this.roomCode = payload.roomCode.toUpperCase();
      if (payload.isHost !== undefined) this.isHost = payload.isHost;
      if (payload.players) {
        this.players = payload.players;
        this.playerCount = payload.players.length;
      } else if (payload.playerCount !== undefined) {
        this.playerCount = payload.playerCount;
      }
      if (payload.settings) {
        this.settings = { ...this.settings, ...payload.settings };
      }
    },

    updateSettings(newSettings: Partial<IRoomSettings>) {
      this.settings = { ...this.settings, ...newSettings };
    },

    setPlayers(players: IRoomPlayer[]) {
      this.players = players;
      this.playerCount = players.length;
    },

    addPlayer(player: IRoomPlayer) {
      const idx = this.players.findIndex((p) => p.playerId === player.playerId);
      if (idx >= 0) {
        this.players[idx] = player;
      } else {
        this.players.push(player);
        this.playerCount = this.players.length;
      }
    },

    removePlayer(playerId: string) {
      this.players = this.players.filter((p) => p.playerId !== playerId);
      this.playerCount = this.players.length;
    },

    updatePlayerStatus(playerId: string, update: Partial<IRoomPlayer>) {
      const p = this.players.find((x) => x.playerId === playerId);
      if (p) {
        Object.assign(p, update);
      }
    },

    reset() {
      this.roomId = null;
      this.roomCode = '';
      this.isHost = false;
      this.playerCount = 0;
      this.players = [];
      this.settings = {
        enableSuperpowers: false,
        enablePhobias: true,
        enableCharacter: true,
        rerollLimit: 1,
        maxPlayers: 10,
        bunkerCapacity: 5,
        phase1Duration: 'medium',
        discussionTimerSeconds: 120,
        votingTimerSeconds: 60,
        timelineMode: 'procedural',
        language: 'ru'
      };
    }
  }
});
