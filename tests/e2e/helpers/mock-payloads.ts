export type CardCategory =
  | 'profession'
  | 'biology_age'
  | 'biology_gender'
  | 'health'
  | 'hobby'
  | 'item'
  | 'fact'
  | 'special_condition'
  | 'catastrophe'
  | 'threat'
  | 'bunker_room'
  | 'bunker_defect'
  | 'bunker_archetype'
  | 'superpower'
  | 'phobia'
  | 'character';

export type ActionType =
  | 'START_GAME'
  | 'REVEAL_CARD'
  | 'NOMINATE_PLAYER'
  | 'CAST_VOTE'
  | 'SKIP_VOTE'
  | 'END_TURN'
  | 'USE_ABILITY'
  | 'ASSIGN_ROOM'
  | 'START_CRAFT'
  | 'RESOLVE_EVENT'
  | 'TRADE_ITEM'
  | 'UPGRADE_ROOM'
  | 'UPDATE_ROOM_SETTINGS'
  | 'KICK_PLAYER'
  | 'PLAYER_REROLL'
  | 'DIRECT_QUESTION'
  | 'REFUSE_QUESTION'
  | 'SABOTAGE'
  | 'GUARD_INSPECT'
  | 'ACCUSE_TRAITOR'
  | 'SEND_SOS';

export interface LobbySettings {
  enableSuperpowers: boolean;
  enablePhobias: boolean;
  enableCharacter: boolean;
  rerollLimit: number;
  discussionTimeSeconds?: number;
  votingTimeSeconds?: number;
  timelineMode?: 'procedural' | 'custom';
  timeline?: Array<{ day: number; eventId: string; title?: string }>;
  [key: string]: any;
}

export interface TimelineScenario {
  name: string;
  description: string;
  days: Array<{
    day: number;
    threatId?: string;
    defectId?: string;
    resourceModifiers?: Record<string, number>;
  }>;
}

/**
 * Creates default lobby settings with optional partial overrides.
 */
export function createLobbySettings(overrides: Partial<LobbySettings> = {}): LobbySettings {
  return {
    enableSuperpowers: false,
    enablePhobias: false,
    enableCharacter: false,
    rerollLimit: 1,
    discussionTimeSeconds: 60,
    votingTimeSeconds: 60,
    timelineMode: 'procedural',
    ...overrides,
  };
}

/**
 * Creates action payload for START_GAME.
 */
export function createStartGamePayload(): { type: ActionType; payload: Record<string, any> } {
  return {
    type: 'START_GAME',
    payload: {},
  };
}

/**
 * Creates action payload for REVEAL_CARD.
 */
export function createRevealCardPayload(
  category: CardCategory | string,
  isVoluntary: boolean = false
): { type: ActionType; payload: { category: string; isVoluntary: boolean } } {
  return {
    type: 'REVEAL_CARD',
    payload: {
      category,
      isVoluntary,
    },
  };
}

/**
 * Creates action payload for NOMINATE_PLAYER.
 */
export function createNominatePlayerPayload(
  nomineeId: string
): { type: ActionType; payload: { nomineeId: string } } {
  return {
    type: 'NOMINATE_PLAYER',
    payload: { nomineeId },
  };
}

/**
 * Creates action payload for CAST_VOTE.
 */
export function createCastVotePayload(
  nomineeId: string,
  isSkip: boolean = false
): { type: ActionType; payload: { nomineeId: string; isSkip: boolean } } {
  return {
    type: 'CAST_VOTE',
    payload: { nomineeId, isSkip },
  };
}

/**
 * Creates action payload for SKIP_VOTE.
 */
export function createSkipVotePayload(): { type: ActionType; payload: Record<string, any> } {
  return {
    type: 'SKIP_VOTE',
    payload: {},
  };
}

/**
 * Creates action payload for END_TURN.
 */
export function createEndTurnPayload(): { type: ActionType; payload: Record<string, any> } {
  return {
    type: 'END_TURN',
    payload: {},
  };
}

/**
 * Creates action payload for USE_ABILITY.
 */
export function createUseAbilityPayload(
  abilityId: string,
  targetPlayerId?: string,
  params: Record<string, any> = {}
): { type: ActionType; payload: { abilityId: string; targetPlayerId?: string; params: Record<string, any> } } {
  return {
    type: 'USE_ABILITY',
    payload: {
      abilityId,
      targetPlayerId,
      params,
    },
  };
}

