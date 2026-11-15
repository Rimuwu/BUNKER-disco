import { IPlayerDocument } from '../../db/repositories/player.repository.js';
import { IBunkerResources } from './resource-manager.js';

export interface IRoomAssignment {
  playerId: string;
  roomId: string;
}

export interface IRoomYield {
  resourceDeltas: Partial<IBunkerResources>;
  healingPlayerIds: string[];
  moraleBonus: number;
  isVentilationActive: boolean;
  isWorkshopActive: boolean;
  sosProgress: number;
}

export class WorkstationManager {
  public static calculateDailyRoomYields(
    assignments: Record<string, string>, // playerId -> roomId
    players: IPlayerDocument[]
  ): IRoomYield {
    const yieldResult: IRoomYield = {
      resourceDeltas: {},
      healingPlayerIds: [],
      moraleBonus: 0,
      isVentilationActive: true,
      isWorkshopActive: false,
      sosProgress: 0,
    };

    // Group players by assigned room
    const roomWorkers = new Map<string, IPlayerDocument[]>();
    for (const player of players) {
      if (player.isEliminated) continue;
      const roomId = assignments[player.playerId] || 'room_09_crew_quarters'; // canonical default rest
      const list = roomWorkers.get(roomId) || [];
      list.push(player);
      roomWorkers.set(roomId, list);
    }

    let foodDelta = 0;
    let waterDelta = 0;
    let powerDelta = 0;
    let moraleDelta = 0;

    for (const [roomId, workers] of roomWorkers.entries()) {
      if (workers.length === 0) continue;

      switch (roomId) {
        // Hydroponics Bay (room_02)
        case 'room_02_hydroponics_bay':
          // +3 Food per worker, +1 extra if Botanist or Agronomist
          for (const w of workers) {
            const hasGreenThumb =
              w.cards?.profession?.cardId === 'prof_agronomist' ||
              w.cards?.profession?.cardId === 'prof_farmer' ||
              w.cards?.profession?.cardId === 'prof_biologist';
            foodDelta += hasGreenThumb ? 4 : 3;
          }
          break;

        // Generator Core (room_03)
        case 'room_03_generator_core':
          // Generator produces +10 Power
          powerDelta += 10;
          for (const w of workers) {
            if (
              w.cards?.profession?.cardId === 'prof_engineer' ||
              w.cards?.profession?.cardId === 'prof_electrician' ||
              w.cards?.profession?.cardId === 'prof_mechanic' ||
              w.cards?.profession?.cardId === 'prof_nuclear_physicist'
            ) {
              powerDelta += 2; // bonus power
            }
          }
          break;

        // Life Support & Ventilation (room_04)
        case 'room_04_life_support_ventilation':
          yieldResult.isVentilationActive = true;
          break;

        // MedBay (room_05)
        case 'room_05_medbay':
          // Heals injured workers in medbay
          for (const w of workers) {
            yieldResult.healingPlayerIds.push(w.playerId);
          }
          break;

        // Kitchen & Mess Hall (room_06)
        case 'room_06_kitchen_mess_hall':
          for (const w of workers) {
            const isCook = w.cards?.profession?.cardId === 'prof_cook' || w.cards?.profession?.cardId === 'prof_chef';
            foodDelta += isCook ? 2 : 1;
            moraleDelta += 1;
          }
          break;

        // Workshop (room_07)
        case 'room_07_workshop':
          yieldResult.isWorkshopActive = true;
          break;

        // Water Treatment Plant (room_12 canonical, room_08 alias)
        case 'room_12_water_treatment_plant':
        case 'room_08_water_treatment':
          // +4 Water baseline, +5 with Plumber/Engineer
          for (const w of workers) {
            const isPlumber =
              w.cards?.profession?.cardId === 'prof_plumber' ||
              w.cards?.profession?.cardId === 'prof_engineer';
            waterDelta += isPlumber ? 5 : 4;
          }
          break;

        // Comms Station (room_08 canonical, room_09 alias)
        case 'room_08_comms_station':
        case 'room_09_comms_center':
          // SOS progress
          yieldResult.sosProgress += workers.length * 10;
          break;

        // Crew Quarters (room_09 canonical, room_11 alias)
        case 'room_09_crew_quarters':
        case 'room_11_dormitory':
          // Resting players heal +5 HP
          for (const w of workers) {
            yieldResult.healingPlayerIds.push(w.playerId);
          }
          break;

        // Armory (room_10)
        case 'room_10_armory':
          moraleDelta += 1;
          break;

        // Science Lab (room_11)
        case 'room_11_science_lab':
          moraleDelta += 1;
          break;

        // Lounge & Archive (room_14 canonical, recreation room alias)
        case 'room_14_lounge_archive':
        case 'room_14_recreation_room':
          // +5 Morale
          moraleDelta += 5;
          break;

        // Deep Storage Vault (room_15)
        case 'room_15_deep_storage_vault':
          foodDelta += 1;
          waterDelta += 1;
          break;

        // Incinerator & Waste Disposal (room_16)
        case 'room_16_incinerator_waste_disposal':
          powerDelta += 1;
          break;

        // Airlock (room_01)
        case 'room_01_airlock':
        // Brig Quarantine Cell (room_13)
        case 'room_13_brig_quarantine_cell':
          break;
      }
    }

    yieldResult.resourceDeltas = {
      food: foodDelta,
      water: waterDelta,
      power: powerDelta,
      morale: moraleDelta,
    };

    return yieldResult;
  }
}
