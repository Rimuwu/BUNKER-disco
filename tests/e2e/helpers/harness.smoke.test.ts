import { describe, it, expect, beforeEach } from 'vitest';
import { TestClient } from './test-client';
import { TestRoom } from './test-room';
import {
  createLobbySettings,
  createStartGamePayload,
  createRevealCardPayload,
  createNominatePlayerPayload,
  createCastVotePayload,
  createSkipVotePayload,
  createEndTurnPayload,
  createUseAbilityPayload,
  createAssignRoomPayload,
  createStartCraftPayload,
  createResolveEventPayload,
  createTradeItemPayload,
  createUpgradeRoomPayload,
  createKickPlayerPayload,
  createPlayerRerollPayload,
  createTimelineScenario,
} from './mock-payloads';
import { isServiceHealthy, waitForService } from './wait-for-service';

describe('E2E Harness Smoke Test Suite', () => {
  describe('TestClient Unit Behavior', () => {
    let client: TestClient;

    beforeEach(() => {
      client = new TestClient({
        nickname: 'Alice',
        baseUrl: 'http://localhost:3000',
      });
    });

    it('instantiates correctly with defaults and provided options', () => {
      expect(client.nickname).toBe('Alice');
      expect(client.baseUrl).toBe('http://localhost:3000');
      expect(client.playerId).toBe('');
      expect(client.playerToken).toBe('');
      expect(client.roomId).toBe('');
      expect(client.roomCode).toBe('');
      expect(client.isHost).toBe(false);
      expect(client.clientSequence).toBe(0);
      expect(client.isConnected()).toBe(false);
      expect(client.getEventLog()).toEqual([]);
    });

    it('sets manual auth headers and properties via setAuth', () => {
      client.setAuth('jwt-token-xyz', 'ROOM1', 'player-123', 'room-456');
      expect(client.playerToken).toBe('jwt-token-xyz');
      expect(client.roomCode).toBe('ROOM1');
      expect(client.playerId).toBe('player-123');
      expect(client.roomId).toBe('room-456');
    });

    it('tracks and clears events in eventLog via pushMockEvent', () => {
      client.pushMockEvent('lobby_update', { playerCount: 3 });
      client.pushMockEvent('card_revealed', { category: 'profession', cardName: 'Surgeon' });

      const logs = client.getEventLog();
      expect(logs).toHaveLength(2);
      expect(logs[0].event).toBe('lobby_update');
      expect(logs[0].data.playerCount).toBe(3);
      expect(logs[1].event).toBe('card_revealed');
      expect(logs[1].data.cardName).toBe('Surgeon');

      client.clearEventLog();
      expect(client.getEventLog()).toHaveLength(0);
    });

    it('resolves waitForEvent immediately if event is already logged', async () => {
      client.pushMockEvent('phase1_start', { round: 1, timer: 60 });
      const eventData = await client.waitForEvent('phase1_start', (d) => d.round === 1, 1000);
      expect(eventData).toEqual({ round: 1, timer: 60 });
    });

    it('resolves waitForEvent asynchronously when matching event arrives', async () => {
      const waitPromise = client.waitForEvent('vote_result', (d) => d.exiledPlayerId === 'p2', 1500);

      setTimeout(() => {
        client.pushMockEvent('vote_result', { exiledPlayerId: 'p2', votesCount: 3 });
      }, 50);

      const result = await waitPromise;
      expect(result).toEqual({ exiledPlayerId: 'p2', votesCount: 3 });
    });

    it('throws timeout error in waitForEvent when event never arrives', async () => {
      await expect(
        client.waitForEvent('non_existent_event', undefined, 100)
      ).rejects.toThrow(/Timeout waiting for event "non_existent_event"/);
    });

    it('safe disconnect handles non-connected socket without throwing', () => {
      expect(() => client.disconnect()).not.toThrow();
      expect(client.isConnected()).toBe(false);
    });
  });

  describe('TestRoom Unit Behavior', () => {
    it('manages clients and client lookups properly', () => {
      const host = new TestClient({ nickname: 'HostPlayer' });
      const p2 = new TestClient({ nickname: 'Player_2' });
      const p3 = new TestClient({ nickname: 'Player_3' });

      const room = new TestRoom(host, [host, p2, p3], { playerCount: 3 });
      room.roomCode = 'TEST1';
      room.roomId = 'room_abc123';

      expect(room.getAllClients()).toHaveLength(3);
      expect(room.getClient(0).nickname).toBe('HostPlayer');
      expect(room.getClient(1).nickname).toBe('Player_2');
      expect(room.getClient(2).nickname).toBe('Player_3');
      expect(room.getClientByNickname('Player_2')).toBe(p2);
      expect(room.getClientByNickname('NonExistent')).toBeUndefined();

      expect(() => room.getClient(5)).toThrow(/out of bounds/);
    });

    it('clears logs and destroys clients cleanly', () => {
      const host = new TestClient({ nickname: 'HostPlayer' });
      const p2 = new TestClient({ nickname: 'Player_2' });
      const room = new TestRoom(host, [host, p2], { playerCount: 2 });

      host.pushMockEvent('test_event', { ok: true });
      p2.pushMockEvent('test_event', { ok: true });

      expect(host.getEventLog()).toHaveLength(1);
      expect(p2.getEventLog()).toHaveLength(1);

      room.clearAllEventLogs();
      expect(host.getEventLog()).toHaveLength(0);
      expect(p2.getEventLog()).toHaveLength(0);

      expect(() => room.destroy()).not.toThrow();
    });

    it('rejects creation with playerCount < 1', async () => {
      await expect(TestRoom.create({ playerCount: 0 })).rejects.toThrow(/requires at least 1 player/);
    });
  });

  describe('Mock Payloads Generator', () => {
    it('generates standard and customized lobby settings', () => {
      const defaultSettings = createLobbySettings();
      expect(defaultSettings.enableSuperpowers).toBe(false);
      expect(defaultSettings.enablePhobias).toBe(false);
      expect(defaultSettings.enableCharacter).toBe(false);
      expect(defaultSettings.rerollLimit).toBe(1);
      expect(defaultSettings.discussionTimeSeconds).toBe(60);
      expect(defaultSettings.timelineMode).toBe('procedural');

      const customSettings = createLobbySettings({
        enableSuperpowers: true,
        enablePhobias: true,
        rerollLimit: 3,
        timelineMode: 'custom',
      });
      expect(customSettings.enableSuperpowers).toBe(true);
      expect(customSettings.enablePhobias).toBe(true);
      expect(customSettings.enableCharacter).toBe(false);
      expect(customSettings.rerollLimit).toBe(3);
      expect(customSettings.timelineMode).toBe('custom');
    });

    it('generates Phase 1 action payloads matching CQRS specs', () => {
      expect(createStartGamePayload()).toEqual({
        type: 'START_GAME',
        payload: {},
      });

      expect(createRevealCardPayload('profession', false)).toEqual({
        type: 'REVEAL_CARD',
        payload: { category: 'profession', isVoluntary: false },
      });

      expect(createRevealCardPayload('hobby', true)).toEqual({
        type: 'REVEAL_CARD',
        payload: { category: 'hobby', isVoluntary: true },
      });

      expect(createNominatePlayerPayload('p3')).toEqual({
        type: 'NOMINATE_PLAYER',
        payload: { nomineeId: 'p3' },
      });

      expect(createCastVotePayload('p3', false)).toEqual({
        type: 'CAST_VOTE',
        payload: { nomineeId: 'p3', isSkip: false },
      });

      expect(createCastVotePayload('', true)).toEqual({
        type: 'CAST_VOTE',
        payload: { nomineeId: '', isSkip: true },
      });

      expect(createSkipVotePayload()).toEqual({
        type: 'SKIP_VOTE',
        payload: {},
      });

      expect(createEndTurnPayload()).toEqual({
        type: 'END_TURN',
        payload: {},
      });

      expect(createUseAbilityPayload('ability_heal', 'p2', { apCost: 2 })).toEqual({
        type: 'USE_ABILITY',
        payload: {
          abilityId: 'ability_heal',
          targetPlayerId: 'p2',
          params: { apCost: 2 },
        },
      });

      expect(createPlayerRerollPayload()).toEqual({
        type: 'PLAYER_REROLL',
        payload: {},
      });
    });

    it('generates Phase 2 and lobby management payloads matching CQRS specs', () => {
      expect(createAssignRoomPayload('room_kitchen', 'ws_stove')).toEqual({
        type: 'ASSIGN_ROOM',
        payload: { roomId: 'room_kitchen', workstationId: 'ws_stove' },
      });

      expect(createStartCraftPayload('recipe_radio', ['item_wire', 'item_chip'])).toEqual({
        type: 'START_CRAFT',
        payload: { recipeId: 'recipe_radio', ingredientIds: ['item_wire', 'item_chip'] },
      });

      expect(createResolveEventPayload('evt_leak', 1)).toEqual({
        type: 'RESOLVE_EVENT',
        payload: { eventId: 'evt_leak', choiceIndex: 1 },
      });

      expect(createTradeItemPayload('p2', 'item_medkit', 'item_water')).toEqual({
        type: 'TRADE_ITEM',
        payload: {
          targetPlayerId: 'p2',
          offeredItemId: 'item_medkit',
          requestedItemId: 'item_water',
        },
      });

      expect(createUpgradeRoomPayload('room_generator')).toEqual({
        type: 'UPGRADE_ROOM',
        payload: { roomId: 'room_generator' },
      });

      expect(createKickPlayerPayload('p4')).toEqual({
        type: 'KICK_PLAYER',
        payload: { playerId: 'p4' },
      });
    });

    it('generates deterministic timeline scenarios for Tier 4 testing', () => {
      const standard = createTimelineScenario('standard');
      expect(standard.name).toBe('Standard Survival Timeline');
      expect(standard.days.length).toBeGreaterThanOrEqual(5);

      const severe = createTimelineScenario('severe');
      expect(severe.name).toContain('Asphyxiation');
      expect(severe.days.some((d) => d.resourceModifiers?.air !== undefined)).toBe(true);

      const sos = createTimelineScenario('sos');
      expect(sos.name).toContain('Radio SOS');
      expect(sos.days.some((d) => d.day === 25)).toBe(true);
    });
  });

  describe('Wait-For-Service Probe Helper', () => {
    it('gracefully detects offline service without crashing', async () => {
      // Point to an unused local port
      const health = await isServiceHealthy('http://127.0.0.1:59999');
      expect(health.healthy).toBe(false);
      expect(health.error).toBeDefined();
    });

    it('times out cleanly when polling offline service', async () => {
      const online = await waitForService({
        baseUrl: 'http://127.0.0.1:59999',
        timeoutMs: 150,
        intervalMs: 50,
      });
      expect(online).toBe(false);
    });
  });
});
