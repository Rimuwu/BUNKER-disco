import { z } from 'zod';
import { MIN_PLAYERS, MAX_PLAYERS } from '../constants/formulas.js';
import { ILobbySettings } from '../types/lobby.types.js';

export const LobbySettingsSchema = z.object({
  // Deck Expansion Toggles (strictly conforming to GEMINI.md § 3)
  enableSuperpowers: z.boolean().default(false), // Classic realism by default
  enablePhobias: z.boolean().default(true),      // Phobias expansion enabled by default
  enableCharacter: z.boolean().default(true),    // Character traits expansion enabled by default

  // Mulligan Reroll Config (ADR-04 & docs/mechanics/gameplay.md)
  rerollLimit: z.number().int().min(0).default(1), // 0=hardcore, 1=default, 999=unlimited

  // Player count and timing
  maxPlayers: z.number().int().min(MIN_PLAYERS).max(MAX_PLAYERS).default(10),
  phase1Duration: z.enum(['fast', 'standard', 'extended']).default('standard'),
  discussionTimerSeconds: z.number().int().min(30).max(300).default(60),
  votingTimerSeconds: z.number().int().min(15).max(120).default(60),

  // Phase 2 Survival Mechanics
  timelineMode: z.enum(['procedural', 'custom']).default('procedural'),
  scenarioId: z.string().optional(),
  enableSecretQuests: z.boolean().default(true),
  enableTraitor: z.boolean().default(false), // Recommended only for 6+ players
  enableMinigames: z.boolean().default(true), // Rhythm pickpocket mini-game

  // Superpower Module Configuration
  superpowerDealRound: z.number().int().min(1).max(5).default(3),
  superpowersPerPlayer: z.number().int().min(1).max(2).default(1),
  allowRerollSuperpower: z.boolean().default(false)
});

export type LobbySettingsInput = z.input<typeof LobbySettingsSchema>;
export type LobbySettingsOutput = z.output<typeof LobbySettingsSchema>;

export const defaultLobbySettings: ILobbySettings = LobbySettingsSchema.parse({});
