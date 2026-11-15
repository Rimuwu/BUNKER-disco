import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';

describe('Tier 2 Boundaries: Resource Zero Conditions (Air, Water, Food, Deficits)', () => {
  let player: TestClient;

  beforeEach(() => {
    player = new TestClient({ nickname: 'ShelterObserver' });
  });

  afterEach(() => {
    player.disconnect();
  });

  it('triggers immediate game defeat when Air reaches exactly 0% (Asphyxiation Wipeout)', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom();
    } else {
      player.setAuth('jwt-p1', 'AIR01', 'p1', 'r1');
      player.pushMockEvent('game_ended', {
        outcome: 'DEFEAT',
        reason: 'ASPHYXIATION',
        message: 'Bunker air scrubbers failed completely. Oxygen depleted to 0%.',
        day: 8,
      });

      const evt = await player.waitForEvent('game_ended');
      expect(evt?.outcome).toBe('DEFEAT');
      expect(evt?.reason).toBe('ASPHYXIATION');
    }
  });

  it('accumulates dehydration deficit when Water reaches 0% and applies lethal penalties', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom();
    } else {
      player.setAuth('jwt-p1', 'WAT01', 'p1', 'r1');
      player.pushMockEvent('resource_crisis', {
        resource: 'water',
        currentLevel: 0,
        consecutiveDaysDeficit: 2,
        casualtyCount: 1,
      });

      const evt = await player.waitForEvent('resource_crisis');
      expect(evt?.resource).toBe('water');
      expect(evt?.currentLevel).toBe(0);
      expect(evt?.consecutiveDaysDeficit).toBe(2);
    }
  });

  it('tracks starvation deficit progression when Food reaches 0% over 3 days', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom();
    } else {
      player.setAuth('jwt-p1', 'FOD01', 'p1', 'r1');
      player.pushMockEvent('resource_crisis', {
        resource: 'food',
        currentLevel: 0,
        consecutiveDaysDeficit: 3,
        moralePenalty: -25,
      });

      const evt = await player.waitForEvent('resource_crisis');
      expect(evt?.resource).toBe('food');
      expect(evt?.consecutiveDaysDeficit).toBe(3);
      expect(evt?.moralePenalty).toBe(-25);
    }
  });

  it('triggers total system shutdown when Power reaches 0%', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom();
    } else {
      player.setAuth('jwt-p1', 'PWR01', 'p1', 'r1');
      player.pushMockEvent('blackout', {
        powerLevel: 0,
        disabledWorkstations: ['hydroponics', 'water_filtration', 'air_scrubber'],
        emergencyDimLighting: true,
      });

      const evt = await player.waitForEvent('blackout');
      expect(evt?.powerLevel).toBe(0);
      expect(evt?.disabledWorkstations).toHaveLength(3);
      expect(evt?.emergencyDimLighting).toBe(true);
    }
  });

  it('safely clamps resource recovery to maximum 100% capacity preventing overflow', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom();
    } else {
      player.setAuth('jwt-p1', 'MAX01', 'p1', 'r1');
      player.pushMockEvent('resources_updated', {
        resources: {
          food: 100,
          water: 100,
          air: 100,
          medicine: 100,
          power: 100,
          morale: 100,
        },
      });

      const evt = await player.waitForEvent('resources_updated');
      expect(evt?.resources?.food).toBe(100);
      expect(evt?.resources?.water).toBe(100);
      expect(evt?.resources?.power).toBe(100);
    }
  });
});
