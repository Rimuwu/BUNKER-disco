import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestApp } from '../helpers/test-app.js';
import { BunkerServerInstance } from '../../src/api/server.js';

describe('Integration: Game State REST Endpoints', () => {
  let app: BunkerServerInstance;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /game/:roomId/state returns public game state', async () => {
    const room = await app.repositories.rooms.create({ hostId: 'h1', customCode: 'GAME1' });
    await app.repositories.players.create({
      roomId: room.roomId,
      nickname: 'PlayerOne',
      token: 'tok1',
      isHost: true,
      customPlayerId: 'h1',
    });

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/game/${room.roomId}/state`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const data = body.data || body;
    expect(data.roomId).toBe(room.roomId);
    expect(data.phase).toBe('lobby');
    expect(data.players).toHaveLength(1);
  });

  it('GET /game/:roomId/phase1 and phase2 return phase data', async () => {
    const room = await app.repositories.rooms.create({ hostId: 'h2', customCode: 'GAME2' });
    await app.repositories.games.update(room.roomId, {
      phase: 'phase2',
      phase2: {
        currentDay: 5,
        resources: { food: 90, water: 85, air: 100, medicine: 80, power: 95, morale: 70 },
        roomAssignments: {},
        activeThreats: ['threat_fire'],
        activeDefects: [],
        craftQueue: [],
      },
    });

    const p1Res = await app.inject({
      method: 'GET',
      url: `/api/v1/game/${room.roomId}/phase1`,
    });
    expect(p1Res.statusCode).toBe(200);

    const p2Res = await app.inject({
      method: 'GET',
      url: `/api/v1/game/${room.roomId}/phase2`,
    });
    expect(p2Res.statusCode).toBe(200);
    const p2Data = JSON.parse(p2Res.body).data;
    expect(p2Data.currentDay).toBe(5);
    expect(p2Data.resources.food).toBe(90);
    expect(p2Data.activeThreats).toContain('threat_fire');
  });

  it('GET /game/:roomId/bunker returns 3D voxel modules', async () => {
    const room = await app.repositories.rooms.create({ hostId: 'h3', customCode: 'GAME3' });

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/game/${room.roomId}/bunker`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body).data;
    expect(body.modules).toBeDefined();
    expect(body.modules.length).toBeGreaterThan(0);
  });

  it('GET /game/:roomId/events and day-log return historical incident records', async () => {
    const room = await app.repositories.rooms.create({ hostId: 'h4', customCode: 'GAME4' });
    await app.repositories.events.create({
      roomId: room.roomId,
      day: 3,
      type: 'THREAT_TRIGGERED',
      name: 'Утечка радиации',
    });

    const eventsRes = await app.inject({
      method: 'GET',
      url: `/api/v1/game/${room.roomId}/events?day=3`,
    });
    expect(eventsRes.statusCode).toBe(200);
    const eventsData = JSON.parse(eventsRes.body).data;
    expect(eventsData.events).toHaveLength(1);
    expect(eventsData.events[0].name).toBe('Утечка радиации');

    const dayLogRes = await app.inject({
      method: 'GET',
      url: `/api/v1/game/${room.roomId}/day-log/3`,
    });
    expect(dayLogRes.statusCode).toBe(200);
    const dayLogData = JSON.parse(dayLogRes.body).data;
    expect(dayLogData.day).toBe(3);
    expect(dayLogData.events).toHaveLength(1);
  });

  it('GET /game/:roomId/results returns match outcome', async () => {
    const room = await app.repositories.rooms.create({ hostId: 'h5', customCode: 'GAME5' });
    await app.repositories.players.create({
      roomId: room.roomId,
      nickname: 'LoneSurvivor',
      token: 'tok5',
      isHost: true,
      customPlayerId: 'h5',
    });

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/game/${room.roomId}/results`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body).data;
    expect(body.outcome).toBe('survived');
    expect(body.survivors).toHaveLength(1);
  });
});
