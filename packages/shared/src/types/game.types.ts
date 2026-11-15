export type GameTaskType =
  | 'START_GAME'
  | 'PHASE1_VOTE_TICK'
  | 'PHASE1_RESOLVE_VOTING'
  | 'PHASE1_EXILE'
  | 'PHASE2_START'
  | 'PHASE2_DAY_TICK'
  | 'PHASE2_RESOLVE_ACTIONS'
  | 'PHASE2_CRISIS_CHECK'
  | 'CLIENT_ACTION';

export interface IGameTask {
  taskId: string;
  type: GameTaskType;
  roomId: string;
  playerId?: string;
  clientSequence?: number;
  payload?: any;
  queuedAt: number;
  retryCount?: number;
}

export interface IGameStateDocument {
  roomId: string;
  phase: 'lobby' | 'phase1' | 'phase2' | 'ended';
  phase1?: {
    currentRound: number;
    survivorsCount: number;
    targetCapacityK: number; // Math.floor(N / 2)
    eliminationRoundsTotal: number; // Math.ceil(N / 2)
    activeSpeakerId?: string;
    debateTimerExpiresAt?: number;
    votingSession?: {
      isOpen: boolean;
      timerExpiresAt: number;
      ballots: Record<string, string>; // voterId -> nomineeId
    };
    exiledPlayers: string[];
  };
  phase2?: {
    currentDay: number; // 1..30
    resources: {
      food: number;
      water: number;
      air: number;
      medicine: number;
      power: number;
      morale: number;
    };
    roomAssignments: Record<string, string>; // playerId -> roomId
    activeThreats: string[];
    activeDefects: string[];
    craftQueue: Array<{ recipeId: string; daysRemaining: number; craftedBy: string }>;
  };
  updatedAt: Date;
}
