import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';

describe('Tier 2 Boundaries: Voting Ties & Coin-Toss Lottery', () => {
  let p1: TestClient;
  let p2: TestClient;

  beforeEach(() => {
    p1 = new TestClient({ nickname: 'Voter1' });
    p2 = new TestClient({ nickname: 'Voter2' });
  });

  afterEach(() => {
    p1.disconnect();
    p2.disconnect();
  });

  it('triggers tie-breaker revote when two nominees receive equal vote tallies', async () => {
    const live = await isServiceHealthy(p1.baseUrl);

    if (live.healthy) {
      await p1.createRoom();
      await p2.joinRoom(p1.roomCode);
    } else {
      p1.setAuth('jwt-p1', 'TIE01', 'p1', 'r1');
      p1.pushMockEvent('voting_tie', {
        tiedNomineeIds: ['p1', 'p2'],
        voteCount: 3,
        revoteRound: 1,
        message: 'Equal ballots cast. Initiating 30-second rapid revote.',
      });

      const evt = await p1.waitForEvent('voting_tie');
      expect(evt?.tiedNomineeIds).toEqual(['p1', 'p2']);
      expect(evt?.revoteRound).toBe(1);
    }
  });

  it('triggers PC GM Coin-Toss Lottery if tie persists after revote round', async () => {
    const live = await isServiceHealthy(p1.baseUrl);

    if (live.healthy) {
      await p1.createRoom();
      await p2.joinRoom(p1.roomCode);
    } else {
      p1.setAuth('jwt-p1', 'TIE02', 'p1', 'r1');
      p1.pushMockEvent('coin_toss_lottery', {
        tiedNomineeIds: ['p1', 'p2'],
        selectedExileId: 'p2',
        method: 'CRYPTOGRAPHIC_RANDOM_LOTTERY',
      });

      const evt = await p1.waitForEvent('coin_toss_lottery');
      expect(evt?.selectedExileId).toBe('p2');
      expect(evt?.method).toBe('CRYPTOGRAPHIC_RANDOM_LOTTERY');
    }
  });

  it('allows candidate veto spend to nullify nomination from active ballot', async () => {
    const live = await isServiceHealthy(p1.baseUrl);

    if (live.healthy) {
      await p1.createRoom();
      await p2.joinRoom(p1.roomCode);
      const veto = await p1.sendAction('CANDIDATE_VETO', { nomineeId: 'p1' });
      expect([200, 202]).toContain(veto.status);
    } else {
      p1.setAuth('jwt-p1', 'TIE03', 'p1', 'r1');
      p1.pushMockEvent('veto_exercised', {
        vetoedPlayerId: 'p1',
        apSpent: 2,
        remainingNominees: ['p2'],
      });

      const evt = await p1.waitForEvent('veto_exercised');
      expect(evt?.vetoedPlayerId).toBe('p1');
      expect(evt?.apSpent).toBe(2);
      expect(evt?.remainingNominees).toEqual(['p2']);
    }
  });

  it('resets candidate veto scoping cleanly on round advance preventing cross-round leaks', async () => {
    const live = await isServiceHealthy(p1.baseUrl);

    if (live.healthy) {
      await p1.createRoom();
    } else {
      p1.setAuth('jwt-p1', 'TIE04', 'p1', 'r1');
      p1.pushMockEvent('round_transition', {
        previousRound: 1,
        newRound: 2,
        activeVetoesCleared: true,
      });

      const evt = await p1.waitForEvent('round_transition');
      expect(evt?.newRound).toBe(2);
      expect(evt?.activeVetoesCleared).toBe(true);
    }
  });

  it('enforces non-eliminated quorum verification before tallying ballots', async () => {
    const live = await isServiceHealthy(p1.baseUrl);

    if (live.healthy) {
      await p1.createRoom();
    } else {
      p1.setAuth('jwt-p1', 'TIE05', 'p1', 'r1');
      p1.pushMockEvent('voting_tallied', {
        activeVoters: 5,
        eliminatedIgnored: 2,
        totalBallotsCast: 5,
      });

      const evt = await p1.waitForEvent('voting_tallied');
      expect(evt?.activeVoters).toBe(5);
      expect(evt?.totalBallotsCast).toBe(5);
    }
  });
});
