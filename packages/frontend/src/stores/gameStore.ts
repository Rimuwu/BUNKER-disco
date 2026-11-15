import { defineStore } from 'pinia';

export interface IVotingSession {
  isOpen: boolean;
  timerExpiresAt: number;
  timerSeconds: number;
  nominees: string[];
  vetoedPlayerIds: string[];
  ballotsCount: number;
  isTieBreakRound: boolean;
  tiedCandidates?: string[];
  votes?: Record<string, string>;
  result?: {
    eliminatedPlayerId: string | null;
    isTieBreak: boolean;
    stampText?: 'EXILED' | 'SPARED';
  } | null;
}

export interface IPhase2Threat {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timeRemaining?: number;
  penalties?: Record<string, number>;
}

export interface IGameResources {
  food: number;
  water: number;
  air: number;
  medicine: number;
  power: number;
  morale: number;
}

export const useGameStore = defineStore('game', {
  state: () => ({
    phase: 'lobby' as 'lobby' | 'phase1' | 'phase2' | 'ended',
    phase1: {
      currentRound: 1,
      survivorsCount: 0,
      targetCapacityK: 0,
      eliminationRoundsTotal: 0,
      activeSpeakerId: null as string | null,
      debateTimerExpiresAt: null as number | null,
      debateTimerRemaining: 0,
      votingSession: null as IVotingSession | null,
      exiledPlayers: [] as string[]
    },
    phase2: {
      currentDay: 1,
      dailyPhase: 'Production',
      resources: {
        food: 100,
        water: 100,
        air: 100,
        medicine: 100,
        power: 100,
        morale: 100
      } as IGameResources,
      resourceDeltas: {
        food: 0,
        water: 0,
        air: 0,
        medicine: 0,
        power: 0,
        morale: 0
      } as IGameResources,
      roomAssignments: {} as Record<string, string>,
      activeThreats: [] as IPhase2Threat[],
      activeDefects: [] as string[],
      revealedRooms: ['room_01_airlock'] as string[]
    },
    catastrophe: null as {
      id: string;
      title: string;
      description: string;
      survivalRequirements?: string[];
    } | null
  }),

  getters: {
    isVoting(state): boolean {
      return state.phase === 'phase1' && !!state.phase1.votingSession?.isOpen;
    },
    isCriticalResource(state): boolean {
      if (state.phase !== 'phase2') return false;
      const res = state.phase2.resources;
      return Object.values(res).some((val) => val <= 15);
    },
    zeroResources(state): string[] {
      if (state.phase !== 'phase2') return [];
      const res = state.phase2.resources;
      return Object.entries(res)
        .filter(([_, val]) => val <= 0)
        .map(([key]) => key);
    },
    isGameOver(state): boolean {
      return state.phase === 'ended';
    }
  },

  actions: {
    setPhase(phase: 'lobby' | 'phase1' | 'phase2' | 'ended') {
      this.phase = phase;
    },

    setPhase1State(state: Partial<typeof this.phase1>) {
      this.phase1 = { ...this.phase1, ...state };
    },

    setActiveSpeaker(speakerId: string | null, timerSeconds = 60) {
      this.phase1.activeSpeakerId = speakerId;
      this.phase1.debateTimerRemaining = timerSeconds;
      this.phase1.debateTimerExpiresAt = Date.now() + timerSeconds * 1000;
    },

    startVotingSession(session: IVotingSession) {
      this.phase1.votingSession = session;
    },

    updateVotingSession(sessionUpdate: Partial<IVotingSession>) {
      if (this.phase1.votingSession) {
        this.phase1.votingSession = { ...this.phase1.votingSession, ...sessionUpdate };
      }
    },

    setVoteResult(result: IVotingSession['result']) {
      if (this.phase1.votingSession) {
        this.phase1.votingSession.result = result;
      }
      if (result?.eliminatedPlayerId && !this.phase1.exiledPlayers.includes(result.eliminatedPlayerId)) {
        this.phase1.exiledPlayers.push(result.eliminatedPlayerId);
      }
    },

    endVotingSession() {
      if (this.phase1.votingSession) {
        this.phase1.votingSession.isOpen = false;
      }
    },

    setPhase2State(state: Partial<typeof this.phase2>) {
      this.phase2 = { ...this.phase2, ...state };
    },

    updateResources(resources: Partial<IGameResources>, deltas?: Partial<IGameResources>) {
      this.phase2.resources = { ...this.phase2.resources, ...resources };
      if (deltas) {
        this.phase2.resourceDeltas = { ...this.phase2.resourceDeltas, ...deltas };
      }
    },

    setDay(day: number, dailyPhase = 'Production') {
      this.phase2.currentDay = day;
      this.phase2.dailyPhase = dailyPhase;
    },

    revealRoom(roomId: string) {
      if (!this.phase2.revealedRooms.includes(roomId)) {
        this.phase2.revealedRooms.push(roomId);
      }
    },

    addThreat(threat: IPhase2Threat) {
      this.phase2.activeThreats.push(threat);
    },

    resolveThreat(threatId: string) {
      this.phase2.activeThreats = this.phase2.activeThreats.filter((t) => t.id !== threatId);
    },

    setCatastrophe(catastrophe: typeof this.catastrophe) {
      this.catastrophe = catastrophe;
    },

    reset() {
      this.phase = 'lobby';
      this.phase1 = {
        currentRound: 1,
        survivorsCount: 0,
        targetCapacityK: 0,
        eliminationRoundsTotal: 0,
        activeSpeakerId: null,
        debateTimerExpiresAt: null,
        debateTimerRemaining: 0,
        votingSession: null,
        exiledPlayers: []
      };
      this.phase2 = {
        currentDay: 1,
        dailyPhase: 'Production',
        resources: { food: 100, water: 100, air: 100, medicine: 100, power: 100, morale: 100 },
        resourceDeltas: { food: 0, water: 0, air: 0, medicine: 0, power: 0, morale: 0 },
        roomAssignments: {},
        activeThreats: [],
        activeDefects: [],
        revealedRooms: ['room_01_airlock']
      };
      this.catastrophe = null;
    }
  }
});
