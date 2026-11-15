import { IGameTask, getCardsByCategory } from '@bunker/shared';
import { WorkerContext } from '../TaskWorker.js';
import { ResourceManager } from '../../engine/phase2/resource-manager.js';
import { SaboteurEngine } from '../../engine/phase2/saboteur-engine.js';
import { BunkerRoleEngine } from '../../engine/phase2/bunker-roles.js';

export class Phase2StartHandler {
  public async handle(task: IGameTask, context: WorkerContext): Promise<any> {
    const { roomId } = task;
    const { repositories, broadcaster } = context;

    const gameState = await repositories.games.findByRoomId(roomId);
    if (!gameState) {
      throw new Error(`GAME_STATE_NOT_FOUND: Room ${roomId} has no active game state.`);
    }

    const room = await repositories.rooms.findById(roomId);
    const players = await repositories.players.findByRoomId(roomId);
    const survivors = players.filter((p) => !p.isEliminated);

    // Invariant check: survivors count must equal targetCapacityK
    const targetK = gameState.phase1?.targetCapacityK ?? Math.floor(players.length / 2);
    if (survivors.length !== targetK) {
      throw new Error(
        `INVALID_TRANSITION: Survivors count (${survivors.length}) does not match bunker capacity K (${targetK}).`
      );
    }

    // 1. Mark survivors as inside bunker
    for (const survivor of survivors) {
      await repositories.players.update(survivor.playerId, {
        isInBunker: true,
        actionPoints: 3,
      });
    }

    // 2. Assign Saboteur if K >= 6 and traitor mode enabled
    const enableTraitor = room?.settings?.enableTraitor !== false;
    const saboteurIds = SaboteurEngine.assignSaboteurs(survivors, enableTraitor);
    for (const sabId of saboteurIds) {
      const s = survivors.find((p) => p.playerId === sabId);
      if (s) {
        await repositories.players.update(sabId, { cards: s.cards });
      }
    }

    // 3. Bunker Role Election: Elect the 7 specialized roles among survivors
    const electedRoles = BunkerRoleEngine.electRoles(survivors);

    // 4. Starting Defects: Roll dynamically (1d3 - 1, i.e., 0 to 2 defects) or use from initial deal
    const existingDefects = (gameState as any).startingDefects || (gameState.phase2 as any)?.activeDefects;
    let startingDefects: string[] = [];

    if (existingDefects && existingDefects.length > 0) {
      startingDefects = existingDefects;
    } else {
      const defectCards = getCardsByCategory('bunker_defect');
      const defectCount = Math.floor(Math.random() * 2) + 1; // 1 to 2 defects
      const shuffled = [...defectCards].sort(() => Math.random() - 0.5);
      startingDefects = shuffled
        .slice(0, defectCount)
        .map((d) => (d.metadata as any)?.defectCode || d.cardId);
    }

    // 5. Setup initial Phase 2 state
    const startingResources = ResourceManager.getInitialResources((gameState as any).bunkerArchetype?.metadata);

    const phase2State: any = {
      currentDay: 1,
      resources: startingResources,
      roomAssignments: {},
      activeThreats: [],
      activeDefects: startingDefects,
      craftQueue: [],
      bunkerRoles: electedRoles,
      deficitTracker: {
        foodZeroDays: 0,
        waterZeroDays: 0,
        airZeroDays: 0,
        moraleZeroDays: 0,
      },
    };

    await repositories.games.update(roomId, {
      phase: 'phase2',
      phase2: phase2State,
    });

    await repositories.rooms.updateStatus(roomId, 'phase2');

    // 6. Broadcast Phase 2 start & BigScreen descent directive
    broadcaster.broadcastPhase2Start(roomId, {
      day: 1,
      resources: startingResources,
      bunkerState: {
        capacity: targetK,
        survivorsCount: survivors.length,
        defects: startingDefects,
        electedRoles,
      },
    });

    broadcaster.broadcastSceneDirective(roomId, {
      cameraMode: 'BUNKER_OVERVIEW',
      animation: 'blast_door_seal_and_descend',
    });

    return {
      success: true,
      phase: 'phase2',
      day: 1,
      survivorsCount: survivors.length,
      saboteursAssigned: saboteurIds.length,
      electedRoles,
      resources: startingResources,
      startingDefects,
    };
  }
}
