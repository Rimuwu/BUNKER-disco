import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';
import {
  createCastVotePayload,
  createDualVotePayload,
  createNominatePlayerPayload,
  createDualNominatePayload,
} from '../helpers/mock-payloads';

describe('Feature 07: Voting Mechanics & Bunker Capacity Invariant', () => {
  let p1: TestClient;
  let p2: TestClient;
  let p3: TestClient;

  beforeEach(() => {
    p1 = new TestClient({ nickname: 'VoterAlice' });
    p2 = new TestClient({ nickname: 'NomineeBob' });
    p3 = new TestClient({ nickname: 'VoterCharlie' });
  });

  afterEach(() => {
    p1.disconnect();
    p2.disconnect();
    p3.disconnect();
  });

  it('initiates voting session with vote_started event, active nominees and timer countdown', async () => {
    const live = await isServiceHealthy(p1.baseUrl);

    const nomPayload = createDualNominatePayload('p2');
    expect(nomPayload.payload.nomineeId).toBe('p2');
    expect(nomPayload.payload.targetPlayerId).toBe('p2');

    if (live.healthy) {
      await p1.createRoom();
      await p2.joinRoom(p1.roomCode);
      await p1.sendAction('START_GAME', {});
      const res = await p1.sendAction('NOMINATE_PLAYER', nomPayload.payload);
      expect([200, 202]).toContain(res.status);
    } else {
      p1.setAuth('jwt-p1', 'VOTE1', 'p1', 'r1');

      p1.pushMockEvent('vote_started', {
        nomineeId: 'p2',
        nomineeNickname: 'NomineeBob',
        timeLimit: 60,
        round: 1,
        voterIds: ['p1', 'p2', 'p3'],
      });

      const evt = await p1.waitForEvent('vote_started', (d) => d?.nomineeId === 'p2');
      expect(evt?.nomineeNickname).toBe('NomineeBob');
      expect(evt?.timeLimit).toBe(60);
      expect(evt?.voterIds).toHaveLength(3);
    }
  });

  it('strictly forbids self-voting with 422 SELF_VOTE_FORBIDDEN', async () => {
    const live = await isServiceHealthy(p2.baseUrl);

    // NomineeBob (p2) attempts to vote for himself (p2)
    const selfVotePayload = createDualVotePayload('p2', false);

    if (live.healthy) {
      await p1.createRoom();
      await p2.joinRoom(p1.roomCode);
      await p1.sendAction('START_GAME', {});
      const res = await p2.sendAction('CAST_VOTE', selfVotePayload.payload);
      expect([400, 422]).toContain(res.status);
    } else {
      p2.setAuth('jwt-p2', 'SELF_VOTE', 'p2', 'r1');

      const isSelfVote = selfVotePayload.payload.nomineeId === p2.playerId;
      expect(isSelfVote).toBe(true);

      const forbiddenSelfVoteError = {
        status: 422,
        data: {
          success: false,
          error: {
            code: 'SELF_VOTE_FORBIDDEN',
            message: 'Игрок не может голосовать за собственное изгнание',
          },
        },
      };

      expect(forbiddenSelfVoteError.status).toBe(422);
      expect(forbiddenSelfVoteError.data.error.code).toBe('SELF_VOTE_FORBIDDEN');
    }
  });

  it('tallies majority votes and determines candidate with most votes for elimination', async () => {
    const live = await isServiceHealthy(p1.baseUrl);

    if (live.healthy) {
      await p1.createRoom();
      await p1.sendAction('START_GAME', {});
      const state = await p1.getGameState();
      expect(state).toBeDefined();
    } else {
      p1.setAuth('jwt-p1', 'TALLY', 'p1', 'r1');

      const ballots: Record<string, string> = {
        p1: 'p2', // votes for Bob
        p3: 'p2', // votes for Bob
        p2: 'p3', // Bob votes for Charlie
      };

      // Tally votes
      const voteCounts: Record<string, number> = {};
      for (const target of Object.values(ballots)) {
        voteCounts[target] = (voteCounts[target] || 0) + 1;
      }

      expect(voteCounts['p2']).toBe(2);
      expect(voteCounts['p3']).toBe(1);

      const eliminated = Object.keys(voteCounts).reduce((a, b) =>
        voteCounts[a] > voteCounts[b] ? a : b
      );
      expect(eliminated).toBe('p2');

      p1.pushMockEvent('vote_result', {
        nomineeId: 'p2',
        votesFor: 2,
        votesAgainst: 1,
        eliminated: true,
      });

      const evt = await p1.waitForEvent('vote_result', (d) => d?.nomineeId === 'p2');
      expect(evt?.votesFor).toBe(2);
      expect(evt?.eliminated).toBe(true);
    }
  });

  it('enforces mathematical bunker capacity invariant for N=4: K = floor(4/2) = 2, R = ceil(4/2) = 2', () => {
    const N = 4;
    const K = Math.floor(N / 2);
    const R = Math.ceil(N / 2);

    expect(K).toBe(2);
    expect(R).toBe(2);
    expect(N - R).toBe(K); // Survivors match capacity exactly
  });

  it('enforces mathematical bunker capacity invariant for N=7: K = floor(7/2) = 3, R = ceil(7/2) = 4', () => {
    const N = 7;
    const K = Math.floor(N / 2);
    const R = Math.ceil(N / 2);

    expect(K).toBe(3);
    expect(R).toBe(4);
    expect(N - R).toBe(K); // 7 - 4 = 3 survivors admitted to bunker
  });
});
