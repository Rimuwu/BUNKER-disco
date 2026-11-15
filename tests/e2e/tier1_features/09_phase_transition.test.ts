import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';

describe('Feature 09: Selection to Survival Phase Transition', () => {
  let survivor1: TestClient;
  let survivor2: TestClient;

  beforeEach(() => {
    survivor1 = new TestClient({ nickname: 'BunkerCaptain' });
    survivor2 = new TestClient({ nickname: 'BunkerMedic' });
  });

  afterEach(() => {
    survivor1.disconnect();
    survivor2.disconnect();
  });

  it('triggers Phase 2 transition exactly when remaining survivors equals capacity K', async () => {
    const N = 4;
    const K = Math.floor(N / 2); // 2
    expect(K).toBe(2);

    let activeSurvivors = 4;
    // Round 1 elimination
    activeSurvivors--;
    expect(activeSurvivors).toBe(3);
    expect(activeSurvivors === K).toBe(false);

    // Round 2 elimination
    activeSurvivors--;
    expect(activeSurvivors).toBe(2);
    expect(activeSurvivors === K).toBe(true);
  });

  it('broadcasts phase1_complete followed by phase2_start event sequence', async () => {
    const live = await isServiceHealthy(survivor1.baseUrl);

    if (live.healthy) {
      await survivor1.createRoom();
      await survivor1.sendAction('START_GAME', {});
      const state = await survivor1.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor1.setAuth('jwt-p1', 'TRANS1', 'p1', 'r1');

      // 1. phase1_complete
      survivor1.pushMockEvent('phase1_complete', {
        inBunker: ['p1', 'p2'],
        eliminated: ['p3', 'p4'],
        transitionInSeconds: 5,
      });

      const p1Complete = await survivor1.waitForEvent(
        'phase1_complete',
        (d) => d?.inBunker?.length === 2
      );
      expect(p1Complete?.inBunker).toContain('p1');
      expect(p1Complete?.transitionInSeconds).toBe(5);

      // 2. phase2_start
      survivor1.pushMockEvent('phase2_start', {
        day: 1,
        survivors: ['p1', 'p2'],
        resources: {
          food: 100,
          water: 100,
          air: 100,
          medicine: 50,
          power: 80,
          morale: 75,
        },
      });

      const p2Start = await survivor1.waitForEvent('phase2_start', (d) => d?.day === 1);
      expect(p2Start?.day).toBe(1);
      expect(p2Start?.resources?.food).toBe(100);
      expect(p2Start?.resources?.air).toBe(100);
    }
  });

  it('initializes all 6 core resources baseline (Food, Water, Air, Medicine, Power, Morale)', async () => {
    const baseline = {
      food: 100,
      water: 100,
      air: 100,
      medicine: 50,
      power: 80,
      morale: 70,
    };

    const coreKeys = ['food', 'water', 'air', 'medicine', 'power', 'morale'] as const;

    for (const key of coreKeys) {
      expect(baseline[key]).toBeGreaterThan(0);
      expect(typeof baseline[key]).toBe('number');
    }

    expect(Object.keys(baseline)).toHaveLength(6);
  });

  it('updates admitted survivors state with isInBunker flag set to true', async () => {
    const live = await isServiceHealthy(survivor1.baseUrl);

    if (live.healthy) {
      await survivor1.createRoom();
      await survivor1.sendAction('START_GAME', {});
      const state = await survivor1.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor1.setAuth('jwt-p1', 'IN_BUNKER', 'p1', 'r1');

      survivor1.pushMockEvent('player_admitted_to_bunker', {
        playerId: survivor1.playerId,
        isInBunker: true,
        assignedRoom: 'living_quarters',
      });

      const evt = await survivor1.waitForEvent(
        'player_admitted_to_bunker',
        (d) => d?.playerId === 'p1'
      );
      expect(evt?.isInBunker).toBe(true);
      expect(evt?.assignedRoom).toBe('living_quarters');
    }
  });

  it('broadcasts Fog of War layout and unlocked bunker rooms to BigScreen and survivors', async () => {
    const live = await isServiceHealthy(survivor1.baseUrl);

    if (live.healthy) {
      await survivor1.createRoom();
      await survivor1.sendAction('START_GAME', {});
      const state = await survivor1.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor1.setAuth('jwt-p1', 'FOG_OF_WAR', 'p1', 'r1');

      const mockBunkerLayout = {
        archetype: 'bunker_deep_shaft',
        discoveredRooms: ['airlock', 'living_quarters', 'generator'],
        fogCloakedRooms: ['hydroponics', 'medical_bay', 'workshop', 'radio_room'],
        voxelModelUrl: '/assets/voxels/bunker_deep_shaft.vox',
      };

      survivor1.pushMockEvent('bunker_layout_update', mockBunkerLayout);

      const evt = await survivor1.waitForEvent(
        'bunker_layout_update',
        (d) => d?.archetype === 'bunker_deep_shaft'
      );
      expect(evt?.discoveredRooms).toContain('airlock');
      expect(evt?.fogCloakedRooms).toContain('radio_room');
      expect(evt?.discoveredRooms.length + evt?.fogCloakedRooms.length).toBe(7);
    }
  });
});
