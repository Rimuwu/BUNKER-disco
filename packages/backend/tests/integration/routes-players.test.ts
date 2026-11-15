import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestApp } from '../helpers/test-app.js';
import { BunkerServerInstance } from '../../src/api/server.js';

describe('Integration: Players REST Endpoints', () => {
  let app: BunkerServerInstance;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /players/me returns private player dossier', async () => {
    const room = await app.repositories.rooms.create({ hostId: 'h1', customCode: 'PLR01' });
    const token = app.jwt.sign({
      playerId: 'h1',
      roomId: room.roomId,
      roomCode: 'PLR01',
      isHost: true,
      role: 'host' as const,
    });
    await app.repositories.players.create({
      roomId: room.roomId,
      nickname: 'DoctorWho',
      token,
      isHost: true,
      customPlayerId: 'h1',
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/players/me',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const data = body.data || body;
    expect(data.nickname).toBe('DoctorWho');
    expect(data.stats.health).toBe(100);
    expect(data.actionPoints).toBe(3);
    expect(data.remainingRerolls).toBe(1);
  });

  it('POST /players/reroll decrements rerolls and returns 422 when exhausted', async () => {
    const room = await app.repositories.rooms.create({ hostId: 'h2', customCode: 'PLR02' });
    const token = app.jwt.sign({
      playerId: 'h2',
      roomId: room.roomId,
      roomCode: 'PLR02',
      isHost: true,
      role: 'host' as const,
    });
    await app.repositories.players.create({
      roomId: room.roomId,
      nickname: 'Gambler',
      token,
      isHost: true,
      remainingRerolls: 1, // exactly 1 reroll
      customPlayerId: 'h2',
    });

    // 1st reroll -> succeeds (202 Accepted, remaining: 0)
    const firstReroll = await app.inject({
      method: 'POST',
      url: '/api/v1/players/reroll',
      headers: { authorization: `Bearer ${token}` },
      payload: { clientSequence: 1 },
    });
    expect([200, 202]).toContain(firstReroll.statusCode);
    const firstData = JSON.parse(firstReroll.body).data;
    expect(firstData.remainingRerolls).toBe(0);

    // 2nd reroll -> rejects with 422 NO_REROLLS_LEFT
    const secondReroll = await app.inject({
      method: 'POST',
      url: '/api/v1/players/reroll',
      headers: { authorization: `Bearer ${token}` },
      payload: { clientSequence: 2 },
    });
    expect(secondReroll.statusCode).toBe(422);
    const errBody = JSON.parse(secondReroll.body);
    expect(errBody.success).toBe(false);
    expect(errBody.error.code).toBe('NO_REROLLS_LEFT');
  });

  it('GET /players/:playerId filters private unrevealed cards', async () => {
    const room = await app.repositories.rooms.create({ hostId: 'h3', customCode: 'PLR03' });
    const hostToken = app.jwt.sign({
      playerId: 'h3',
      roomId: room.roomId,
      roomCode: 'PLR03',
      isHost: true,
      role: 'host' as const,
    });
    const player = await app.repositories.players.create({
      roomId: room.roomId,
      nickname: 'Spy',
      token: hostToken,
      isHost: true,
      customPlayerId: 'h3',
    });

    // Add 1 revealed card and 1 unrevealed card
    player.cards = {
      profession: { cardId: 'prof_surgeon', name: 'Хирург', isRevealed: true },
      health: { cardId: 'health_asthma', name: 'Астма', isRevealed: false },
    };

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/players/${player.playerId}`,
      headers: { authorization: `Bearer ${hostToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body).data;
    expect(body.revealedCards.profession).toBeDefined();
    expect(body.revealedCards.health).toBeUndefined(); // Hidden!
  });

  it('GET /players/:roomId/leaderboard returns rankings', async () => {
    const room = await app.repositories.rooms.create({ hostId: 'h4', customCode: 'PLR04' });
    const token = app.jwt.sign({
      playerId: 'h4',
      roomId: room.roomId,
      roomCode: 'PLR04',
      isHost: true,
      role: 'host' as const,
    });
    await app.repositories.players.create({
      roomId: room.roomId,
      nickname: 'Winner',
      token,
      isHost: true,
      customPlayerId: 'h4',
    });

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/players/${room.roomId}/leaderboard`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body).data;
    expect(body.rankings).toHaveLength(1);
    expect(body.rankings[0].nickname).toBe('Winner');
  });
});
