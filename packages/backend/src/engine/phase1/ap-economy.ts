import { IPlayerDocument } from '../../db/repositories/player.repository.js';

export const AP_PER_ROUND = 3;
export const MANDATORY_REVEAL_COST = 0;
export const VOLUNTARY_REVEAL_COST = 1;
export const CANDIDATE_VETO_COST = 2;
export const TRADE_INITIATION_COST = 1;
export const REFUSE_QUESTION_COST = 1;

export const MANDATORY_REVEAL_SCHEDULE: Record<number, string[]> = {
  1: ['profession'],
  2: ['biology_age', 'biology_gender'],
  3: ['health'],
  4: ['hobby'],
  5: ['fact'],
  6: ['item'],
};

export class InsufficientActionPointsError extends Error {
  public readonly code = 'INSUFFICIENT_AP';
  constructor(required: number, available: number) {
    super(`Insufficient Action Points: required ${required}, but player only has ${available}.`);
    this.name = 'InsufficientActionPointsError';
  }
}

export class APEconomy {
  public static refreshRoundAP(player: IPlayerDocument): number {
    player.actionPoints = AP_PER_ROUND;
    return player.actionPoints;
  }

  public static spendAP(player: IPlayerDocument, amount: number, reason?: string): number {
    if (amount <= 0) return player.actionPoints;

    if (player.actionPoints < amount) {
      throw new InsufficientActionPointsError(amount, player.actionPoints);
    }

    player.actionPoints -= amount;
    return player.actionPoints;
  }

  public static getRevealCost(
    cardCategory: string,
    currentRound: number,
    isVoluntary = false
  ): number {
    if (cardCategory === 'special_condition') {
      throw new Error('SECRET_QUEST_REVEAL_FORBIDDEN: Secret quests can never be revealed.');
    }

    if (isVoluntary) {
      return VOLUNTARY_REVEAL_COST;
    }

    const scheduled = MANDATORY_REVEAL_SCHEDULE[currentRound];
    if (scheduled && scheduled.includes(cardCategory)) {
      return MANDATORY_REVEAL_COST;
    }

    // If past round 6, items or facts are mandatory
    if (currentRound > 6 && (cardCategory === 'item' || cardCategory === 'fact')) {
      return MANDATORY_REVEAL_COST;
    }

    return VOLUNTARY_REVEAL_COST;
  }

  public static canAfford(player: IPlayerDocument, cost: number): boolean {
    return player.actionPoints >= cost;
  }
}
