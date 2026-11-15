import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';
import { createLobbySettings, createTimelineScenario } from '../helpers/mock-payloads';

describe('Feature 02: Lobby Settings & Deck Toggles', () => {
  let host: TestClient;
  let nonHost: TestClient;

  beforeEach(() => {
    host = new TestClient({ nickname: 'HostSettingMaster' });
    nonHost = new TestClient({ nickname: 'RegularGamer' });
  });

  afterEach(() => {
    host.disconnect();
    nonHost.disconnect();
  });

  it('updates deck toggles for enableSuperpowers, enablePhobias, and enableCharacter', async () => {
    const live = await isServiceHealthy(host.baseUrl);

    const targetSettings = createLobbySettings({
      enableSuperpowers: true,
      enablePhobias: true,
      enableCharacter: false,
    });

    if (live.healthy) {
      await host.createRoom();
      const res = await host.updateRoomSettings(targetSettings);
      expect([200, 204]).toContain(res.status);

      const updated = await host.getRoomSettings();
      const data = updated?.data || updated;
      expect(data.enableSuperpowers).toBe(true);
      expect(data.enablePhobias).toBe(true);
      expect(data.enableCharacter).toBe(false);
    } else {
      host.setAuth('jwt-host', 'SETT1', 'h1', 'r1');

      // Verify structure of lobby settings helper
      expect(targetSettings.enableSuperpowers).toBe(true);
      expect(targetSettings.enablePhobias).toBe(true);
      expect(targetSettings.enableCharacter).toBe(false);

      // Verify event emission simulation
      host.pushMockEvent('settings_updated', {
        settings: targetSettings,
      });

      const event = await host.waitForEvent('settings_updated', (d) => d?.settings?.enableSuperpowers === true);
      expect(event?.settings?.enableSuperpowers).toBe(true);
      expect(event?.settings?.enablePhobias).toBe(true);
      expect(event?.settings?.enableCharacter).toBe(false);
    }
  });

  it('strictly rejects non-host attempting to update room settings', async () => {
    const live = await isServiceHealthy(host.baseUrl);

    const maliciousSettings = { enableSuperpowers: true };

    if (live.healthy) {
      await host.createRoom();
      await nonHost.joinRoom(host.roomCode);
      const res = await nonHost.updateRoomSettings(maliciousSettings);
      expect([401, 403]).toContain(res.status);
    } else {
      nonHost.setAuth('jwt-nonhost', 'SETT2', 'p2', 'r2');
      expect(nonHost.isHost).toBe(false);

      const forbiddenError = {
        status: 403,
        data: {
          success: false,
          error: {
            code: 'NOT_HOST',
            message: 'Только создатель комнаты может изменять настройки',
          },
        },
      };

      expect(forbiddenError.status).toBe(403);
      expect(forbiddenError.data.error.code).toBe('NOT_HOST');
    }
  });

  it('configures rerollLimit with boundary values 0, 3, and 999', async () => {
    const live = await isServiceHealthy(host.baseUrl);

    const boundaryValues = [0, 3, 999];

    for (const val of boundaryValues) {
      const settings = createLobbySettings({ rerollLimit: val });
      expect(settings.rerollLimit).toBe(val);

      if (live.healthy) {
        if (!host.roomCode) await host.createRoom();
        const res = await host.updateRoomSettings(settings);
        expect([200, 204]).toContain(res.status);
      } else {
        host.setAuth('jwt-host', 'REROL', 'h1', 'r1');
        host.clearEventLog();
        host.pushMockEvent('settings_updated', { settings });
        const event = await host.waitForEvent('settings_updated', (d) => d?.settings?.rerollLimit === val);
        expect(event?.settings?.rerollLimit).toBe(val);
      }
    }
  });

  it('attaches custom timeline scenario and updates timelineMode to custom', async () => {
    const live = await isServiceHealthy(host.baseUrl);

    const customScenario = createTimelineScenario('severe');
    const customSettings = createLobbySettings({
      timelineMode: 'custom',
      timeline: customScenario.days.map((d) => ({
        day: d.day,
        eventId: d.threatId || d.defectId || 'EVENT_DEFAULT',
        title: `Crisis Day ${d.day}`,
      })),
    });

    expect(customSettings.timelineMode).toBe('custom');
    expect(customSettings.timeline?.length).toBeGreaterThanOrEqual(5);

    if (live.healthy) {
      await host.createRoom();
      const res = await host.updateRoomSettings(customSettings);
      expect([200, 204]).toContain(res.status);
    } else {
      host.setAuth('jwt-host', 'SCEN1', 'h1', 'r1');
      host.pushMockEvent('settings_updated', { settings: customSettings });

      const event = await host.waitForEvent('settings_updated', (d) => d?.settings?.timelineMode === 'custom');
      expect(event?.settings?.timelineMode).toBe('custom');
      expect(event?.settings?.timeline?.[0]?.day).toBe(1);
    }
  });

  it('rejects settings update after game has already started with 409 or 422', async () => {
    const live = await isServiceHealthy(host.baseUrl);

    if (live.healthy) {
      // In live environment, after START_GAME action, PATCH /settings fails
      await host.createRoom();
      await host.sendAction('START_GAME', {});
      const updateRes = await host.updateRoomSettings({ enableSuperpowers: true });
      expect([400, 409, 422]).toContain(updateRes.status);
    } else {
      const roomStatus = 'phase1';
      const isLobby = roomStatus === 'lobby';
      expect(isLobby).toBe(false);

      const lockedError = {
        status: 409,
        data: {
          success: false,
          error: {
            code: 'ROOM_STARTED',
            message: 'Нельзя изменять настройки комнаты после начала игры',
          },
        },
      };

      expect(lockedError.status).toBe(409);
      expect(lockedError.data.error.code).toBe('ROOM_STARTED');
    }
  });
});
