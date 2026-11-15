import { IGameTask } from '@bunker/shared';
import { WorkerContext } from '../TaskWorker.js';
import { CraftingEngine } from '../../engine/phase2/crafting-engine.js';
import { BunkerRoleEngine } from '../../engine/phase2/bunker-roles.js';
import { ResourceManager } from '../../engine/phase2/resource-manager.js';

export class Phase2ResolveActionsHandler {
  public async handle(task: IGameTask, context: WorkerContext): Promise<any> {
    const { roomId, payload } = task;
    const { repositories, broadcaster } = context;

    const gameState = await repositories.games.findByRoomId(roomId);
    if (!gameState || !gameState.phase2) {
      throw new Error(`INVALID_PHASE: Room ${roomId} has no active Phase 2 state.`);
    }

    const phase2 = gameState.phase2;
    const roomAssignments = payload?.roomAssignments || {};
    const craftRequests = payload?.craftRequests || [];
    const roleOverrides = payload?.bunkerRoles;

    // 1. Update room assignments
    phase2.roomAssignments = {
      ...(phase2.roomAssignments || {}),
      ...roomAssignments,
    };

    // 2. Update bunker roles if provided
    if (roleOverrides) {
      (phase2 as any).bunkerRoles = {
        ...((phase2 as any).bunkerRoles || {}),
        ...roleOverrides,
      };
    }

    // 3. Process craft requests
    const players = await repositories.players.findByRoomId(roomId);
    const queuedItems: any[] = [];

    for (const req of craftRequests) {
      const player = players.find((p) => p.playerId === req.playerId);
      if (player) {
        try {
          const item = CraftingEngine.queueRecipe(player, req.recipeId, true);
          phase2.craftQueue.push(item);
          queuedItems.push(item);
          await repositories.players.update(player.playerId, { inventory: player.inventory });
        } catch (err: any) {
          console.warn(`[Phase2ResolveActions] Craft error for player ${req.playerId}:`, err.message);
        }
      }
    }

    // 4. Resolve Bunker Role Actions genuinely
    const activeRoles = (phase2 as any).bunkerRoles || {};
    const roleResolution = BunkerRoleEngine.resolveRoleActions(activeRoles, players, gameState);

    // Apply resource deltas from role actions
    phase2.resources = ResourceManager.applyDeltas(phase2.resources, roleResolution.resourceDeltas).updated;

    // Persist mutated players (healing from medic, AP from leader)
    for (const player of players) {
      await repositories.players.update(player.playerId, {
        stats: player.stats,
        actionPoints: player.actionPoints,
      });
    }

    // 5. Persist updated game state
    await repositories.games.update(roomId, { phase2 });

    // 6. Broadcast resolution with narrative logs
    const actionLogs = [
      `Дневные назначения подтверждены. Распределено комнат: ${Object.keys(roomAssignments).length}.`,
      `В очередь крафта добавлено рецептов: ${queuedItems.length}.`,
      ...roleResolution.logs,
    ];

    broadcaster.broadcastActionsResolved(roomId, {
      day: phase2.currentDay,
      resources: phase2.resources,
      log: actionLogs,
    });

    return {
      success: true,
      day: phase2.currentDay,
      assignedRooms: roomAssignments,
      queuedCrafts: queuedItems.length,
      resolvedRoles: Object.keys(activeRoles).length,
      healedPlayers: roleResolution.healedPlayerIds,
      logs: actionLogs,
    };
  }
}
