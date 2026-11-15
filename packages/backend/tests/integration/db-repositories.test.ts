import { describe, it, expect, beforeEach } from 'vitest';
import { createRepositories, Repositories } from '../../src/db/index.js';

describe('Integration: MongoDB Repositories Storage Layer', () => {
  let repos: Repositories;

  beforeEach(() => {
    repos = createRepositories(); // uses resilient in-memory storage for unit/offline tests
  });

  it('RoomRepository creates room with unique code and default settings', async () => {
    const room = await repos.rooms.create({ hostId: 'host_1' });
    expect(room.roomId).toBeTruthy();
    expect(room.code).toMatch(/^[A-Z0-9]{5}$/);
    expect(room.status).toBe('lobby');

    const found = await repos.rooms.findByCode(room.code);
    expect(found?.roomId).toBe(room.roomId);

    const updated = await repos.rooms.updateSettings(room.roomId, { enableSuperpowers: true });
    expect(updated?.settings.enableSuperpowers).toBe(true);

    const deleted = await repos.rooms.deleteByCode(room.code);
    expect(deleted).toBe(true);
    expect(await repos.rooms.findByCode(room.code)).toBeNull();
  });

  it('PlayerRepository creates player and prevents duplicate nicknames in room', async () => {
    const room = await repos.rooms.create({ hostId: 'h1' });

    const p1 = await repos.players.create({
      roomId: room.roomId,
      nickname: 'Doctor',
      token: 'tok_doc',
      isHost: true,
    });
    expect(p1.playerId).toBeTruthy();
    expect(p1.nickname).toBe('Doctor');

    // Duplicate nickname attempt must reject
    await expect(
      repos.players.create({
        roomId: room.roomId,
        nickname: 'Doctor',
        token: 'tok_doc_2',
      })
    ).rejects.toThrow();

    // Querying by token
    const byToken = await repos.players.findByToken('tok_doc');
    expect(byToken?.playerId).toBe(p1.playerId);

    // Reroll decrement
    const afterReroll = await repos.players.updateRerolls(p1.playerId, -1);
    expect(afterReroll?.remainingRerolls).toBe(0);
  });

  it('GameRepository stores and updates single authoritative state per room', async () => {
    const room = await repos.rooms.create({ hostId: 'h1' });

    const state = await repos.games.create({
      roomId: room.roomId,
      phase: 'phase1',
    });
    expect(state.phase).toBe('phase1');

    const updated = await repos.games.update(room.roomId, {
      phase: 'phase2',
      phase2: {
        currentDay: 1,
        resources: { food: 100, water: 100, air: 100, medicine: 100, power: 100, morale: 100 },
        roomAssignments: {},
        activeThreats: [],
        activeDefects: [],
        craftQueue: [],
      },
    });
    expect(updated?.phase).toBe('phase2');
    expect(updated?.phase2?.resources.food).toBe(100);
  });

  it('CardRepository accesses master catalog of 528 genuine cards and craft recipes', async () => {
    const { cards, total } = await repos.cards.findAll({ limit: 5 });
    expect(cards).toHaveLength(5);
    expect(total).toBeGreaterThan(500);

    const professions = await repos.cards.getProfessions();
    expect(professions.length).toBeGreaterThanOrEqual(45);

    const recipes = await repos.cards.getCraftRecipes();
    expect(recipes).toHaveLength(20);

    const surgeon = await repos.cards.findById('prof_surgeon');
    expect(surgeon).toBeDefined();
    expect(surgeon?.name).toBe('Хирург');
  });

  it('EventRepository persists room incident history and generates day logs', async () => {
    await repos.events.create({
      roomId: 'r_evt',
      day: 1,
      type: 'FIRE_ALARM',
      name: 'Пожарная тревога',
    });

    const day1Log = await repos.events.getDayLogs('r_evt', 1);
    expect(day1Log.day).toBe(1);
    expect(day1Log.events).toHaveLength(1);
    expect(day1Log.events[0].name).toBe('Пожарная тревога');
  });

  it('FailedTaskRepository stores dead-letter poison tasks', async () => {
    const failed = await repos.failedTasks.create({
      task: {
        taskId: 'dead_1',
        type: 'PHASE2_DAY_TICK',
        roomId: 'r_fail',
        queuedAt: Date.now(),
      },
      error: 'Unrecoverable I/O failure',
    });

    expect(failed.taskId).toBe('dead_1');
    expect(failed.lastError).toBe('Unrecoverable I/O failure');

    const found = await repos.failedTasks.findById('dead_1');
    expect(found?.taskId).toBe('dead_1');
  });

  it('ScenarioRepository provides official and custom crisis scenarios', async () => {
    const scenarios = await repos.scenarios.findAll();
    expect(scenarios.length).toBeGreaterThanOrEqual(2);

    const nuclearWinter = await repos.scenarios.findById('scenario_nuclear_winter');
    expect(nuclearWinter?.title).toBe('Ядерная зима');
    expect(nuclearWinter?.timeline).toBeDefined();
  });
});
