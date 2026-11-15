import { Server, Namespace } from 'socket.io';
import { EventBroadcaster as BaseBroadcaster } from '../ws/broadcaster.js';

export interface ITimerTickBroadcast {
  timerType: 'debate' | 'voting' | 'draft' | 'crisis_reaction';
  remainingSeconds: number;
  totalSeconds: number;
  activeSpeakerId?: string;
}

export interface IDayStartBroadcast {
  day: number;
  resources: {
    food: number;
    water: number;
    air: number;
    medicine: number;
    power: number;
    morale: number;
  };
  announcement: string;
}

export interface IResourceUpdateBroadcast {
  resources: Record<string, number>;
  deltas: Record<string, number>;
  reason: string;
}

export interface IThreatBroadcast {
  threatId: string;
  name: string;
  description: string;
  counterSpecialists: string[];
  reactionSeconds: number;
}

export interface IGameOverBroadcast {
  outcome: 'VICTORY' | 'DEFEAT';
  reason: string;
  daysSurvived: number;
  survivors: Array<{ playerId: string; nickname: string }>;
  questLeaderboard?: Array<{ playerId: string; questName: string; fulfilled: boolean; scoreBonus: number }>;
}

export interface ISceneDirective {
  cameraMode: 'SURFACE_WIDE' | 'SPEAKER_FOCUS' | 'VOTE_ARENA' | 'BUNKER_OVERVIEW' | 'EMERGENCY_TRACK';
  targetPlayerId?: string;
  animation?: string;
  fogHole?: { x: number; y: number; radius: number };
}

export class EventBroadcaster extends BaseBroadcaster {
  constructor(io: Server | Namespace) {
    super(io);
  }

  public broadcastDebateTick(roomId: string, data: ITimerTickBroadcast): void {
    this.broadcastToRoom(roomId, 'debate_timer_tick', data);
  }

  public broadcastSpeakerChanged(roomId: string, data: { speakerId: string; nickname: string; durationSeconds: number }): void {
    this.broadcastToRoom(roomId, 'active_speaker_changed', data);
  }

  public broadcastLootDraftStarted(roomId: string, data: {
    exiledPlayerId: string;
    items: any[];
    draftOrder: string[];
    timeLimitSeconds: number;
  }): void {
    this.broadcastToRoom(roomId, 'loot_draft_started', data);
  }

  public broadcastLootItemPicked(roomId: string, data: { playerId: string; itemId: string; name: string }): void {
    this.broadcastToRoom(roomId, 'loot_item_picked', data);
  }

  public broadcastDayStart(roomId: string, data: IDayStartBroadcast): void {
    this.broadcastToRoom(roomId, 'day_start', data);
  }

  public broadcastResourceUpdate(roomId: string, data: IResourceUpdateBroadcast): void {
    this.broadcastToRoom(roomId, 'resource_update', data);
  }

  public broadcastThreatIncoming(roomId: string, data: IThreatBroadcast): void {
    this.broadcastToRoom(roomId, 'threat_incoming', data);
  }

  public broadcastThreatResolved(roomId: string, data: {
    threatId: string;
    countered: boolean;
    counteredBy?: string;
    damageApplied?: any;
    message: string;
  }): void {
    this.broadcastToRoom(roomId, 'threat_resolved', data);
  }

  public broadcastActionsResolved(roomId: string, data: {
    day: number;
    log: string[];
    resources: any;
  }): void {
    this.broadcastToRoom(roomId, 'actions_resolved', data);
  }

  public broadcastGameOver(roomId: string, data: IGameOverBroadcast): void {
    this.broadcastToRoom(roomId, 'game_over', data);
  }

  public broadcastSceneDirective(roomId: string, directive: ISceneDirective): void {
    this.broadcastToBigScreen(roomId, 'scene_directive', directive);
  }

  public broadcastAbilityActivated(roomId: string, data: {
    sourcePlayerId: string;
    abilityId: string;
    abilityName: string;
    targetPlayerId?: string;
    message: string;
  }): void {
    this.broadcastToRoom(roomId, 'ability_activated', data);
  }
}
