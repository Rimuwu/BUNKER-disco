import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestApp } from '../helpers/test-app.js';
import { BunkerServerInstance } from '../../src/api/server.js';

describe('Integration: Rooms REST Endpoints', () => {
  let app: BunkerServerInstance;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /rooms creates room with 5-char code, host token, and defaults', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/rooms',
      payload: {
        nickname: 'HostCommander',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);

    const data = body.data || body;
    expect(data.code).toMatch(/^[A-Z0-9]{5}$/);
    expect(data.isHost).toBe(true);
    expect(data.playerToken).toBeTruthy();
    expect(data.playerId).toBeTruthy();
    expect(data.settings.enableSuperpowers).toBe(false);
    expect(data.settings.rerollLimit).toBe(1);
  });

  it('GET /rooms/:code returns public room info', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/rooms',
      payload: { nickname: 'HostPlayer' },
    });
    const created = JSON.parse(createRes.body).data;

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/rooms/${created.code}`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const data = body.data || body;
    expect(data.code).toBe(created.code);
    expect(data.status).toBe('lobby');
    expect(data.playerCount).toBe(1);
  });

  it('POST /rooms/:code/join allows second player to join', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/rooms',
      payload: { nickname: 'HostPlayer' },
    });
    const created = JSON.parse(createRes.body).data;

    const joinRes = await app.inject({
      method: 'POST',
      url: `/api/v1/rooms/${created.code}/join`,
      payload: { nickname: 'SurvivorTwo' },
    });

    expect(joinRes.statusCode).toBe(200);
    const joinData = JSON.parse(joinRes.body).data;
    expect(joinData.nickname).toBe('SurvivorTwo');
    expect(joinData.isHost).toBe(false);
    expect(joinData.playerToken).toBeTruthy();
  });

  it('POST /rooms/:code/join strictly rejects duplicate nickname with 409 Conflict', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/rooms',
      payload: { nickname: 'HostPlayer' },
    });
    const created = JSON.parse(createRes.body).data;

    const duplicateRes = await app.inject({
      method: 'POST',
      url: `/api/v1/rooms/${created.code}/join`,
      payload: { nickname: 'HostPlayer' },
    });

    expect(duplicateRes.statusCode).toBe(409);
    const errBody = JSON.parse(duplicateRes.body);
    expect(errBody.success).toBe(false);
    expect(errBody.error.code).toBe('NICKNAME_TAKEN');
  });

  it('PATCH /rooms/:code/settings allows host to update toggles and rejects non-host', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/rooms',
      payload: { nickname: 'HostPlayer' },
    });
    const hostData = JSON.parse(createRes.body).data;

    const joinRes = await app.inject({
      method: 'POST',
      url: `/api/v1/rooms/${hostData.code}/join`,
      payload: { nickname: 'RegularPlayer' },
    });
    const nonHostData = JSON.parse(joinRes.body).data;

    // Non-host attempt -> 403
    const nonHostPatch = await app.inject({
      method: 'PATCH',
      url: `/api/v1/rooms/${hostData.code}/settings`,
      headers: { authorization: `Bearer ${nonHostData.playerToken}` },
      payload: { enableSuperpowers: true },
    });
    expect(nonHostPatch.statusCode).toBe(403);

    // Host attempt -> 200
    const hostPatch = await app.inject({
      method: 'PATCH',
      url: `/api/v1/rooms/${hostData.code}/settings`,
      headers: { authorization: `Bearer ${hostData.playerToken}` },
      payload: {
        enableSuperpowers: true,
        enablePhobias: true,
        enableCharacter: false,
        rerollLimit: 3,
      },
    });
    expect(hostPatch.statusCode).toBe(200);

    // Verify GET settings reflects updates
    const settingsRes = await app.inject({
      method: 'GET',
      url: `/api/v1/rooms/${hostData.code}/settings`,
      headers: { authorization: `Bearer ${hostData.playerToken}` },
    });
    const settingsData = JSON.parse(settingsRes.body).data;
    expect(settingsData.enableSuperpowers).toBe(true);
    expect(settingsData.enableCharacter).toBe(false);
    expect(settingsData.rerollLimit).toBe(3);
  });

  it('GET /rooms/:code/players returns full player list', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/rooms',
      payload: { nickname: 'HostPlayer' },
    });
    const hostData = JSON.parse(createRes.body).data;

    await app.inject({
      method: 'POST',
      url: `/api/v1/rooms/${hostData.code}/join`,
      payload: { nickname: 'SecondPlayer' },
    });

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/rooms/${hostData.code}/players`,
      headers: { authorization: `Bearer ${hostData.playerToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const data = body.data || body;
    expect(data.players).toHaveLength(2);
    expect(data.total).toBe(2);
  });

  it('DELETE /rooms/:code closes room by host', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/rooms',
      payload: { nickname: 'HostPlayer' },
    });
    const hostData = JSON.parse(createRes.body).data;

    const delRes = await app.inject({
      method: 'DELETE',
      url: `/api/v1/rooms/${hostData.code}`,
      headers: { authorization: `Bearer ${hostData.playerToken}` },
    });
    expect(delRes.statusCode).toBe(200);

    // Room must now return 404
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/v1/rooms/${hostData.code}`,
    });
    expect(getRes.statusCode).toBe(404);
  });

  it('rejects cross-room host actions with 403 WRONG_ROOM (IDOR prevention)', async () => {
    // 1. Create Room A
    const resA = await app.inject({
      method: 'POST',
      url: '/api/v1/rooms',
      payload: { nickname: 'HostA' },
    });
    const hostA = JSON.parse(resA.body).data;

    // 2. Create Room B
    const resB = await app.inject({
      method: 'POST',
      url: '/api/v1/rooms',
      payload: { nickname: 'HostB' },
    });
    const hostB = JSON.parse(resB.body).data;

    // 3. Host A attempts to PATCH Room B settings without X-Room-Code header -> 403 WRONG_ROOM
    const patchRes = await app.inject({
      method: 'PATCH',
      url: `/api/v1/rooms/${hostB.code}/settings`,
      headers: { authorization: `Bearer ${hostA.playerToken}` },
      payload: {
        enableSuperpowers: true,
      },
    });
    expect(patchRes.statusCode).toBe(403);
    const patchBody = JSON.parse(patchRes.body);
    expect(patchBody.success).toBe(false);
    expect(patchBody.error.code).toBe('WRONG_ROOM');
    expect(patchBody.error.message).toBe('Токен выдан для другой комнаты');

    // Verify Room B settings were NOT modified
    const settingsRes = await app.inject({
      method: 'GET',
      url: `/api/v1/rooms/${hostB.code}/settings`,
      headers: { authorization: `Bearer ${hostB.playerToken}` },
    });
    const settingsData = JSON.parse(settingsRes.body).data;
    expect(settingsData.enableSuperpowers).toBe(false);

    // 4. Host A attempts to DELETE Room B without X-Room-Code header -> 403 WRONG_ROOM
    const deleteRes = await app.inject({
      method: 'DELETE',
      url: `/api/v1/rooms/${hostB.code}`,
      headers: { authorization: `Bearer ${hostA.playerToken}` },
    });
    expect(deleteRes.statusCode).toBe(403);
    const deleteBody = JSON.parse(deleteRes.body);
    expect(deleteBody.success).toBe(false);
    expect(deleteBody.error.code).toBe('WRONG_ROOM');
    expect(deleteBody.error.message).toBe('Токен выдан для другой комнаты');

    // Verify Room B still exists
    const checkRes = await app.inject({
      method: 'GET',
      url: `/api/v1/rooms/${hostB.code}`,
    });
    expect(checkRes.statusCode).toBe(200);
  });
});
