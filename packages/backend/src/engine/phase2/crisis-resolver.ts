import { IPlayerDocument } from '../../db/repositories/player.repository.js';
import { ICardDocument, getCardsByCategory, getCardById } from '@bunker/shared';
import { IBunkerResources } from './resource-manager.js';

export interface ICrisisResolutionResult {
  triggered: boolean;
  threat?: ICardDocument;
  countered: boolean;
  counteredBy?: {
    playerId: string;
    profession: string;
  };
  resourceDamage: Partial<IBunkerResources>;
  hpDamage: number;
  message: string;
}

export class CrisisResolver {
  public static shouldTriggerDailyCrisis(forceRoll = false): boolean {
    if (forceRoll) return true;
    // 40% daily crisis roll
    return Math.random() < 0.4;
  }

  public static rollThreat(): ICardDocument {
    const threats = getCardsByCategory('threat');
    return threats[Math.floor(Math.random() * threats.length)];
  }

  public static resolveThreat(
    threat: ICardDocument,
    survivors: IPlayerDocument[]
  ): ICrisisResolutionResult {
    const counterSpecialists: string[] = threat.metadata?.counterSpecialists || [];

    // Check if any alive survivor matches counter specialists
    let counterPlayer: IPlayerDocument | undefined;
    for (const survivor of survivors) {
      if (survivor.isEliminated) continue;
      const profId = survivor.cards?.profession?.cardId;
      if (profId && counterSpecialists.includes(profId)) {
        counterPlayer = survivor;
        break;
      }
    }

    if (counterPlayer) {
      // Threat neutralized with zero penalty!
      return {
        triggered: true,
        threat,
        countered: true,
        counteredBy: {
          playerId: counterPlayer.playerId,
          profession: counterPlayer.cards?.profession?.name || 'Специалист',
        },
        resourceDamage: {},
        hpDamage: 0,
        message: `Угроза "${threat.name}" успешно нейтрализована благодаря специалисту ${counterPlayer.nickname}!`,
      };
    }

    // Uncountered threat applies damage
    const penalty = threat.metadata?.mechanicalPenalty || {};
    const resourceDamage: Partial<IBunkerResources> = {};

    if (penalty.foodDamage) resourceDamage.food = -penalty.foodDamage;
    if (penalty.waterDamage) resourceDamage.water = -penalty.waterDamage;
    if (penalty.powerDamage) resourceDamage.power = -penalty.powerDamage;
    if (penalty.airDamage) resourceDamage.air = -penalty.airDamage;
    if (penalty.moraleDamage) resourceDamage.morale = -penalty.moraleDamage;

    const hpDamage = penalty.hpDamage ?? 10;

    return {
      triggered: true,
      threat,
      countered: false,
      resourceDamage,
      hpDamage,
      message: `Внимание! Угроза "${threat.name}" нанесла ущерб бункеру! ${threat.description}`,
    };
  }

  public static repairDefect(
    defectId: string,
    repairer: IPlayerDocument
  ): {
    success: boolean;
    repairedDefectId: string;
    message: string;
  } {
    const defect = getCardById(defectId);
    if (!defect) {
      throw new Error(`DEFECT_NOT_FOUND: Defect ${defectId} not found.`);
    }

    return {
      success: true,
      repairedDefectId: defectId,
      message: `${repairer.nickname} устранил дефект "${defect.name}".`,
    };
  }
}
