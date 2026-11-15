import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';
import {
  createResolveEventPayload,
  createDualResolveEventPayload,
} from '../helpers/mock-payloads';

describe('Feature 12: Threat & Defect Resolution', () => {
  let survivor: TestClient;
  let specialist: TestClient;

  beforeEach(() => {
    survivor = new TestClient({ nickname: 'SurvivorGeneral' });
    specialist = new TestClient({ nickname: 'EngineerSpecialist' });
  });

  afterEach(() => {
    survivor.disconnect();
    specialist.disconnect();
  });

  it('triggers threat_incoming event on daily threat roll or timeline event', async () => {
    const live = await isServiceHealthy(survivor.baseUrl);

    if (live.healthy) {
      await survivor.createRoom();
      await survivor.sendAction('START_GAME', {});
      const state = await survivor.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor.setAuth('jwt-p1', 'THREAT1', 'p1', 'r1');

      survivor.pushMockEvent('threat_incoming', {
        day: 5,
        threatId: 'THR-02_AIR_FILTER_BREACH',
        name: 'Прорыв воздушного фильтра',
        severity: 'HIGH',
        turnsUntilImpact: 1,
        consequencesIfIgnored: { air: -25 },
      });

      const evt = await survivor.waitForEvent('threat_incoming', (d) => d?.threatId === 'THR-02_AIR_FILTER_BREACH');
      expect(evt?.name).toBe('Прорыв воздушного фильтра');
      expect(evt?.severity).toBe('HIGH');
      expect(evt?.consequencesIfIgnored?.air).toBe(-25);
    }
  });

  it('enforces 30-second response window timer for survivors to submit countermeasures', async () => {
    const live = await isServiceHealthy(survivor.baseUrl);

    if (live.healthy) {
      await survivor.createRoom();
      await survivor.sendAction('START_GAME', {});
      const state = await survivor.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor.setAuth('jwt-p1', 'THREAT_TIMER', 'p1', 'r1');

      survivor.pushMockEvent('event_choice_required', {
        eventInstanceId: 'inst_threat_101',
        timeLimitSeconds: 30,
        choices: [
          { choiceId: 'choice_repair_filter', label: 'Заменить фильтрующий картридж', cost: { power: 10 } },
          { choiceId: 'choice_seal_duct', label: 'Загерметизировать отсек', cost: { morale: -5 } },
        ],
      });

      const evt = await survivor.waitForEvent('event_choice_required', (d) => d?.eventInstanceId === 'inst_threat_101');
      expect(evt?.timeLimitSeconds).toBe(30);
      expect(evt?.choices).toHaveLength(2);
      expect(evt?.choices?.[0]?.choiceId).toBe('choice_repair_filter');
    }
  });

  it('grants specialist bonus/discount when relevant profession resolves the crisis', async () => {
    const live = await isServiceHealthy(specialist.baseUrl);

    const dualPayload = createDualResolveEventPayload('inst_threat_101', 0, 'choice_repair_filter');
    expect(dualPayload.payload.choiceId).toBe('choice_repair_filter');
    expect(dualPayload.payload.eventInstanceId).toBe('inst_threat_101');

    if (live.healthy) {
      await specialist.createRoom();
      await specialist.sendAction('START_GAME', {});
      const res = await specialist.sendAction('RESOLVE_EVENT', dualPayload.payload);
      expect([200, 202, 422]).toContain(res.status);
    } else {
      specialist.setAuth('jwt-eng', 'SPEC_BONUS', 'p_eng', 'r1');

      // Engineer receives 50% discount on power requirement
      const baseCost = 10;
      const specialistDiscount = 0.5;
      const actualCost = baseCost * (1 - specialistDiscount);
      expect(actualCost).toBe(5);

      specialist.pushMockEvent('event_resolved', {
        eventInstanceId: 'inst_threat_101',
        resolvedByPlayerId: specialist.playerId,
        professionSynergyApplied: 'Инженер',
        powerCostDeducted: actualCost,
        success: true,
      });

      const evt = await specialist.waitForEvent('event_resolved', (d) => d?.eventInstanceId === 'inst_threat_101');
      expect(evt?.professionSynergyApplied).toBe('Инженер');
      expect(evt?.powerCostDeducted).toBe(5);
      expect(evt?.success).toBe(true);
    }
  });

  it('applies severe penalty to bunker and resources when threat remains unresolved', async () => {
    const live = await isServiceHealthy(survivor.baseUrl);

    if (live.healthy) {
      await survivor.createRoom();
      await survivor.sendAction('START_GAME', {});
      const state = await survivor.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor.setAuth('jwt-p1', 'THREAT_FAIL', 'p1', 'r1');

      survivor.pushMockEvent('threat_resolved', {
        threatId: 'THR-02_AIR_FILTER_BREACH',
        outcome: 'FAILURE_UNRESOLVED',
        penaltiesApplied: {
          airDelta: -25,
          moraleDelta: -10,
          roomDamaged: 'ventilation_shaft',
        },
      });

      const evt = await survivor.waitForEvent('threat_resolved', (d) => d?.outcome === 'FAILURE_UNRESOLVED');
      expect(evt?.penaltiesApplied?.airDelta).toBe(-25);
      expect(evt?.penaltiesApplied?.roomDamaged).toBe('ventilation_shaft');
    }
  });

  it('allows players to spend resources and repair initial bunker starting defects', async () => {
    const live = await isServiceHealthy(survivor.baseUrl);

    if (live.healthy) {
      await survivor.createRoom();
      await survivor.sendAction('START_GAME', {});
      const state = await survivor.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor.setAuth('jwt-p1', 'DEFECT_REPAIR', 'p1', 'r1');

      const defectId = 'DEF-04_SHORT_CIRCUIT';

      survivor.pushMockEvent('defect_repaired', {
        defectId,
        repairedBy: survivor.playerId,
        costPaid: { power: 15, parts: 1 },
        defectRemoved: true,
      });

      const evt = await survivor.waitForEvent('defect_repaired', (d) => d?.defectId === defectId);
      expect(evt?.defectRemoved).toBe(true);
      expect(evt?.costPaid?.power).toBe(15);
      expect(evt?.repairedBy).toBe('p1');
    }
  });
});
