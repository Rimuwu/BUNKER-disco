import { IPlayerDocument } from '../../db/repositories/player.repository.js';
import { IBunkerResources, IResourceDeficitTracker } from './resource-manager.js';

export interface IGameEndStatus {
  isGameOver: boolean;
  outcome?: 'VICTORY' | 'DEFEAT';
  reason?: string;
  daysSurvived: number;
  survivors: Array<{
    playerId: string;
    nickname: string;
  }>;
}

export class VictoryEvaluator {
  public static evaluateGameEnd(
    currentDay: number,
    resources: IBunkerResources,
    tracker: IResourceDeficitTracker,
    survivors: IPlayerDocument[],
    hasSosTransmitted = false
  ): IGameEndStatus {
    const aliveSurvivors = survivors.filter((s) => !s.isEliminated);

    // 1. Instant Defeat: Air == 0
    if (resources.air <= 0) {
      return {
        isGameOver: true,
        outcome: 'DEFEAT',
        reason: 'КАТАСТРОФА: Запасы кислорода исчерпаны (Air=0). Обитатели бункера задохнулись.',
        daysSurvived: currentDay,
        survivors: [],
      };
    }

    // 2. Instant Defeat: All survivors perished
    if (aliveSurvivors.length === 0) {
      return {
        isGameOver: true,
        outcome: 'DEFEAT',
        reason: 'ПОЛНОЕ ВЫМИРАНИЕ: Все обитатели бункера погибли.',
        daysSurvived: currentDay,
        survivors: [],
      };
    }

    // 3. Fatal starvation / dehydration
    if (tracker.foodZeroDays >= 5) {
      return {
        isGameOver: true,
        outcome: 'DEFEAT',
        reason: 'ГОЛОДНАЯ СМЕРТЬ: Запасы провизии отсутствовали слишком долго.',
        daysSurvived: currentDay,
        survivors: [],
      };
    }

    if (tracker.waterZeroDays >= 4) {
      return {
        isGameOver: true,
        outcome: 'DEFEAT',
        reason: 'ОБЕЗВОЖИВАНИЕ: Бункер остался без воды.',
        daysSurvived: currentDay,
        survivors: [],
      };
    }

    // 4. Alternative Victory: SOS Radio beacon on Day 25+
    if (currentDay >= 25 && hasSosTransmitted) {
      return {
        isGameOver: true,
        outcome: 'VICTORY',
        reason: 'СПАСЕНИЕ: Спасательная экспедиция перехватила радиосигнал SOS и эвакуировала бункер!',
        daysSurvived: currentDay,
        survivors: aliveSurvivors.map((s) => ({
          playerId: s.playerId,
          nickname: s.nickname,
        })),
      };
    }

    // 5. Normal Victory: Day 30 completed
    if (currentDay >= 30) {
      return {
        isGameOver: true,
        outcome: 'VICTORY',
        reason: 'ПОБЕДА: Выжившие провели в бункере 30 дней и дождались открытия шлюзов!',
        daysSurvived: 30,
        survivors: aliveSurvivors.map((s) => ({
          playerId: s.playerId,
          nickname: s.nickname,
        })),
      };
    }

    // Game continues
    return {
      isGameOver: false,
      daysSurvived: currentDay,
      survivors: aliveSurvivors.map((s) => ({
        playerId: s.playerId,
        nickname: s.nickname,
      })),
    };
  }
}
