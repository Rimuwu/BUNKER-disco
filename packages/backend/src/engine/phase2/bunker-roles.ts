import { IPlayerDocument } from '../../db/repositories/player.repository.js';
import { IGameStateDocument } from '@bunker/shared';
import { IBunkerResources } from './resource-manager.js';

export type BunkerRoleType =
  | 'LEADER'
  | 'CHEF'
  | 'ENGINEER'
  | 'MEDIC'
  | 'GUARD'
  | 'COMMS'
  | 'AGRONOMIST';

export interface IRoleDefinition {
  role: BunkerRoleType;
  title: string;
  preferredProfessions: string[];
  description: string;
}

export const BUNKER_ROLES: IRoleDefinition[] = [
  {
    role: 'LEADER',
    title: 'Лидер убежища',
    preferredProfessions: ['prof_diplomat', 'prof_psychologist', 'prof_military', 'prof_politician'],
    description: '+1 ОД в день всем выжившим; принимает решения при ничье; +2 к Морали.',
  },
  {
    role: 'CHEF',
    title: 'Шеф-повар',
    preferredProfessions: ['prof_cook', 'prof_chef', 'prof_farmer'],
    description: 'Эффективность кухни: экономит продовольствие (+2 Food в день).',
  },
  {
    role: 'ENGINEER',
    title: 'Инженер бункера',
    preferredProfessions: ['prof_engineer', 'prof_mechanic', 'prof_electrician', 'prof_plumber', 'prof_carpenter'],
    description: 'Ускоряет починку поломок и поддерживает энергосеть (+2 Power).',
  },
  {
    role: 'MEDIC',
    title: 'Дежурный медик',
    preferredProfessions: ['prof_doctor', 'prof_paramedic', 'prof_surgeon', 'prof_pharmacist', 'prof_veterinarian'],
    description: 'Лечение: восстанавливает +10 HP раненым жителям бункера.',
  },
  {
    role: 'GUARD',
    title: 'Страж периметра',
    preferredProfessions: ['prof_military', 'prof_sniper', 'prof_security', 'prof_detective', 'prof_sapper'],
    description: 'Защита от саботажа и краж; повышение безопасности.',
  },
  {
    role: 'COMMS',
    title: 'Оперативник связи',
    preferredProfessions: ['prof_radio_operator', 'prof_programmer', 'prof_sysadmin', 'prof_hacker'],
    description: 'Поддержка радиомачты: +10 к прогрессу сигнала SOS.',
  },
  {
    role: 'AGRONOMIST',
    title: 'Агроном бункера',
    preferredProfessions: ['prof_agronomist', 'prof_farmer', 'prof_biologist'],
    description: 'Гидропоника: производство дополнительных продуктов питания (+2 Food).',
  },
];

export interface IRoleResolutionResult {
  appliedRoles: Record<string, BunkerRoleType>;
  resourceDeltas: Partial<IBunkerResources>;
  healedPlayerIds: string[];
  sosProgressDelta: number;
  logs: string[];
}

export class BunkerRoleEngine {
  /**
   * Elects or assigns the 7 bunker roles among survivors based on qualifications.
   * Maps playerId -> BunkerRoleType.
   */
  public static electRoles(survivors: IPlayerDocument[]): Record<string, BunkerRoleType> {
    const assigned: Record<string, BunkerRoleType> = {};
    const unassignedSurvivors = [...survivors];

    for (const def of BUNKER_ROLES) {
      if (unassignedSurvivors.length === 0) break;

      // Find best matching candidate by preferred profession priority
      let bestMatchIndex = -1;
      for (const preferred of def.preferredProfessions) {
        const idx = unassignedSurvivors.findIndex((p) => p.cards?.profession?.cardId === preferred);
        if (idx !== -1) {
          bestMatchIndex = idx;
          break;
        }
      }

      if (bestMatchIndex !== -1) {
        const [candidate] = unassignedSurvivors.splice(bestMatchIndex, 1);
        assigned[candidate.playerId] = def.role;
      } else {
        // Fallback to any available survivor
        const [candidate] = unassignedSurvivors.splice(0, 1);
        assigned[candidate.playerId] = def.role;
      }
    }

    // Any remaining survivors become Free Agents (+2 AP)
    return assigned;
  }

  /**
   * Resolves daily bunker role actions and returns resource deltas, heals, and narrative logs.
   */
  public static resolveRoleActions(
    roles: Record<string, BunkerRoleType>,
    players: IPlayerDocument[],
    gameState: IGameStateDocument
  ): IRoleResolutionResult {
    const resourceDeltas: Partial<IBunkerResources> = {
      food: 0,
      water: 0,
      power: 0,
      morale: 0,
      medicine: 0,
      air: 0,
    };
    const healedPlayerIds: string[] = [];
    let sosProgressDelta = 0;
    const logs: string[] = [];

    const alivePlayers = players.filter((p) => !p.isEliminated);

    for (const [playerId, role] of Object.entries(roles)) {
      const player = alivePlayers.find((p) => p.playerId === playerId);
      if (!player) continue;

      switch (role) {
        case 'LEADER': {
          // +1 AP to all alive survivors + 2 Morale
          for (const p of alivePlayers) {
            p.actionPoints = Math.min(6, (p.actionPoints || 3) + 1);
          }
          resourceDeltas.morale = (resourceDeltas.morale || 0) + 2;
          logs.push(`Лидер ${player.nickname} вдохновил жителей (+1 ОД всем, +2 Мораль).`);
          break;
        }

        case 'CHEF': {
          // Food efficiency: +2 Food
          resourceDeltas.food = (resourceDeltas.food || 0) + 2;
          logs.push(`Шеф-повар ${player.nickname} оптимизировал рацион кухни (+2 Еда).`);
          break;
        }

        case 'ENGINEER': {
          // Power boost / repair: +2 Power
          resourceDeltas.power = (resourceDeltas.power || 0) + 2;
          if (gameState.phase2?.activeDefects && gameState.phase2.activeDefects.length > 0) {
            const repaired = gameState.phase2.activeDefects.pop();
            logs.push(`Инженер ${player.nickname} провел диагностику и устранил дефект ${repaired}.`);
          } else {
            logs.push(`Инженер ${player.nickname} повысил отдачу генератора (+2 Энергия).`);
          }
          break;
        }

        case 'MEDIC': {
          // Heals injured survivors
          for (const p of alivePlayers) {
            if (p.stats.health < 100) {
              p.stats.health = Math.min(100, p.stats.health + 10);
              healedPlayerIds.push(p.playerId);
            }
          }
          logs.push(`Дежурный медик ${player.nickname} оказал медпомощь раненым (+10 HP).`);
          break;
        }

        case 'GUARD': {
          // Defends against internal threats & sabotage
          logs.push(`Страж ${player.nickname} провел проверку безопасности и защитил бункер от саботажа.`);
          break;
        }

        case 'COMMS': {
          // SOS boost +10
          sosProgressDelta += 10;
          logs.push(`Оперативник связи ${player.nickname} отправил радиограмму в эфир (+10 к сигналу SOS).`);
          break;
        }

        case 'AGRONOMIST': {
          // +2 Food
          resourceDeltas.food = (resourceDeltas.food || 0) + 2;
          logs.push(`Агроном ${player.nickname} собрал дополнительный урожай на гидропонике (+2 Еда).`);
          break;
        }
      }
    }

    return {
      appliedRoles: roles,
      resourceDeltas,
      healedPlayerIds,
      sosProgressDelta,
      logs,
    };
  }
}
