import { IGameTask } from '@bunker/shared';
import { WorkerContext } from '../TaskWorker.js';
import { dealInitialCards } from '../../engine/phase1/card-dealer.js';
import { GMPacing } from '../../engine/gm/gm-pacing.js';
import { TimerCoordinator } from '../../engine/gm/timer-coordinator.js';
import { ScenarioRunner } from '../../engine/gm/scenario-runner.js';

export class StartGameHandler {
  public async handle(task: IGameTask, context: WorkerContext): Promise<any> {
    const { roomId } = task;
    const { repositories, broadcaster } = context;

    const room = await repositories.rooms.findById(roomId);
    if (!room) {
      throw new Error(`ROOM_NOT_FOUND: Room ${roomId} does not exist.`);
    }

    if (room.status !== 'lobby') {
      throw new Error(`INVALID_PHASE: Cannot start game when room status is "${room.status}".`);
    }

    const players = await repositories.players.findByRoomId(roomId);
    const N = players.length;
    if (N < 2 || N > 20) {
      throw new Error(`INVALID_PLAYER_COUNT: Player count ${N} is outside the allowed range [2..20].`);
    }

    // 1. Deal cards respecting lobby settings
    const deal = dealInitialCards(players, room.settings);

    // 2. Persist dealt cards & reset AP to 3 for all players
    for (const player of players) {
      const hand = deal.playerHands.get(player.playerId);
      if (hand) {
        await repositories.players.update(player.playerId, {
          cards: hand.cards,
          inventory: hand.inventory,
          abilities: hand.abilities,
          secretQuests: hand.secretQuests,
          actionPoints: 3,
          isEliminated: false,
          isInBunker: false,
        });

        // Emit private deal to player
        broadcaster.sendPrivateCardsDealt(roomId, player.playerId, hand.cards);
      }
    }

    // 3. Configure PC Game Master pacing & timers
    const pacingMode = (room.settings as any)?.pacingMode || 'standard';
    const pacingConfig = GMPacing.getConfig(pacingMode);

    const debateDuration = room.settings?.discussionTimerSeconds ?? pacingConfig.discussionDurationSeconds;
    const allPlayerIds = players.map((p) => p.playerId);
    const firstSpeaker = GMPacing.getNextSpeaker(undefined, allPlayerIds) || players[0]?.playerId;

    TimerCoordinator.startTimer(roomId, 'debate', debateDuration);

    // 4. Generate procedural crisis timeline from catastrophe
    const timeline = ScenarioRunner.generateProceduralTimeline(deal.catastrophe);
    const defectCodes = deal.startingDefects.map((d) => (d.metadata as any)?.defectCode || d.cardId);

    // 5. Initialize Game State in DB
    const gameState = await repositories.games.create({
      roomId,
      phase: 'phase1',
      initialState: {
        catastrophe: deal.catastrophe,
        bunkerArchetype: deal.bunkerArchetype,
        startingDefects: defectCodes,
        proceduralTimeline: timeline,
        phase1: {
          currentRound: 1,
          survivorsCount: N,
          targetCapacityK: deal.targetCapacityK,
          eliminationRoundsTotal: deal.eliminationRoundsTotal,
          activeSpeakerId: firstSpeaker,
          spokenSpeakers: [firstSpeaker],
          debateTimerExpiresAt: Date.now() + debateDuration * 1000,
          exiledPlayers: [],
        } as any,
      } as any,
    });

    // 6. Update room status to phase1
    await repositories.rooms.updateStatus(roomId, 'phase1');

    // 7. Broadcast public events
    broadcaster.broadcastPhase1Start(roomId, {
      round: 1,
      revealOrder: ['profession', 'biology', 'health', 'hobby', 'item'],
    });

    broadcaster.broadcastSceneDirective(roomId, {
      cameraMode: 'SURFACE_WIDE',
      animation: 'campfire_ignite',
    });

    return {
      success: true,
      phase: 'phase1',
      playerCount: N,
      capacityK: deal.targetCapacityK,
      roundsR: deal.eliminationRoundsTotal,
      firstSpeaker,
      pacingMode: pacingConfig.mode,
    };
  }
}
