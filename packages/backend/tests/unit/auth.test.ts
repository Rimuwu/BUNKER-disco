import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestApp } from '../helpers/test-app.js';
import { BunkerServerInstance } from '../../src/api/server.js';

describe('Unit: Auth Plugin & JWT Verification', () => {
  let app: BunkerServerInstance;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('signs and verifies a valid JWT token', async () => {
    const payload = {
      playerId: 'p_100',
      roomId: 'room_100',
      roomCode: 'TEST1',
      isHost: true,
      role: 'host' as const,
    };

    const token = app.jwt.sign(payload);
    expect(token).toBeTruthy();

    const decoded = app.jwt.verify(token);
    expect(decoded.playerId).toBe(payload.playerId);
    expect(decoded.roomId).toBe(payload.roomId);
    expect(decoded.roomCode).toBe(payload.roomCode);
    expect(decoded.isHost).toBe(true);
  });

  it('rejects access without Authorization header with 401 MISSING_TOKEN', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/players/me',
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('MISSING_TOKEN');
  });

  it('rejects access with an invalid token with 401 INVALID_TOKEN', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/players/me',
      headers: {
        authorization: 'Bearer definitely-invalid-token',
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INVALID_TOKEN');
  });

  it('rejects request with X-Room-Code mismatch with 403 WRONG_ROOM', async () => {
    const room = await app.repositories.rooms.create({ hostId: 'h1', customCode: 'ROOM1' });
    const token = app.jwt.sign({
      playerId: 'h1',
      roomId: room.roomId,
      roomCode: 'ROOM1',
      isHost: true,
      role: 'host' as const,
    });
    await app.repositories.players.create({
      roomId: room.roomId,
      nickname: 'Commander',
      token,
      isHost: true,
      customPlayerId: 'h1',
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/players/me',
      headers: {
        authorization: `Bearer ${token}`,
        'x-room-code': 'WRONG9',
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('WRONG_ROOM');
  });

  it('rejects access when URL param :code does not match token roomCode with 403 WRONG_ROOM', async () => {
    const roomA = await app.repositories.rooms.create({ hostId: 'hA', customCode: 'ROOMA' });
    const roomB = await app.repositories.rooms.create({ hostId: 'hB', customCode: 'ROOMB' });

    const tokenA = app.jwt.sign({
      playerId: 'hA',
      roomId: roomA.roomId,
      roomCode: 'ROOMA',
      isHost: true,
      role: 'host' as const,
    });
    await app.repositories.players.create({
      roomId: roomA.roomId,
      nickname: 'CommanderA',
      token: tokenA,
      isHost: true,
      customPlayerId: 'hA',
    });

    // Host A tries to access Room B's settings without X-Room-Code header
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/rooms/${roomB.code}/settings`,
      headers: {
        authorization: `Bearer ${tokenA}`,
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('WRONG_ROOM');
    expect(body.error.message).toBe('Токен выдан для другой комнаты');
  });

  it('strictly rejects non-host from host-guarded routes with 403 NOT_HOST', async () => {
    const room = await app.repositories.rooms.create({ hostId: 'h1', customCode: 'ROOM2' });
    const nonHostToken = app.jwt.sign({
      playerId: 'p2',
      roomId: room.roomId,
      roomCode: 'ROOM2',
      isHost: false,
      role: 'player' as const,
    });
    await app.repositories.players.create({
      roomId: room.roomId,
      nickname: 'NonHostUser',
      token: nonHostToken,
      isHost: false,
      customPlayerId: 'p2',
    });

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/rooms/${room.code}/settings`,
      headers: {
        authorization: `Bearer ${nonHostToken}`,
      },
      payload: {
        enableSuperpowers: true,
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_HOST');
  });

  it('strictly rejects eliminated players from mutative actions with 403 PLAYER_ELIMINATED', async () => {
    const room = await app.repositories.rooms.create({ hostId: 'h1', customCode: 'ROOM3' });
    const playerToken = app.jwt.sign({
      playerId: 'p_dead',
      roomId: room.roomId,
      roomCode: 'ROOM3',
      isHost: false,
      role: 'player' as const,
    });
    const player = await app.repositories.players.create({
      roomId: room.roomId,
      nickname: 'ExiledGhost',
      token: playerToken,
      isHost: false,
      customPlayerId: 'p_dead',
    });
    player.isEliminated = true;

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/actions',
      headers: {
        authorization: `Bearer ${playerToken}`,
      },
      payload: {
        type: 'REVEAL_CARD',
        clientSequence: 1,
        payload: { category: 'profession' },
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('PLAYER_ELIMINATED');
  });
});
