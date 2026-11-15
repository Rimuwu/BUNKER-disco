import { ICardDocument, getCardsByCategory } from '@bunker/shared';
import { Repositories } from '../../db/index.js';

export interface ITimelineDayEvent {
  day: number;
  threatCardId?: string;
  threatName?: string;
  specialWeather?: string;
  customNarration?: string;
}

export class ScenarioRunner {
  public static async getDayEvent(
    day: number,
    scenarioId: string | undefined,
    repositories: Repositories
  ): Promise<ITimelineDayEvent | null> {
    if (scenarioId) {
      const scenario = await repositories.scenarios.findById(scenarioId);
      if (scenario && scenario.timeline) {
        const found = scenario.timeline.find((g) => g.day === day);
        if (found) {
          return {
            day,
            threatCardId: found.threatId,
            threatName: found.specialEvent,
            customNarration: found.specialEvent,
          };
        }
      }
    }

    return null;
  }

  public static generateProceduralTimeline(catastropheCard: ICardDocument): ITimelineDayEvent[] {
    const threats = getCardsByCategory('threat');
    const timeline: ITimelineDayEvent[] = [];

    // Schedule 10-12 crisis days across the 30-day run
    for (let day = 1; day <= 30; day++) {
      if (day % 3 === 0 || day === 7 || day === 14 || day === 21 || day === 28) {
        const threat = threats[day % threats.length];
        timeline.push({
          day,
          threatCardId: threat.cardId,
          threatName: threat.name,
          customNarration: `День ${day}: приближается угроза "${threat.name}".`,
        });
      }
    }

    return timeline;
  }
}
