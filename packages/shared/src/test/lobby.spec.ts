import { describe, it, expect } from 'vitest';
import { defaultLobbySettings, LobbySettingsSchema } from '../validation/lobby.schema.js';

describe('Lobby Settings Schema & Defaults', () => {
  it('enforces strict default values per GEMINI.md § 3 and ADR-04', () => {
    // CRITICAL USER INVARIANT: enableSuperpowers MUST default to false for realistic mode
    expect(defaultLobbySettings.enableSuperpowers).toBe(false);

    // Expansions defaults per GEMINI.md § 3
    expect(defaultLobbySettings.enablePhobias).toBe(true);
    expect(defaultLobbySettings.enableCharacter).toBe(true);

    // Mulligan rerolls default per ADR-04
    expect(defaultLobbySettings.rerollLimit).toBe(1);

    // Pacing defaults
    expect(defaultLobbySettings.maxPlayers).toBe(10);
    expect(defaultLobbySettings.phase1Duration).toBe('standard');
    expect(defaultLobbySettings.discussionTimerSeconds).toBe(60);
    expect(defaultLobbySettings.votingTimerSeconds).toBe(60);
    expect(defaultLobbySettings.timelineMode).toBe('procedural');
  });

  it('allows overriding settings within valid boundaries', () => {
    const custom = LobbySettingsSchema.parse({
      enableSuperpowers: true,
      rerollLimit: 3,
      maxPlayers: 20,
      discussionTimerSeconds: 120,
      votingTimerSeconds: 45
    });

    expect(custom.enableSuperpowers).toBe(true);
    expect(custom.rerollLimit).toBe(3);
    expect(custom.maxPlayers).toBe(20);
    expect(custom.discussionTimerSeconds).toBe(120);
    expect(custom.votingTimerSeconds).toBe(45);
  });

  it('rejects invalid player count below 2 or above 20', () => {
    expect(() => LobbySettingsSchema.parse({ maxPlayers: 1 })).toThrow();
    expect(() => LobbySettingsSchema.parse({ maxPlayers: 21 })).toThrow();
  });

  it('rejects negative rerollLimit', () => {
    expect(() => LobbySettingsSchema.parse({ rerollLimit: -1 })).toThrow();
  });

  it('rejects out-of-boundary timer settings', () => {
    expect(() => LobbySettingsSchema.parse({ discussionTimerSeconds: 10 })).toThrow();
    expect(() => LobbySettingsSchema.parse({ discussionTimerSeconds: 500 })).toThrow();
    expect(() => LobbySettingsSchema.parse({ votingTimerSeconds: 5 })).toThrow();
    expect(() => LobbySettingsSchema.parse({ votingTimerSeconds: 200 })).toThrow();
  });
});
