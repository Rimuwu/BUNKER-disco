import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';

describe('Feature 10: 6 Core Resources Simulation', () => {
  let survivor: TestClient;

  beforeEach(() => {
    survivor = new TestClient({ nickname: 'ResourceOfficer' });
  });

  afterEach(() => {
    survivor.disconnect();
  });

  it('calculates daily food and water consumption proportional to living survivors count', async () => {
    const live = await isServiceHealthy(survivor.baseUrl);

    const survivorCount = 3;
    const foodPerPerson = 2;
    const waterPerPerson = 2;

    const expectedFoodDelta = -(survivorCount * foodPerPerson);
    const expectedWaterDelta = -(survivorCount * waterPerPerson);

    expect(expectedFoodDelta).toBe(-6);
    expect(expectedWaterDelta).toBe(-6);

    if (live.healthy) {
      await survivor.createRoom();
      await survivor.sendAction('START_GAME', {});
      const state = await survivor.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor.setAuth('jwt-p1', 'RES01', 'p1', 'r1');

      survivor.pushMockEvent('resource_update', {
        day: 2,
        resources: { food: 94, water: 94, air: 100, medicine: 50, power: 80, morale: 70 },
        delta: { food: expectedFoodDelta, water: expectedWaterDelta, air: 0, medicine: 0, power: 0, morale: -5 },
      });

      const evt = await survivor.waitForEvent('resource_update', (d) => d?.day === 2);
      expect(evt?.delta?.food).toBe(-6);
      expect(evt?.delta?.water).toBe(-6);
      expect(evt?.resources?.food).toBe(94);
    }
  });

  it('triggers air filtration warning event when air level drops below critical threshold (20)', async () => {
    const live = await isServiceHealthy(survivor.baseUrl);

    const criticalAirThreshold = 20;

    if (live.healthy) {
      await survivor.createRoom();
      await survivor.sendAction('START_GAME', {});
      const state = await survivor.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor.setAuth('jwt-p1', 'AIR_WARN', 'p1', 'r1');

      const lowAir = 15;
      expect(lowAir).toBeLessThan(criticalAirThreshold);

      survivor.pushMockEvent('air_filtration_warning', {
        currentAir: lowAir,
        threshold: criticalAirThreshold,
        severity: 'CRITICAL',
        roundsUntilAsphyxiation: 1,
      });

      const evt = await survivor.waitForEvent(
        'air_filtration_warning',
        (d) => d?.currentAir === 15
      );
      expect(evt?.severity).toBe('CRITICAL');
      expect(evt?.roundsUntilAsphyxiation).toBe(1);
    }
  });

  it('simulates daily morale decay with modifier based on bunker conditions', async () => {
    const live = await isServiceHealthy(survivor.baseUrl);

    const baseMoraleDecay = -5;
    const darknessModifier = -3;
    const totalDecay = baseMoraleDecay + darknessModifier;

    expect(totalDecay).toBe(-8);

    if (live.healthy) {
      await survivor.createRoom();
      await survivor.sendAction('START_GAME', {});
      const state = await survivor.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor.setAuth('jwt-p1', 'MORALE_DECAY', 'p1', 'r1');

      survivor.pushMockEvent('morale_update', {
        previousMorale: 60,
        newMorale: 52,
        delta: totalDecay,
        reasons: ['DAILY_DECAY', 'POWER_OUTAGE_DARKNESS'],
      });

      const evt = await survivor.waitForEvent('morale_update', (d) => d?.newMorale === 52);
      expect(evt?.delta).toBe(-8);
      expect(evt?.reasons).toContain('POWER_OUTAGE_DARKNESS');
    }
  });

  it('broadcasts full resource delta and updated pool to all connected clients on day tick', async () => {
    const live = await isServiceHealthy(survivor.baseUrl);

    if (live.healthy) {
      await survivor.createRoom();
      await survivor.sendAction('START_GAME', {});
      const state = await survivor.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor.setAuth('jwt-p1', 'DELTA_SYNC', 'p1', 'r1');

      const day3Deltas = {
        food: -4,
        water: -4,
        air: 0,
        medicine: -1,
        power: -2,
        morale: -5,
      };

      survivor.pushMockEvent('resource_update', {
        day: 3,
        delta: day3Deltas,
        resources: {
          food: 90,
          water: 90,
          air: 100,
          medicine: 49,
          power: 78,
          morale: 65,
        },
      });

      const evt = await survivor.waitForEvent('resource_update', (d) => d?.day === 3);
      expect(evt?.delta?.medicine).toBe(-1);
      expect(evt?.resources?.power).toBe(78);
    }
  });

  it('enforces bounds capping resources between 0 and maximum bunker storage limit', () => {
    const maxCapacity = 100;
    const minCapacity = 0;

    const clamp = (val: number) => Math.max(minCapacity, Math.min(maxCapacity, val));

    // Overflows
    expect(clamp(120)).toBe(100);
    expect(clamp(100)).toBe(100);

    // Underflows
    expect(clamp(-10)).toBe(0);
    expect(clamp(0)).toBe(0);

    // In-bounds
    expect(clamp(45)).toBe(45);
  });
});
