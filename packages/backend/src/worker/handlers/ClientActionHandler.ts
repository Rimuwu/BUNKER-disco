import { IGameTask } from '@bunker/shared';
import { WorkerContext } from '../TaskWorker.js';
import { APEconomy } from '../../engine/phase1/ap-economy.js';
import { AbilityRegistry, resolvePickpocketMiniGame } from '../../engine/phase1/abilities.js';
import { VotingEngine } from '../../engine/phase1/voting-engine.js';
import { executeMulliganReroll } from '../../engine/phase1/card-dealer.js';
import { SaboteurEngine } from '../../engine/phase2/saboteur-engine.js';
import { CraftingEngine } from '../../engine/phase2/crafting-engine.js';
import { ResourceManager } from '../../engine/phase2/resource-manager.js';

export class ClientActionHandler {
  public async handle(task: IGameTask, context: WorkerContext): Promise<any> {
    const { roomId, playerId, payload } = task;
    const { repositories, broadcaster } = context;

    if (!playerId) {
      throw new Error('MISSING_PLAYER_ID: Client action requires playerId.');
    }

    const player = await repositories.players.findById(playerId);
    if (!player) {
      throw new Error(`PLAYER_NOT_FOUND: Player ${playerId} not found.`);
    }

    const gameState = await repositories.games.findByRoomId(roomId);
    if (!gameState) {
      throw new Error(`GAME_NOT_FOUND: Game state for room ${roomId} not found.`);
    }

    const action = payload?.action || payload?.type;

    switch (action) {
      // -------------------------------------------------------------
      // 1. REVEAL CARD
      // -------------------------------------------------------------
      case 'REVEAL_CARD': {
        const category = payload?.category;
        if (!category) throw new Error('MISSING_CATEGORY: Card category is required.');
        if (category === 'special_condition') {
          throw new Error('SECRET_QUEST_REVEAL_FORBIDDEN: Secret quests can never be revealed.');
        }

        const card = player.cards?.[category];
        if (!card) throw new Error(`CARD_NOT_FOUND: Player has no card in category "${category}".`);
        if (card.isRevealed) throw new Error('CARD_ALREADY_REVEALED: Card is already public.');

        const isVoluntary = Boolean(payload?.isVoluntary);
        const currentRound = gameState.phase1?.currentRound ?? 1;
        const apCost = APEconomy.getRevealCost(category, currentRound, isVoluntary);

        if (apCost > 0) {
          APEconomy.spendAP(player, apCost, `Voluntary reveal of ${category}`);
        }

        card.isRevealed = true;
        await repositories.players.update(player.playerId, {
          cards: player.cards,
          actionPoints: player.actionPoints,
        });

        broadcaster.broadcastCardRevealed(roomId, {
          playerId: player.playerId,
          cardType: category,
          category,
          cardData: card,
        });

        return { success: true, category, card };
      }

      // -------------------------------------------------------------
      // 2. USE ABILITY
      // -------------------------------------------------------------
      case 'USE_ABILITY': {
        const abilityId = payload?.abilityId;
        if (!abilityId) throw new Error('MISSING_ABILITY_ID: Ability ID is required.');

        let targetPlayer = undefined;
        if (payload?.targetPlayerId) {
          targetPlayer = (await repositories.players.findById(payload.targetPlayerId)) || undefined;
        }

        const result = await AbilityRegistry.execute(abilityId, {
          roomId,
          sourcePlayer: player,
          targetPlayer,
          gameState,
          payload,
        });

        await repositories.players.update(player.playerId, {
          actionPoints: player.actionPoints,
          abilities: player.abilities,
          inventory: player.inventory,
        });

        if (targetPlayer) {
          await repositories.players.update(targetPlayer.playerId, {
            cards: targetPlayer.cards,
            stats: targetPlayer.stats,
            inventory: targetPlayer.inventory,
            actionPoints: targetPlayer.actionPoints,
          });
        }

        broadcaster.broadcastAbilityActivated(roomId, {
          sourcePlayerId: player.playerId,
          abilityId,
          abilityName: result.abilityName,
          targetPlayerId: payload?.targetPlayerId,
          message: result.message,
        });

        return result;
      }

      // -------------------------------------------------------------
      // 3. MULLIGAN REROLL
      // -------------------------------------------------------------
      case 'PLAYER_REROLL': {
        const room = await repositories.rooms.findById(roomId);
        const freshHand = executeMulliganReroll(player, room?.settings);

        await repositories.players.update(player.playerId, {
          cards: freshHand.cards,
          inventory: freshHand.inventory,
          abilities: freshHand.abilities,
          secretQuests: freshHand.secretQuests,
          remainingRerolls: Math.max(0, player.remainingRerolls - 1),
        });

        broadcaster.sendPrivateCardsDealt(roomId, player.playerId, freshHand.cards);
        return { success: true, remainingRerolls: player.remainingRerolls };
      }

      // -------------------------------------------------------------
      // 4. CAST VOTE
      // -------------------------------------------------------------
      case 'CAST_VOTE': {
        const nomineeId = payload?.nomineeId;
        if (!nomineeId) throw new Error('MISSING_NOMINEE_ID: Nominee ID is required.');

        const session = gameState.phase1?.votingSession;
        if (!session || !session.isOpen) {
          throw new Error('VOTING_NOT_OPEN: Voting session is not active.');
        }

        const roomPlayers = await repositories.players.findByRoomId(roomId);
        const activeSurvivors = roomPlayers.filter((p) => !p.isEliminated).map((p) => p.playerId);
        const vetoedIds = (session as any).vetoedPlayerIds || (gameState.phase1 as any).vetoedPlayerIds || [];

        const validNominees = ((session as any).nominees && (session as any).nominees.length > 0)
          ? (session as any).nominees.filter((id: string) => !vetoedIds.includes(id))
          : activeSurvivors.filter((id) => !vetoedIds.includes(id));

        VotingEngine.castVote(
          {
            isOpen: session.isOpen,
            timerExpiresAt: session.timerExpiresAt,
            ballots: session.ballots || {},
            nominees: validNominees,
            vetoedPlayerIds: vetoedIds,
            isTieBreakRound: (session as any).isTieBreakRound,
            tiedCandidates: (session as any).tiedCandidates,
          },
          player,
          nomineeId
        );

        session.ballots[player.playerId] = nomineeId;
        (session as any).nominees = validNominees;
        (session as any).vetoedPlayerIds = vetoedIds;
        await repositories.games.update(roomId, { phase1: gameState.phase1 });

        return { success: true, votedFor: nomineeId };
      }

      // -------------------------------------------------------------
      // 5. CANDIDATE VETO
      // -------------------------------------------------------------
      case 'VETO':
      case 'CANDIDATE_VETO': {
        const session = gameState.phase1?.votingSession;
        if (!session) throw new Error('NO_VOTING_SESSION: No voting session found.');

        // Enforce once-per-game invariant
        if ((player as any).hasUsedVeto || (player as any).vetoUsed) {
          throw new Error(`VETO_ALREADY_USED: Player ${player.nickname} has already used candidate veto in this game.`);
        }

        const survivorsCount = gameState.phase1?.survivorsCount ?? 4;
        const targetCapacityK = gameState.phase1?.targetCapacityK ?? 2;

        const roomPlayers = await repositories.players.findByRoomId(roomId);
        const activeSurvivors = roomPlayers.filter((p) => !p.isEliminated).map((p) => p.playerId);
        const existingVetoed = (session as any).vetoedPlayerIds || (gameState.phase1 as any).vetoedPlayerIds || [];

        const sessionObj: any = {
          isOpen: session.isOpen,
          timerExpiresAt: session.timerExpiresAt,
          ballots: session.ballots || {},
          nominees: (session as any).nominees || activeSurvivors,
          vetoedPlayerIds: existingVetoed,
        };

        VotingEngine.activateCandidateVeto(
          sessionObj,
          player,
          survivorsCount,
          targetCapacityK
        );

        // Mark veto used on player
        (player as any).hasUsedVeto = true;
        (player as any).vetoUsed = true;

        // Persist veto state in game state and session
        const updatedVetoed = [...new Set([...existingVetoed, player.playerId])];
        (session as any).vetoedPlayerIds = updatedVetoed;
        (session as any).vetoAppliedBy = player.playerId;
        (session as any).nominees = ((session as any).nominees || activeSurvivors).filter((id: string) => id !== player.playerId);
        (gameState.phase1 as any).vetoedPlayerIds = updatedVetoed;

        await repositories.players.update(player.playerId, {
          actionPoints: player.actionPoints,
          hasUsedVeto: true,
          vetoUsed: true,
        } as any);

        await repositories.games.update(roomId, { phase1: gameState.phase1 });

        return { success: true, vetoed: true };
      }

      // -------------------------------------------------------------
      // 6. TRADE ITEM
      // -------------------------------------------------------------
      case 'TRADE_ITEM': {
        const { targetPlayerId, offerItemId, requestItemId } = payload || {};
        if (!targetPlayerId || !offerItemId || !requestItemId) {
          throw new Error('INVALID_TRADE: Missing trade parameters.');
        }

        const target = await repositories.players.findById(targetPlayerId);
        if (!target) throw new Error('TARGET_NOT_FOUND: Target player not found.');

        APEconomy.spendAP(player, 1, 'Item Trade');

        const offerIdx = player.inventory.findIndex((i) => i.itemId === offerItemId);
        const reqIdx = target.inventory.findIndex((i) => i.itemId === requestItemId);

        if (offerIdx === -1 || reqIdx === -1) {
          throw new Error('ITEMS_NOT_FOUND: Specified items not found in inventories.');
        }

        const [offered] = player.inventory.splice(offerIdx, 1);
        const [requested] = target.inventory.splice(reqIdx, 1);

        player.inventory.push(requested);
        target.inventory.push(offered);

        await repositories.players.update(player.playerId, {
          inventory: player.inventory,
          actionPoints: player.actionPoints,
        });
        await repositories.players.update(target.playerId, {
          inventory: target.inventory,
        });

        return { success: true, swapped: [offerItemId, requestItemId] };
      }

      // -------------------------------------------------------------
      // 7. PICKPOCKET RHYTHM MINI-GAME
      // -------------------------------------------------------------
      case 'PICKPOCKET_MINIGAME': {
        const { targetPlayerId, targetItemId, score } = payload || {};
        const target = await repositories.players.findById(targetPlayerId);
        if (!target) throw new Error('TARGET_NOT_FOUND: Target player not found.');

        const minigameResult = resolvePickpocketMiniGame({
          score: score ?? 5,
          sourcePlayer: player,
          targetPlayer: target,
          targetItemId,
        });

        await repositories.players.update(player.playerId, {
          inventory: player.inventory,
          actionPoints: player.actionPoints,
        });
        await repositories.players.update(target.playerId, {
          inventory: target.inventory,
        });

        return minigameResult;
      }

      // -------------------------------------------------------------
      // 8. SABOTAGE (Traitor Action)
      // -------------------------------------------------------------
      case 'SABOTAGE': {
        const sabotageType = payload?.sabotageType;
        const allPlayers = await repositories.players.findByRoomId(roomId);
        const others = allPlayers.filter((p) => p.playerId !== player.playerId && !p.isEliminated);

        const sabotageResult = SaboteurEngine.executeSabotage(player, sabotageType, others);

        if (gameState.phase2) {
          gameState.phase2.resources = ResourceManager.applyDeltas(
            gameState.phase2.resources,
            sabotageResult.resourceDeltas
          ).updated;
          await repositories.games.update(roomId, { phase2: gameState.phase2 });
        }

        await repositories.players.update(player.playerId, {
          actionPoints: player.actionPoints,
        });

        return sabotageResult;
      }

      // -------------------------------------------------------------
      // 9. ASSIGN WORKSTATION ROOM
      // -------------------------------------------------------------
      case 'ASSIGN_WORKSTATION': {
        const workstationId = payload?.workstationId || payload?.roomId;
        if (!workstationId) throw new Error('MISSING_ROOM_ID: Workstation roomId is required.');

        if (!gameState.phase2) throw new Error('NOT_IN_PHASE2: Game is not in Phase 2.');

        gameState.phase2.roomAssignments = {
          ...(gameState.phase2.roomAssignments || {}),
          [player.playerId]: workstationId,
        };

        await repositories.games.update(roomId, { phase2: gameState.phase2 });
        return { success: true, assignedRoomId: workstationId };
      }

      // -------------------------------------------------------------
      // 10. QUEUE CRAFT
      // -------------------------------------------------------------
      case 'QUEUE_CRAFT': {
        const recipeId = payload?.recipeId;
        if (!recipeId) throw new Error('MISSING_RECIPE_ID: Recipe ID is required.');
        if (!gameState.phase2) throw new Error('NOT_IN_PHASE2: Game is not in Phase 2.');

        const queued = CraftingEngine.queueRecipe(player, recipeId, true);
        gameState.phase2.craftQueue.push(queued);

        await repositories.players.update(player.playerId, { inventory: player.inventory });
        await repositories.games.update(roomId, { phase2: gameState.phase2 });

        return { success: true, craftItem: queued };
      }

      default:
        throw new Error(`UNKNOWN_CLIENT_ACTION: Action "${action}" is not supported.`);
    }
  }
}
