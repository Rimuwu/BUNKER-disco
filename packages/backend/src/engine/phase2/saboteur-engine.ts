import { IPlayerDocument } from '../../db/repositories/player.repository.js';
import { IBunkerResources } from './resource-manager.js';
import { APEconomy } from '../phase1/ap-economy.js';

export type SabotageType =
  | 'SABOTAGE_WATER'
  | 'SABOTAGE_FOOD'
  | 'SABOTAGE_POWER'
  | 'SABOTAGE_POISON'
  | 'SABOTAGE_WHISPER';

export interface ISabotageResult {
  success: boolean;
  type: SabotageType;
  saboteurId: string;
  resourceDeltas: Partial<IBunkerResources>;
  poisonedPlayerId?: string;
  alertEmitted: boolean;
  message: string;
}

export class SaboteurEngine {
  public static shouldAssignSaboteur(survivorsCount: number, enableTraitor = true): boolean {
    return enableTraitor && survivorsCount >= 6;
  }

  public static assignSaboteurs(survivors: IPlayerDocument[], enableTraitor = true): string[] {
    if (!this.shouldAssignSaboteur(survivors.length, enableTraitor)) {
      return [];
    }

    const eligible = survivors.filter((s) => !s.isEliminated);
    if (eligible.length === 0) return [];

    const saboteurCount = eligible.length >= 12 ? 2 : 1;
    const shuffled = [...eligible].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, saboteurCount);

    for (const player of selected) {
      if (!player.cards) player.cards = {};
      player.cards.saboteur = {
        isSaboteur: true,
        assignedAt: new Date(),
      };
    }

    return selected.map((p) => p.playerId);
  }

  public static isSaboteur(player: IPlayerDocument): boolean {
    return Boolean(player.cards?.saboteur?.isSaboteur);
  }

  public static executeSabotage(
    saboteur: IPlayerDocument,
    type: SabotageType,
    otherSurvivors: IPlayerDocument[]
  ): ISabotageResult {
    if (!this.isSaboteur(saboteur)) {
      throw new Error('NOT_A_SABOTEUR: Only assigned saboteurs can execute covert sabotage.');
    }

    switch (type) {
      case 'SABOTAGE_WATER':
        APEconomy.spendAP(saboteur, 2, 'Sabotage Water');
        return {
          success: true,
          type,
          saboteurId: saboteur.playerId,
          resourceDeltas: { water: -3 },
          alertEmitted: false,
          message: 'Труба резервуара с водой была тайно повреждена ночью!',
        };

      case 'SABOTAGE_FOOD':
        APEconomy.spendAP(saboteur, 2, 'Sabotage Food');
        const detected = Math.random() < 0.3;
        return {
          success: true,
          type,
          saboteurId: saboteur.playerId,
          resourceDeltas: { food: -4 },
          alertEmitted: detected,
          message: detected
            ? 'Следы порчи провизии обнаружены! Часть запасов еды отравлена!'
            : 'Запасы еды незаметно уменьшились в кладовой.',
        };

      case 'SABOTAGE_POWER':
        APEconomy.spendAP(saboteur, 3, 'Sabotage Power');
        return {
          success: true,
          type,
          saboteurId: saboteur.playerId,
          resourceDeltas: { power: -5 },
          alertEmitted: true,
          message: 'Диверсия на генераторе! Произошло короткое замыкание!',
        };

      case 'SABOTAGE_POISON':
        APEconomy.spendAP(saboteur, 3, 'Sabotage Poison');
        const target = otherSurvivors[Math.floor(Math.random() * otherSurvivors.length)];
        if (target) {
          target.stats.health = Math.max(10, target.stats.health - 20);
        }
        return {
          success: true,
          type,
          saboteurId: saboteur.playerId,
          resourceDeltas: {},
          poisonedPlayerId: target?.playerId,
          alertEmitted: true,
          message: `${target ? target.nickname : 'Один из выживших'} внезапно слег с острым отравлением!`,
        };

      case 'SABOTAGE_WHISPER':
        APEconomy.spendAP(saboteur, 1, 'Sabotage Whisper');
        return {
          success: true,
          type,
          saboteurId: saboteur.playerId,
          resourceDeltas: { morale: -5 },
          alertEmitted: false,
          message: 'Панические слухи и подозрения подорвали боевой дух команды.',
        };
    }
  }

  public static resolveAccusation(
    accusedPlayer: IPlayerDocument,
    isGuilty: boolean
  ): {
    accusedWasSaboteur: boolean;
    penaltyApplies: boolean;
    moraleDelta: number;
    message: string;
  } {
    const wasSaboteur = this.isSaboteur(accusedPlayer);

    if (wasSaboteur) {
      accusedPlayer.isEliminated = true;
      accusedPlayer.role = 'spectator';
      return {
        accusedWasSaboteur: true,
        penaltyApplies: false,
        moraleDelta: +10,
        message: `Успех! ${accusedPlayer.nickname} действительно оказался диверсантом и был изолирован! Мораль +10.`,
      };
    } else {
      return {
        accusedWasSaboteur: false,
        penaltyApplies: true,
        moraleDelta: -10,
        message: `Ошибка! ${accusedPlayer.nickname} оказался невиновен! Команда расколота, мораль -10.`,
      };
    }
  }
}
