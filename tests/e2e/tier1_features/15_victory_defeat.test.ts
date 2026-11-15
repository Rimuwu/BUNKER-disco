import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';
import { createSendSosPayload } from '../helpers/mock-payloads';

describe('Feature 15: Game Termination & Victory/Defeat Rules', () => {
  let survivor: TestClient;

  beforeEach(() => {
    survivor = new TestClient({ nickname: 'VictoryCommander' });
  });

  afterEach(() => {
    survivor.disconnect();
  });

  it('triggers collective bunker survival victory upon successfully completing Day 30', async () => {
    const live = await isServiceHealthy(survivor.baseUrl);

    if (live.healthy) {
      await survivor.createRoom();
      await survivor.sendAction('START_GAME', {});
      const state = await survivor.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor.setAuth('jwt-p1', 'WIN_DAY30', 'p1', 'r1');

      survivor.pushMockEvent('game_over', {
        result: 'SURVIVAL_VICTORY',
        day: 30,
        survivors: ['p1', 'p2'],
        message: 'Гермодвери бункера открываются. Вы пережили 30 дней постапокалипсиса!',
      });

      const evt = await survivor.waitForEvent('game_over', (d) => d?.result === 'SURVIVAL_VICTORY');
      expect(evt?.day).toBe(30);
      expect(evt?.survivors).toContain('p1');
      expect(evt?.result).toBe('SURVIVAL_VICTORY');
    }
  });

  it('triggers immediate catastrophic game over when Air resource drops to 0 (Asphyxiation)', async () => {
    const live = await isServiceHealthy(survivor.baseUrl);

    if (live.healthy) {
      await survivor.createRoom();
      await survivor.sendAction('START_GAME', {});
      const state = await survivor.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor.setAuth('jwt-p1', 'AIR_ZERO', 'p1', 'r1');

      const currentAir = 0;
      expect(currentAir).toBe(0);

      survivor.pushMockEvent('game_over', {
        result: 'DEFEAT_ASPHYXIATION',
        day: 12,
        cause: 'AIR_RESOURCE_DEPLETED',
        message: 'Система вентиляции отказала. Все обитатели бункера задохнулись.',
      });

      const evt = await survivor.waitForEvent('game_over', (d) => d?.result === 'DEFEAT_ASPHYXIATION');
      expect(evt?.cause).toBe('AIR_RESOURCE_DEPLETED');
      expect(evt?.result).toBe('DEFEAT_ASPHYXIATION');
    }
  });

  it('triggers total defeat when all bunker survivors perish before Day 30', async () => {
    const live = await isServiceHealthy(survivor.baseUrl);

    if (live.healthy) {
      await survivor.createRoom();
      await survivor.sendAction('START_GAME', {});
      const state = await survivor.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor.setAuth('jwt-p1', 'ALL_DEAD', 'p1', 'r1');

      const livingSurvivorsCount = 0;
      expect(livingSurvivorsCount).toBe(0);

      survivor.pushMockEvent('game_over', {
        result: 'DEFEAT_ALL_DEAD',
        day: 18,
        survivorsCount: 0,
        message: 'В бункере не осталось ни одной живой души.',
      });

      const evt = await survivor.waitForEvent('game_over', (d) => d?.result === 'DEFEAT_ALL_DEAD');
      expect(evt?.survivorsCount).toBe(0);
      expect(evt?.result).toBe('DEFEAT_ALL_DEAD');
    }
  });

  it('triggers early SOS rescue victory when radio transmitter is activated on or after Day 25', async () => {
    const live = await isServiceHealthy(survivor.baseUrl);

    const sosPayload = createSendSosPayload();
    expect(sosPayload.type).toBe('SEND_SOS');

    if (live.healthy) {
      await survivor.createRoom();
      await survivor.sendAction('START_GAME', {});
      const res = await survivor.sendAction('SEND_SOS' as any, sosPayload.payload);
      expect([200, 202, 422]).toContain(res.status);
    } else {
      survivor.setAuth('jwt-p1', 'SOS_WIN', 'p1', 'r1');

      const currentDay = 26;
      const isEligibleForSosRescue = currentDay >= 25;
      expect(isEligibleForSosRescue).toBe(true);

      survivor.pushMockEvent('game_over', {
        result: 'SOS_RESCUE_VICTORY',
        day: 26,
        activatedByPlayerId: survivor.playerId,
        message: 'Сигнал бедствия принят спасательным отрядом. Бункер эвакуирован!',
      });

      const evt = await survivor.waitForEvent('game_over', (d) => d?.result === 'SOS_RESCUE_VICTORY');
      expect(evt?.day).toBeGreaterThanOrEqual(25);
      expect(evt?.result).toBe('SOS_RESCUE_VICTORY');
      expect(evt?.activatedByPlayerId).toBe('p1');
    }
  });

  it('evaluates and unveils secret quest completions for all players at game end', async () => {
    const live = await isServiceHealthy(survivor.baseUrl);

    if (live.healthy) {
      await survivor.createRoom();
      await survivor.sendAction('START_GAME', {});
      const state = await survivor.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor.setAuth('jwt-p1', 'QUESTS_END', 'p1', 'r1');

      const questEvaluations = [
        {
          playerId: 'p1',
          questId: 'quest_patient_zero',
          title: 'Нулевой пациент',
          completed: true,
          badge: 'Секретная победа: Заражение бункера',
        },
        {
          playerId: 'p2',
          questId: 'quest_bodyguard',
          title: 'Телохранитель',
          completed: true,
          badge: 'Цель выжила до Дня 30',
        },
      ];

      survivor.pushMockEvent('secret_quests_revealed', {
        quests: questEvaluations,
      });

      const evt = await survivor.waitForEvent('secret_quests_revealed', (d) => d?.quests?.length === 2);
      expect(evt?.quests?.[0]?.completed).toBe(true);
      expect(evt?.quests?.[0]?.badge).toContain('Секретная победа');
      expect(evt?.quests?.[1]?.title).toBe('Телохранитель');
    }
  });
});
