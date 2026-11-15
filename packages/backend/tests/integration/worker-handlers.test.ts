import { describe, it, expect, beforeEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { TaskWorker } from '../../src/worker/TaskWorker.js';
import { QueueProducer } from '../../src/queue/producer.js';
import { QueueConsumer } from '../../src/queue/consumer.js';
import { DistributedLock } from '../../src/queue/lock.js';
import { createRepositories } from '../../src/db/index.js';
import { EventBroadcaster } from '../../src/worker/EventBroadcaster.js';

describe('Integration: All 8 Worker Task Handlers & Gameplay Cycle', () => {
  let redis: any;
  let producer: QueueProducer;
  let consumer: QueueConsumer;
  let lock: DistributedLock;
  let repositories: any;
  let broadcaster: any;
  let worker: TaskWorker;
  let emittedEvents: Array<{ channel: string; event: string; data: any }>;

  beforeEach(() => {
    redis = new (RedisMock as any)();
    producer = new QueueProducer(redis);
    consumer = new QueueConsumer(redis);
    lock = new DistributedLock(redis);
    repositories = createRepositories(null);
    emittedEvents = [];

    // Capturing broadcaster
    broadcaster = new EventBroadcaster({
      to: (channel: string) => ({
        emit: (event: string, data: any) => {
          emittedEvents.push({ channel, event, data });
        },
      }),
    } as any);

    worker = new TaskWorker(redis, repositories, broadcaster, consumer, producer, lock, {
      lockTtlSeconds: 10,
    });
  });

  it('executes full two-phase lifecycle across all 8 task handlers', async () => {
    // 0. Setup Room and 4 Players
    const room = await repositories.rooms.create({
      code: 'TEST1',
      hostToken: 'host_token',
      settings: {
        enableSuperpowers: false,
        enablePhobias: true,
        enableCharacter: true,
        enableSecretQuests: true,
        rerollLimit: 1,
        discussionTimerSeconds: 60,
        votingTimerSeconds: 60,
      },
    });
    const roomId = room.roomId;

    const p1 = await repositories.players.create({ roomId, nickname: 'Alice', token: 'tok_1', isHost: true });
    const p2 = await repositories.players.create({ roomId, nickname: 'Bob', token: 'tok_2' });
    const p3 = await repositories.players.create({ roomId, nickname: 'Charlie', token: 'tok_3' });
    const p4 = await repositories.players.create({ roomId, nickname: 'Diana', token: 'tok_4' });

    // -------------------------------------------------------------
    // Handler 1: START_GAME
    // -------------------------------------------------------------
    const startRes = await worker.executeTask({
      taskId: 'task_start_game',
      type: 'START_GAME',
      roomId,
      queuedAt: Date.now(),
    });

    expect(startRes.success).toBe(true);
    expect(startRes.playerCount).toBe(4);
    expect(startRes.capacityK).toBe(2); // K = floor(4/2) = 2
    expect(startRes.roundsR).toBe(2);   // R = ceil(4/2) = 2

    const gameStateR1 = await repositories.games.findByRoomId(roomId);
    expect(gameStateR1?.phase).toBe('phase1');
    expect(gameStateR1?.phase1?.currentRound).toBe(1);
    expect(gameStateR1?.phase1?.survivorsCount).toBe(4);

    // Verify private cards_dealt events emitted
    const dealtEvents = emittedEvents.filter((e) => e.event === 'cards_dealt');
    expect(dealtEvents.length).toBe(4);

    // -------------------------------------------------------------
    // Handler 9: CLIENT_ACTION (Reveal card, Use ability)
    // -------------------------------------------------------------
    // Alice reveals profession (mandatory round 1 -> 0 AP)
    const revealRes = await worker.executeTask({
      taskId: 'task_reveal_prof',
      type: 'CLIENT_ACTION',
      roomId,
      playerId: p1.playerId,
      payload: { action: 'REVEAL_CARD', category: 'profession' },
      queuedAt: Date.now(),
    });
    expect(revealRes.success).toBe(true);
    expect(revealRes.card.isRevealed).toBe(true);

    const updatedP1 = await repositories.players.findById(p1.playerId);
    expect(updatedP1?.actionPoints).toBe(3); // 0 AP spent

    // -------------------------------------------------------------
    // Handler 2: PHASE1_VOTE_TICK (Speaker Rotation through survivors)
    // -------------------------------------------------------------
    // Set debate timer to 0 and rotate through all active survivors until voting starts
    let voteTickRes: any;
    for (let i = 0; i < 4; i++) {
      const g = await repositories.games.findByRoomId(roomId);
      g!.phase1!.debateTimerExpiresAt = Date.now() - 1000;
      await repositories.games.update(roomId, { phase1: g!.phase1 });

      voteTickRes = await worker.executeTask({
        taskId: `task_vote_tick_${i}`,
        type: 'PHASE1_VOTE_TICK',
        roomId,
        queuedAt: Date.now(),
      });
    }
    expect(voteTickRes.session).toBe('debate_transition_to_vote');

    const voteStartedEvent = emittedEvents.find((e) => e.event === 'vote_started');
    expect(voteStartedEvent).toBeDefined();

    // -------------------------------------------------------------
    // Client Action: CAST_VOTE (Round 1)
    // -------------------------------------------------------------
    // p1 votes for p4, p2 votes for p4, p3 votes for p4
    await worker.executeTask({
      taskId: 'task_vote_1',
      type: 'CLIENT_ACTION',
      roomId,
      playerId: p1.playerId,
      payload: { action: 'CAST_VOTE', nomineeId: p4.playerId },
      queuedAt: Date.now(),
    });
    await worker.executeTask({
      taskId: 'task_vote_2',
      type: 'CLIENT_ACTION',
      roomId,
      playerId: p2.playerId,
      payload: { action: 'CAST_VOTE', nomineeId: p4.playerId },
      queuedAt: Date.now(),
    });

    // -------------------------------------------------------------
    // Handler 3: PHASE1_RESOLVE_VOTING (Round 1)
    // -------------------------------------------------------------
    const resolveVotingRes = await worker.executeTask({
      taskId: 'task_resolve_vote_1',
      type: 'PHASE1_RESOLVE_VOTING',
      roomId,
      queuedAt: Date.now(),
    });
    expect(resolveVotingRes.status).toBe('voting_resolved');
    expect(resolveVotingRes.eliminatedPlayerId).toBe(p4.playerId);

    // -------------------------------------------------------------
    // Handler 4: PHASE1_EXILE (Round 1 Exile)
    // -------------------------------------------------------------
    const exile1Res = await worker.executeTask({
      taskId: 'task_exile_1',
      type: 'PHASE1_EXILE',
      roomId,
      playerId: p4.playerId,
      payload: { eliminatedPlayerId: p4.playerId },
      queuedAt: Date.now(),
    });
    // 4 - 1 = 3 survivors. K = 2, so does not transition yet!
    expect(exile1Res.status).toBe('advanced_round');
    expect(exile1Res.currentRound).toBe(2);
    expect(exile1Res.survivorsRemaining).toBe(3);

    // -------------------------------------------------------------
    // Round 2 Voting & Exile -> Transition to Phase 2
    // -------------------------------------------------------------
    // Open Round 2 voting
    const gameStateR2 = await repositories.games.findByRoomId(roomId);
    gameStateR2!.phase1!.votingSession = {
      isOpen: true,
      timerExpiresAt: Date.now() + 60000,
      ballots: { [p1.playerId]: p3.playerId, [p2.playerId]: p3.playerId },
    };
    await repositories.games.update(roomId, { phase1: gameStateR2!.phase1 });

    // Resolve Round 2 voting: p3 eliminated
    await worker.executeTask({
      taskId: 'task_resolve_vote_2',
      type: 'PHASE1_RESOLVE_VOTING',
      roomId,
      queuedAt: Date.now(),
    });

    // Exile p3: survivors drop from 3 to 2 == targetCapacityK (2)
    const exile2Res = await worker.executeTask({
      taskId: 'task_exile_2',
      type: 'PHASE1_EXILE',
      roomId,
      playerId: p3.playerId,
      payload: { eliminatedPlayerId: p3.playerId },
      queuedAt: Date.now(),
    });
    expect(exile2Res.status).toBe('transition_to_phase2');
    expect(exile2Res.survivorsRemaining).toBe(2);
    expect(exile2Res.targetCapacityK).toBe(2);

    // -------------------------------------------------------------
    // Handler 5: PHASE2_START
    // -------------------------------------------------------------
    const phase2StartRes = await worker.executeTask({
      taskId: 'task_phase2_start',
      type: 'PHASE2_START',
      roomId,
      queuedAt: Date.now(),
    });
    expect(phase2StartRes.success).toBe(true);
    expect(phase2StartRes.phase).toBe('phase2');
    expect(phase2StartRes.day).toBe(1);
    expect(phase2StartRes.survivorsCount).toBe(2);
    expect(phase2StartRes.resources.food).toBeDefined();

    const phase2StartEvent = emittedEvents.find((e) => e.event === 'phase2_start');
    expect(phase2StartEvent).toBeDefined();

    // -------------------------------------------------------------
    // Handler 7: PHASE2_RESOLVE_ACTIONS (Workstation assignments)
    // -------------------------------------------------------------
    const resolveActionsRes = await worker.executeTask({
      taskId: 'task_resolve_actions',
      type: 'PHASE2_RESOLVE_ACTIONS',
      roomId,
      payload: {
        roomAssignments: {
          [p1.playerId]: 'room_02_hydroponics_bay',
          [p2.playerId]: 'room_03_generator_core',
        },
      },
      queuedAt: Date.now(),
    });
    expect(resolveActionsRes.success).toBe(true);
    expect(resolveActionsRes.assignedRooms[p1.playerId]).toBe('room_02_hydroponics_bay');

    // -------------------------------------------------------------
    // Handler 8: PHASE2_CRISIS_CHECK
    // -------------------------------------------------------------
    const crisisRes = await worker.executeTask({
      taskId: 'task_crisis_check',
      type: 'PHASE2_CRISIS_CHECK',
      roomId,
      payload: { forceRoll: true },
      queuedAt: Date.now(),
    });
    expect(crisisRes.triggered).toBe(true);
    expect(crisisRes.threatId).toBeDefined();

    // -------------------------------------------------------------
    // Handler 6: PHASE2_DAY_TICK
    // -------------------------------------------------------------
    const dayTickRes = await worker.executeTask({
      taskId: 'task_day_tick_1',
      type: 'PHASE2_DAY_TICK',
      roomId,
      queuedAt: Date.now(),
    });
    expect(dayTickRes.success).toBe(true);
    expect(dayTickRes.day).toBe(1);

    const gameStateAfterTick = await repositories.games.findByRoomId(roomId);
    expect(gameStateAfterTick?.phase2?.currentDay).toBe(2);

    const dayStartEvent = emittedEvents.find((e) => e.event === 'day_start');
    expect(dayStartEvent).toBeDefined();
  });

  it('enforces round-scoped candidate veto: player excluded from Round 1 nominees but restored to eligible nominees and votable in Round 2', async () => {
    // 0. Setup Room and 5 Players (K = floor(5/2) = 2, R = ceil(5/2) = 3)
    const room = await repositories.rooms.create({
      code: 'VETOR',
      hostToken: 'host_token_veto',
      settings: {
        enableSuperpowers: false,
        enablePhobias: true,
        enableCharacter: true,
        enableSecretQuests: true,
        rerollLimit: 1,
        discussionTimerSeconds: 60,
        votingTimerSeconds: 60,
      },
    });
    const roomId = room.roomId;

    const p1 = await repositories.players.create({ roomId, nickname: 'Alice', token: 'tok_v1', isHost: true });
    const p2 = await repositories.players.create({ roomId, nickname: 'Bob', token: 'tok_v2' });
    const p3 = await repositories.players.create({ roomId, nickname: 'Charlie', token: 'tok_v3' });
    const p4 = await repositories.players.create({ roomId, nickname: 'Diana', token: 'tok_v4' });
    const p5 = await repositories.players.create({ roomId, nickname: 'Eve', token: 'tok_v5' });

    // 1. Start Game
    await worker.executeTask({
      taskId: 'task_start_veto_game',
      type: 'START_GAME',
      roomId,
      queuedAt: Date.now(),
    });

    // 2. Fast-forward debate to open Round 1 voting session
    for (let i = 0; i < 5; i++) {
      const g = await repositories.games.findByRoomId(roomId);
      g!.phase1!.debateTimerExpiresAt = Date.now() - 1000;
      await repositories.games.update(roomId, { phase1: g!.phase1 });

      await worker.executeTask({
        taskId: `task_vote_tick_r1_${i}`,
        type: 'PHASE1_VOTE_TICK',
        roomId,
        queuedAt: Date.now(),
      });
    }

    const stateR1 = await repositories.games.findByRoomId(roomId);
    expect(stateR1?.phase1?.votingSession?.isOpen).toBe(true);
    expect(stateR1?.phase1?.votingSession?.nominees).toContain(p1.playerId);

    // 3. Alice (p1) uses Candidate Veto (2 AP)
    const vetoRes = await worker.executeTask({
      taskId: 'task_alice_veto_r1',
      type: 'CLIENT_ACTION',
      roomId,
      playerId: p1.playerId,
      payload: { action: 'CANDIDATE_VETO' },
      queuedAt: Date.now(),
    });
    expect(vetoRes.success).toBe(true);

    const p1AfterVeto = await repositories.players.findById(p1.playerId);
    expect(p1AfterVeto?.actionPoints).toBe(1); // 3 - 2 = 1 AP

    const stateAfterVeto = await repositories.games.findByRoomId(roomId);
    const sessionR1 = stateAfterVeto?.phase1?.votingSession as any;
    expect(sessionR1.vetoedPlayerIds).toContain(p1.playerId);
    expect(sessionR1.nominees).not.toContain(p1.playerId);

    // In Round 1, attempting to vote for Alice throws INVALID_NOMINEE or NOMINEE_VETOED
    await expect(
      worker.executeTask({
        taskId: 'task_vote_for_vetoed_alice',
        type: 'CLIENT_ACTION',
        roomId,
        playerId: p2.playerId,
        payload: { action: 'CAST_VOTE', nomineeId: p1.playerId },
        queuedAt: Date.now(),
      })
    ).rejects.toThrow();

    // 4. Cast votes for Bob (p2) to exile him in Round 1
    for (const voter of [p1, p3, p4, p5]) {
      await worker.executeTask({
        taskId: `task_vote_bob_${voter.playerId}`,
        type: 'CLIENT_ACTION',
        roomId,
        playerId: voter.playerId,
        payload: { action: 'CAST_VOTE', nomineeId: p2.playerId },
        queuedAt: Date.now(),
      });
    }

    // Resolve voting -> Bob eliminated
    const resolveRes = await worker.executeTask({
      taskId: 'task_resolve_vote_r1',
      type: 'PHASE1_RESOLVE_VOTING',
      roomId,
      queuedAt: Date.now(),
    });
    expect(resolveRes.eliminatedPlayerId).toBe(p2.playerId);

    // Execute exile for Bob -> Round advances to Round 2
    const exileRes = await worker.executeTask({
      taskId: 'task_exile_bob',
      type: 'PHASE1_EXILE',
      roomId,
      playerId: p2.playerId,
      payload: { eliminatedPlayerId: p2.playerId },
      queuedAt: Date.now(),
    });
    expect(exileRes.status).toBe('advanced_round');
    expect(exileRes.currentRound).toBe(2);

    // Verify round-scoped veto list was cleared on gameState.phase1
    const stateAfterExile = await repositories.games.findByRoomId(roomId);
    expect((stateAfterExile?.phase1 as any).vetoedPlayerIds).toEqual([]);

    // 5. Fast-forward Round 2 debate until Round 2 voting opens
    for (let i = 0; i < 4; i++) {
      const g = await repositories.games.findByRoomId(roomId);
      g!.phase1!.debateTimerExpiresAt = Date.now() - 1000;
      await repositories.games.update(roomId, { phase1: g!.phase1 });

      await worker.executeTask({
        taskId: `task_vote_tick_r2_${i}`,
        type: 'PHASE1_VOTE_TICK',
        roomId,
        queuedAt: Date.now(),
      });
    }

    // 6. Verify Round 2 voting session: Alice is in eligibleNominees and NOT in vetoedPlayerIds
    const stateR2 = await repositories.games.findByRoomId(roomId);
    const sessionR2 = stateR2?.phase1?.votingSession as any;
    expect(sessionR2.isOpen).toBe(true);
    expect(sessionR2.nominees).toContain(p1.playerId);
    expect(sessionR2.vetoedPlayerIds).toEqual([]);
    expect(sessionR2.vetoAppliedBy).toBeUndefined();

    // 7. In Round 2, Charlie (p3) validly votes for Alice (p1) without error!
    const voteForAliceRes = await worker.executeTask({
      taskId: 'task_vote_alice_r2',
      type: 'CLIENT_ACTION',
      roomId,
      playerId: p3.playerId,
      payload: { action: 'CAST_VOTE', nomineeId: p1.playerId },
      queuedAt: Date.now(),
    });
    expect(voteForAliceRes.success).toBe(true);

    const stateAfterR2Vote = await repositories.games.findByRoomId(roomId);
    expect(stateAfterR2Vote?.phase1?.votingSession?.ballots[p3.playerId]).toBe(p1.playerId);
  });
});