/**
 * Creates action payload for ASSIGN_ROOM.
 */
export function createAssignRoomPayload(
  roomId: string,
  workstationId?: string
): { type: ActionType; payload: { roomId: string; workstationId?: string } } {
  return {
    type: 'ASSIGN_ROOM',
    payload: {
      roomId,
      workstationId,
    },
  };
}

/**
 * Creates action payload for START_CRAFT.
 */
export function createStartCraftPayload(
  recipeId: string,
  ingredientIds: string[] = []
): { type: ActionType; payload: { recipeId: string; ingredientIds: string[] } } {
  return {
    type: 'START_CRAFT',
    payload: {
      recipeId,
      ingredientIds,
    },
  };
}

/**
 * Creates action payload for RESOLVE_EVENT.
 */
export function createResolveEventPayload(
  eventId: string,
  choiceIndex: number = 0
): { type: ActionType; payload: { eventId: string; choiceIndex: number } } {
  return {
    type: 'RESOLVE_EVENT',
    payload: {
      eventId,
      choiceIndex,
    },
  };
}

/**
 * Creates action payload for TRADE_ITEM.
 */
export function createTradeItemPayload(
  targetPlayerId: string,
  offeredItemId: string,
  requestedItemId?: string
): { type: ActionType; payload: { targetPlayerId: string; offeredItemId: string; requestedItemId?: string } } {
  return {
    type: 'TRADE_ITEM',
    payload: {
      targetPlayerId,
      offeredItemId,
      requestedItemId,
    },
  };
}

/**
 * Creates action payload for UPGRADE_ROOM.
 */
export function createUpgradeRoomPayload(
  roomId: string
): { type: ActionType; payload: { roomId: string } } {
  return {
    type: 'UPGRADE_ROOM',
    payload: { roomId },
  };
}

/**
 * Creates action payload for KICK_PLAYER.
 */
export function createKickPlayerPayload(
  playerId: string
): { type: ActionType; payload: { playerId: string } } {
  return {
    type: 'KICK_PLAYER',
    payload: { playerId },
  };
}

/**
 * Creates action payload for PLAYER_REROLL.
 */
export function createPlayerRerollPayload(): { type: ActionType; payload: Record<string, any> } {
  return {
    type: 'PLAYER_REROLL',
    payload: {},
  };
}

/**
 * Generates a full deterministic timeline scenario for reproducible testing.
 */
export function createTimelineScenario(mode: 'standard' | 'severe' | 'sos' = 'standard'): TimelineScenario {
  switch (mode) {
    case 'severe':
      return {
        name: 'Catastrophic Asphyxiation Timeline',
        description: 'Rapid ventilation defect scenario leading to zero air',
        days: [
          { day: 1, defectId: 'DEF-06_VENT_CLOG', resourceModifiers: { air: -10 } },
          { day: 2, threatId: 'THR-02_AIR_FILTER_BREACH', resourceModifiers: { air: -20 } },
          { day: 3, resourceModifiers: { air: -30 } },
          { day: 4, resourceModifiers: { air: -40 } },
          { day: 5, resourceModifiers: { air: -50 } },
        ],
      };
    case 'sos':
      return {
        name: 'Radio SOS Rescue Timeline',
        description: 'Parts discovery leading to Day 25+ SOS transmitter rescue',
        days: [
          { day: 5, threatId: 'THR-08_ELECTRICAL_SURGE' },
          { day: 15, resourceModifiers: { food: 10, power: 15 } },
          { day: 22, defectId: 'DEF-01_RADIO_CRACKLE' },
          { day: 25, threatId: 'THR-12_RADIO_INTERCEPT' },
        ],
      };
    case 'standard':
    default:
      return {
        name: 'Standard Survival Timeline',
        description: 'Balanced 30-day survival scenario with moderate resource decay',
        days: [
          { day: 3, threatId: 'THR-01_WATER_LEAK' },
          { day: 8, threatId: 'THR-04_MOLD_OUTBREAK' },
          { day: 14, threatId: 'THR-09_POWER_FLUCTUATION' },
          { day: 20, threatId: 'THR-15_SEISMIC_TREMOR' },
          { day: 27, threatId: 'THR-21_INTERNAL_FEUD' },
        ],
      };
  }
}

/**
 * Dual-aliased action payload generators (accommodating docs/architecture/api.md and worker schemas)
 */

