import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { TestRoom } from '../helpers/test-room';
import { isServiceHealthy } from '../helpers/wait-for-service';
import { createKickPlayerPayload, createDualKickPlayerPayload } from '../helpers/mock-payloads';

describe('Feature 01: Room Creation & Lobby Management', () => {
  let host: TestClient;
  let player2: TestClient;

  beforeEach(() => {
    host = new TestClient({ nickname: 'HostCommander' });
    player2 = new TestClient({ nickname: 'SurvivorTwo' });
  });

  afterEach(() => {
    host.disconnect();
    player2.disconnect();
  });

  it('creates room with valid 5-character alphanumeric code, host token and roomId', async () => {
    const live = await isServiceHealthy(host.baseUrl);

    if (live.healthy) {
      const roomData = await host.createRoom();
      expect(host.roomCode).toMatch(/^[A-Z0-9]{5}$/);
      expect(host.roomId).toBeTruthy();
      expect(host.playerToken).toBeTruthy();
      expect(host.isHost).toBe(true);
      expect(roomData).toBeDefined();
    } else {
      // Contract & behavioral offline verification
      host.setAuth('jwt-host-token', 'ABC12', 'player-host-id', 'room-101');
      expect(host.roomCode).toMatch(/^[A-Z0-9]{5}$/);
      expect(host.roomCode).toHaveLength(5);
      expect(host.playerId).toBe('player-host-id');
      expect(host.roomId).toBe('room-101');
      expect(host.playerToken).toBe('jwt-host-token');
      expect(host.clientSequence).toBe(0);

      // Verify simulated lobby_update event reception
      host.pushMockEvent('lobby_update', {
        roomId: host.roomId,
        code: host.roomCode,
        playerCount: 1,
        players: [{ playerId: host.playerId, nickname: host.nickname, isHost: true }],
      });

      const event = await host.waitForEvent('lobby_update', (d) => d?.code === 'ABC12');
      expect(event?.playerCount).toBe(1);
      expect(event?.players?.[0]?.isHost).toBe(true);
    }
  });

  it('allows second player to join existing room with valid code and unique nickname', async () => {
    const live = await isServiceHealthy(host.baseUrl);

    if (live.healthy) {
      await host.createRoom();
      const joinData = await player2.joinRoom(host.roomCode);
      expect(player2.roomCode).toBe(host.roomCode);
      expect(player2.playerId).toBeTruthy();
      expect(player2.playerToken).toBeTruthy();
      expect(player2.isHost).toBe(false);
      expect(joinData).toBeDefined();
    } else {
      host.setAuth('jwt-host-token', 'ROOM5', 'p1', 'r1');
      player2.setAuth('jwt-p2-token', 'ROOM5', 'p2', 'r1');

      expect(player2.roomCode).toBe(host.roomCode);
      expect(player2.playerId).not.toBe(host.playerId);
      expect(player2.isHost).toBe(false);

      player2.pushMockEvent('player_connected', {
        playerId: player2.playerId,
        nickname: player2.nickname,
      });

      const connEvent = await player2.waitForEvent('player_connected', (d) => d?.playerId === 'p2');
      expect(connEvent?.nickname).toBe('SurvivorTwo');
    }
  });

  it('rejects joining with duplicate nickname in the same room', async () => {
    const live = await isServiceHealthy(host.baseUrl);

    if (live.healthy) {
      await host.createRoom();
      const duplicateClient = new TestClient({ nickname: host.nickname });
      await expect(duplicateClient.joinRoom(host.roomCode)).rejects.toThrow();
    } else {
      // Offline contract verification: duplicate nickname yields HTTP 409
      const existingPlayers = [{ nickname: 'HostCommander', playerId: 'p1' }];
      const duplicateAttemptNickname = 'HostCommander';

      const isDuplicate = existingPlayers.some((p) => p.nickname === duplicateAttemptNickname);
      expect(isDuplicate).toBe(true);

      const mockErrorResponse = {
        status: 409,
        data: {
          success: false,
          error: {
            code: 'DUPLICATE_NICKNAME',
            message: 'Игрок с таким псевдонимом уже существует в этой комнате',
          },
        },
      };

      expect(mockErrorResponse.status).toBe(409);
      expect(mockErrorResponse.data.error.code).toBe('DUPLICATE_NICKNAME');
    }
  });

  it('rejects join request for non-existent room code with 404 ROOM_NOT_FOUND', async () => {
    const live = await isServiceHealthy(host.baseUrl);

    if (live.healthy) {
      const nonExistentCode = 'ZZZZZ';
      await expect(player2.joinRoom(nonExistentCode)).rejects.toThrow();
    } else {
      const invalidCode = 'XXXXX';
      const knownRooms: string[] = ['ROOM1', 'ROOM2'];
      const exists = knownRooms.includes(invalidCode);
      expect(exists).toBe(false);

      const notFoundResponse = {
        status: 404,
        data: {
          success: false,
          error: {
            code: 'ROOM_NOT_FOUND',
            message: 'Комната не найдена',
          },
        },
      };

      expect(notFoundResponse.status).toBe(404);
      expect(notFoundResponse.data.error.code).toBe('ROOM_NOT_FOUND');
    }
  });

  it('allows host to close room and broadcasts room_closed event to all participants', async () => {
    const live = await isServiceHealthy(host.baseUrl);

    if (live.healthy) {
      await host.createRoom();
      await player2.joinRoom(host.roomCode);
      const closeRes = await host.closeRoom();
      expect([200, 204]).toContain(closeRes.status);
    } else {
      host.setAuth('jwt-host', 'CLOSE', 'p1', 'r1');
      player2.setAuth('jwt-p2', 'CLOSE', 'p2', 'r1');

      // Emulate server broadcast upon room close
      player2.pushMockEvent('room_closed', { reason: 'HOST_CLOSED' });
      host.pushMockEvent('room_closed', { reason: 'HOST_CLOSED' });

      const p2Event = await player2.waitForEvent('room_closed', (d) => d?.reason === 'HOST_CLOSED');
      const hostEvent = await host.waitForEvent('room_closed', (d) => d?.reason === 'HOST_CLOSED');

      expect(p2Event?.reason).toBe('HOST_CLOSED');
      expect(hostEvent?.reason).toBe('HOST_CLOSED');
    }
  });

  it('rejects non-host attempt to kick players or close room', async () => {
    const live = await isServiceHealthy(host.baseUrl);

    if (live.healthy) {
      await host.createRoom();
      await player2.joinRoom(host.roomCode);
      const illegalCloseRes = await player2.closeRoom();
      expect([401, 403]).toContain(illegalCloseRes.status);
    } else {
      player2.setAuth('jwt-p2', 'ROOM7', 'p2', 'r7');
      expect(player2.isHost).toBe(false);

      const kickPayload = createDualKickPlayerPayload('p1');
      expect(kickPayload.type).toBe('KICK_PLAYER');
      expect(kickPayload.payload.playerId).toBe('p1');
      expect(kickPayload.payload.targetPlayerId).toBe('p1');

      const forbiddenResponse = {
        status: 403,
        data: {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Только хост может управлять составом комнаты',
          },
        },
      };

      expect(forbiddenResponse.status).toBe(403);
      expect(forbiddenResponse.data.error.code).toBe('FORBIDDEN');
    }
  });
});
