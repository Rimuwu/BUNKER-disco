import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestApp } from '../helpers/test-app.js';
import { BunkerServerInstance } from '../../src/api/server.js';

describe('Integration: Actions REST Ingestion & Status', () => {
  let app: BunkerServerInstance;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /actions enqueues task and returns 202 Accepted', async () => {
    const room = await app.repositories.rooms.create({ hostId: 'h1', customCode: 'ACT01' });
    const token = app.jwt.sign({
      playerId: 'h1',
      roomId: room.roomId,
      roomCode: 'ACT01',
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
      method: 'POST',
      url: '/api/v1/actions',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        type: 'START_GAME',
        clientSequence: 1,
        payload: {},
      },
    });

    expect(res.statusCode).toBe(202);
    const body = JSON.parse(res.body);
    const data = body.data || body;
    expect(data.status).toBe('queued');
    expect(data.taskId).toBeTruthy();
    expect(data.type).toBe('START_GAME');

    // Verify task is in queue
    const popped = await app.queueSystem.consumer.popRoomTask(room.roomId, 1);
    expect(popped).toBeDefined();
    expect(popped?.taskId).toBe(data.taskId);

    // Verify GET /actions/:taskId/status
    const statusRes = await app.inject({
      method: 'GET',
      url: `/api/v1/actions/${data.taskId}/status`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(statusRes.statusCode).toBe(200);
    const statusData = JSON.parse(statusRes.body).data;
    expect(statusData.status).toBe('queued');
  });

  it('POST /actions gracefully drops duplicate clientSequence', async () => {
    const room = await app.repositories.rooms.create({ hostId: 'h2', customCode: 'ACT02' });
    const token = app.jwt.sign({
      playerId: 'h2',
      roomId: room.roomId,
      roomCode: 'ACT02',
      isHost: true,
      role: 'host' as const,
    });
    await app.repositories.players.create({
      roomId: room.roomId,
      nickname: 'Commander2',
      token,
      isHost: true,
      customPlayerId: 'h2',
    });

    // 1st request with seq 1 -> 202
    const first = await app.inject({
      method: 'POST',
      url: '/api/v1/actions',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        type: 'REVEAL_CARD',
        clientSequence: 1,
        payload: { category: 'hobby' },
      },
    });
    expect(first.statusCode).toBe(202);

    // 2nd request with same seq 1 -> deduplicated
    const second = await app.inject({
      method: 'POST',
      url: '/api/v1/actions',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        type: 'REVEAL_CARD',
        clientSequence: 1,
        payload: { category: 'hobby' },
      },
    });
    expect(second.statusCode).toBe(200);
    const secondBody = JSON.parse(second.body);
    expect(secondBody.data.status).toBe('deduplicated');
  });

  it('POST /actions without clientSequence is enqueued and returns 202 Accepted', async () => {
    const room = await app.repositories.rooms.create({ hostId: 'h_no_seq', customCode: 'NOSEQ' });
    const token = app.jwt.sign({
      playerId: 'h_no_seq',
      roomId: room.roomId,
      roomCode: 'NOSEQ',
      isHost: true,
      role: 'host' as const,
    });
    await app.repositories.players.create({
      roomId: room.roomId,
      nickname: 'NoSeqPlayer',
      token,
      isHost: true,
      customPlayerId: 'h_no_seq',
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/actions',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        type: 'REVEAL_CARD',
        payload: { category: 'hobby' },
      },
    });

    expect(res.statusCode).toBe(202);
    const body = JSON.parse(res.body);
    const data = body.data || body;
    expect(data.status).toBe('queued');
    expect(data.taskId).toBeTruthy();

    // Verify task is in queue
    const popped = await app.queueSystem.consumer.popRoomTask(room.roomId, 1);
    expect(popped).toBeDefined();
    expect(popped?.taskId).toBe(data.taskId);
  });

  it('POST /actions with clientSequence = 0 is enqueued and returns 202 Accepted', async () => {
    const room = await app.repositories.rooms.create({ hostId: 'h_zero_seq', customCode: 'ZEROS' });
    const token = app.jwt.sign({
      playerId: 'h_zero_seq',
      roomId: room.roomId,
      roomCode: 'ZEROS',
      isHost: true,
      role: 'host' as const,
    });
    await app.repositories.players.create({
      roomId: room.roomId,
      nickname: 'ZeroSeqPlayer',
      token,
      isHost: true,
      customPlayerId: 'h_zero_seq',
    });

    // 1st request with clientSequence = 0
    const res1 = await app.inject({
      method: 'POST',
      url: '/api/v1/actions',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        type: 'VOTE',
        clientSequence: 0,
        payload: { nomineeId: 'target_1' },
      },
    });

    expect(res1.statusCode).toBe(202);
    const body1 = JSON.parse(res1.body);
    const data1 = body1.data || body1;
    expect(data1.status).toBe('queued');

    // 2nd request with clientSequence = 0 should ALSO be enqueued (not dropped as deduplicated)
    const res2 = await app.inject({
      method: 'POST',
      url: '/api/v1/actions',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        type: 'VOTE',
        clientSequence: 0,
        payload: { nomineeId: 'target_2' },
      },
    });

    expect(res2.statusCode).toBe(202);
    const body2 = JSON.parse(res2.body);
    const data2 = body2.data || body2;
    expect(data2.status).toBe('queued');

    // Both tasks are in the queue
    const popped1 = await app.queueSystem.consumer.popRoomTask(room.roomId, 1);
    const popped2 = await app.queueSystem.consumer.popRoomTask(room.roomId, 1);
    expect(popped1?.taskId).toBe(data1.taskId);
    expect(popped2?.taskId).toBe(data2.taskId);
  });

  it('GET /actions/:taskId/status returns 404 for unknown task', async () => {
    const token = app.jwt.sign({
      playerId: 'h3',
      roomId: 'r3',
      roomCode: 'ACT03',
      isHost: true,
      role: 'host' as const,
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/actions/nonexistent_task_123/status',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(404);
  });
});
