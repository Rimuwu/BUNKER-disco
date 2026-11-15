export interface ILobbySettings {
  // Expansion deck toggles per GEMINI.md § 3
  enableSuperpowers: boolean; // default: false (classic realism by default)
  enablePhobias: boolean;      // default: true
  enableCharacter: boolean;    // default: true

  // Mulligan rerolls per ADR-04 & docs/mechanics/gameplay.md:133-149
  rerollLimit: number;         // 0, 1, 2, 3, 5, 999; default: 1

  // Timing and Pacing
  maxPlayers: number;          // 4..20, default: 10
  phase1Duration: 'fast' | 'standard' | 'extended';
  discussionTimerSeconds: number; // 30..300, default: 60
  votingTimerSeconds: number;     // 15..120, default: 60

  // Phase 2 Survival Mechanics
  timelineMode: 'procedural' | 'custom';
  scenarioId?: string;
  enableSecretQuests: boolean;
  enableTraitor: boolean;
  enableMinigames: boolean;

  // Superpower module configuration
  superpowerDealRound: number;
  superpowersPerPlayer: number;
  allowRerollSuperpower: boolean;
}
