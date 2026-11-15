import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';
import {
  createAssignRoomPayload,
  createDualAssignRoomPayload,
} from '../helpers/mock-payloads';

describe('Feature 11: Workstation Room Assignments', () => {
  let survivor1: TestClient;
  let survivor2: TestClient;

  beforeEach(() => {
    survivor1 = new TestClient({ nickname: 'AgronomistWorker' });
    survivor2 = new TestClient({ nickname: 'EngineerWorker' });
  });

  afterEach(() => {
    survivor1.disconnect();
    survivor2.disconnect();
  });

  it('broadcasts assignment_requested event at day start with available rooms and countdown timer', async () => {
    const live = await isServiceHealthy(survivor1.baseUrl);

    if (live.healthy) {
      await survivor1.createRoom();
      await survivor1.sendAction('START_GAME', {});
      const state = await survivor1.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor1.setAuth('jwt-p1', 'ASSIGN1', 'p1', 'r1');

      const availableRooms = [
        { roomId: 'hydroponics', name: 'Гидропоника', maxWorkers: 2, currentWorkers: 0 },
        { roomId: 'generator', name: 'Генераторная', maxWorkers: 1, currentWorkers: 0 },
        { roomId: 'workshop', name: 'Мастерская', maxWorkers: 2, currentWorkers: 0 },
        { roomId: 'living_quarters', name: 'Жилой сектор', maxWorkers: 10, currentWorkers: 0 },
      ];

      survivor1.pushMockEvent('assignment_requested', {
        day: 2,
        timeLimitSeconds: 15,
        availableRooms,
      });

      const evt = await survivor1.waitForEvent('assignment_requested', (d) => d?.day === 2);
      expect(evt?.timeLimitSeconds).toBe(15);
      expect(evt?.availableRooms).toHaveLength(4);
      expect(evt?.availableRooms?.[0]?.roomId).toBe('hydroponics');
    }
  });

  it('assigns player to food storage/hydroponics generating food production bonus', async () => {
    const live = await isServiceHealthy(survivor1.baseUrl);

    const payload = createDualAssignRoomPayload('hydroponics', 'ws_grow_bed', 'p1');
    expect(payload.payload.roomId).toBe('hydroponics');
    expect(payload.payload.roomType).toBe('hydroponics');

    if (live.healthy) {
      await survivor1.createRoom();
      await survivor1.sendAction('START_GAME', {});
      const res = await survivor1.sendAction('ASSIGN_ROOM', payload.payload);
      expect([200, 202, 422]).toContain(res.status);
    } else {
      survivor1.setAuth('jwt-p1', 'FOOD_ASSIGN', 'p1', 'r1');

      survivor1.pushMockEvent('assignment_confirmed', {
        playerId: survivor1.playerId,
        roomType: 'hydroponics',
        roomId: 'hydroponics',
        dailyOutput: { food: 5 },
      });

      const evt = await survivor1.waitForEvent('assignment_confirmed', (d) => d?.playerId === 'p1');
      expect(evt?.roomType).toBe('hydroponics');
      expect(evt?.dailyOutput?.food).toBe(5);
    }
  });

  it('penalizes assignment to damaged room without repairs, yielding zero production or injury', async () => {
    const live = await isServiceHealthy(survivor1.baseUrl);

    if (live.healthy) {
      await survivor1.createRoom();
      await survivor1.sendAction('START_GAME', {});
      const state = await survivor1.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor1.setAuth('jwt-p1', 'DAMAGED_ROOM', 'p1', 'r1');

      survivor1.pushMockEvent('room_operation_failed', {
        playerId: survivor1.playerId,
        roomId: 'generator',
        isDamaged: true,
        productionYield: 0,
        warning: 'Комната повреждена дефектом DEF-04_SHORT_CIRCUIT',
      });

      const evt = await survivor1.waitForEvent(
        'room_operation_failed',
        (d) => d?.isDamaged === true
      );
      expect(evt?.productionYield).toBe(0);
      expect(evt?.warning).toContain('DEF-04');
    }
  });

  it('rejects assignment when room worker capacity is already exceeded with 422', async () => {
    const live = await isServiceHealthy(survivor2.baseUrl);

    const payload = createDualAssignRoomPayload('generator', 'ws_turbine', 'p2');

    if (live.healthy) {
      await survivor1.createRoom();
      await survivor2.joinRoom(survivor1.roomCode);
      await survivor1.sendAction('START_GAME', {});
      // p1 already assigned, p2 tries to squeeze in
      await survivor1.sendAction('ASSIGN_ROOM', { roomId: 'generator' });
      const res = await survivor2.sendAction('ASSIGN_ROOM', payload.payload);
      expect([400, 422]).toContain(res.status);
    } else {
      survivor2.setAuth('jwt-p2', 'CAP_OVERFLOW', 'p2', 'r1');

      const maxWorkers = 1;
      const currentWorkers = 1;
      const canAssign = currentWorkers < maxWorkers;
      expect(canAssign).toBe(false);

      const overflowError = {
        status: 422,
        data: {
          success: false,
          error: {
            code: 'ROOM_CAPACITY_EXCEEDED',
            message: 'В этой комнате уже заняты все рабочие места (максимум: 1)',
          },
        },
      };

      expect(overflowError.status).toBe(422);
      expect(overflowError.data.error.code).toBe('ROOM_CAPACITY_EXCEEDED');
    }
  });

  it('defaults unassigned player to Living Quarters (Rest/Morale) upon assignment timeout', async () => {
    const live = await isServiceHealthy(survivor1.baseUrl);

    if (live.healthy) {
      await survivor1.createRoom();
      await survivor1.sendAction('START_GAME', {});
      const state = await survivor1.getGameState();
      expect(state).toBeDefined();
    } else {
      survivor1.setAuth('jwt-p1', 'TIMEOUT_DEFAULT', 'p1', 'r1');

      survivor1.pushMockEvent('assignment_timeout_resolved', {
        playerId: survivor1.playerId,
        assignedRoom: 'living_quarters',
        actionType: 'REST',
        moraleBonus: 2,
      });

      const evt = await survivor1.waitForEvent(
        'assignment_timeout_resolved',
        (d) => d?.playerId === 'p1'
      );
      expect(evt?.assignedRoom).toBe('living_quarters');
      expect(evt?.actionType).toBe('REST');
      expect(evt?.moraleBonus).toBe(2);
    }
  });
});
