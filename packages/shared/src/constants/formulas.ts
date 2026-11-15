export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 20;
export const AP_PER_ROUND = 3;
export const SURVIVAL_DAYS = 30;

/**
 * Strict table invariant per ADR-02 and docs/mechanics/gameplay.md:
 * Bunker capacity K = Math.floor(N / 2)
 */
export function calculateBunkerCapacity(playerCount: number): number {
  if (playerCount < MIN_PLAYERS) {
    throw new Error(`Player count ${playerCount} is below minimum allowed (${MIN_PLAYERS})`);
  }
  return Math.floor(playerCount / 2);
}

/**
 * Elimination rounds R = Math.ceil(N / 2)
 */
export function calculateEliminationRounds(playerCount: number): number {
  if (playerCount < MIN_PLAYERS) {
    throw new Error(`Player count ${playerCount} is below minimum allowed (${MIN_PLAYERS})`);
  }
  return Math.ceil(playerCount / 2);
}