export function createDualRevealCardPayload(
  category: CardCategory | string,
  isVoluntary: boolean = false
): { type: ActionType; payload: { category: string; cardType: string; isVoluntary: boolean } } {
  return {
    type: 'REVEAL_CARD',
    payload: {
      category,
      cardType: category,
      isVoluntary,
    },
  };
}

export function createDualNominatePayload(
  nomineeId: string
): { type: ActionType; payload: { nomineeId: string; targetPlayerId: string } } {
  return {
    type: 'NOMINATE_PLAYER',
    payload: {
      nomineeId,
      targetPlayerId: nomineeId,
    },
  };
}

export function createDualVotePayload(
  nomineeId: string,
  isSkip: boolean = false
): { type: ActionType; payload: { nomineeId: string; targetPlayerId: string; isSkip: boolean; vote: boolean } } {
  return {
    type: 'CAST_VOTE',
    payload: {
      nomineeId,
      targetPlayerId: nomineeId,
      isSkip,
      vote: !isSkip,
    },
  };
}

export function createDualAssignRoomPayload(
  roomId: string,
  workstationId?: string,
  playerId?: string
): { type: ActionType; payload: { roomId: string; roomType: string; workstationId?: string; playerId?: string } } {
  return {
    type: 'ASSIGN_ROOM',
    payload: {
      roomId,
      roomType: roomId,
      workstationId,
      ...(playerId ? { playerId } : {}),
    },
  };
}

export function createDualResolveEventPayload(
  eventId: string,
  choiceIndex: number = 0,
  choiceId?: string
): { type: ActionType; payload: { eventId: string; eventInstanceId: string; choiceIndex: number; choiceId: string } } {
  return {
    type: 'RESOLVE_EVENT',
    payload: {
      eventId,
      eventInstanceId: eventId,
      choiceIndex,
      choiceId: choiceId || `choice_${choiceIndex}`,
    },
  };
}

export function createDualTradeItemPayload(
  targetPlayerId: string,
  offeredItemId: string,
  requestedItemId?: string,
  quantity: number = 1
): { type: ActionType; payload: { targetPlayerId: string; offeredItemId: string; itemId: string; requestedItemId?: string; quantity: number } } {
  return {
    type: 'TRADE_ITEM',
    payload: {
      targetPlayerId,
      offeredItemId,
      itemId: offeredItemId,
      requestedItemId,
      quantity,
    },
  };
}

export function createDualUpgradeRoomPayload(
  roomId: string,
  cost?: Record<string, number>
): { type: ActionType; payload: { roomId: string; roomType: string; cost: Record<string, number> } } {
  return {
    type: 'UPGRADE_ROOM',
    payload: {
      roomId,
      roomType: roomId,
      cost: cost || { food: 10, power: 20 },
    },
  };
}

export function createDualKickPlayerPayload(
  playerId: string
): { type: ActionType; payload: { playerId: string; targetPlayerId: string } } {
  return {
    type: 'KICK_PLAYER',
    payload: {
      playerId,
      targetPlayerId: playerId,
    },
  };
}

export function createDirectQuestionPayload(
  targetPlayerId: string,
  question: string
): { type: ActionType; payload: { targetPlayerId: string; question: string } } {
  return {
    type: 'DIRECT_QUESTION',
    payload: {
      targetPlayerId,
      question,
    },
  };
}

export function createRefuseQuestionPayload(): { type: ActionType; payload: Record<string, any> } {
  return {
    type: 'REFUSE_QUESTION',
    payload: {},
  };
}

export function createSabotagePayload(
  targetResource: string,
  amount: number = 10
): { type: ActionType; payload: { targetResource: string; amount: number } } {
  return {
    type: 'SABOTAGE',
    payload: {
      targetResource,
      amount,
    },
  };
}

export function createGuardInspectPayload(
  targetPlayerId: string
): { type: ActionType; payload: { targetPlayerId: string } } {
  return {
    type: 'GUARD_INSPECT',
    payload: {
      targetPlayerId,
    },
  };
}

export function createAccuseTraitorPayload(
  targetPlayerId: string
): { type: ActionType; payload: { targetPlayerId: string } } {
  return {
    type: 'ACCUSE_TRAITOR',
    payload: {
      targetPlayerId,
    },
  };
}

export function createSendSosPayload(): { type: ActionType; payload: Record<string, any> } {
  return {
    type: 'SEND_SOS',
    payload: {},
  };
}

