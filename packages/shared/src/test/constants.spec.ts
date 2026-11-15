import { describe, it, expect } from 'vitest';
import {
  calculateBunkerCapacity,
  calculateEliminationRounds,
  MIN_PLAYERS,
  MAX_PLAYERS,
  AP_PER_ROUND
} from '../constants/formulas.js';
import { getBackpackCapacity, calculateItemSlots } from '../constants/inventory.js';

describe('Gameplay Formulas & Constants', () => {
  it('strictly computes bunker capacity K = floor(N / 2) for all valid player counts (2..20)', () => {
    // 2 players -> 1
    expect(calculateBunkerCapacity(2)).toBe(1);
    // 3 players -> 1
    expect(calculateBunkerCapacity(3)).toBe(1);
    // 4 players -> 2
    expect(calculateBunkerCapacity(4)).toBe(2);
    // 7 players -> 3
    expect(calculateBunkerCapacity(7)).toBe(3);
    // 10 players -> 5
    expect(calculateBunkerCapacity(10)).toBe(5);
    // 11 players -> 5
    expect(calculateBunkerCapacity(11)).toBe(5);
    // 15 players -> 7
    expect(calculateBunkerCapacity(15)).toBe(7);
    // 20 players -> 10
    expect(calculateBunkerCapacity(20)).toBe(10);
  });

  it('strictly computes elimination rounds R = ceil(N / 2)', () => {
    // 2 players -> 1
    expect(calculateEliminationRounds(2)).toBe(1);
    // 3 players -> 2
    expect(calculateEliminationRounds(3)).toBe(2);
    // 4 players -> 2
    expect(calculateEliminationRounds(4)).toBe(2);
    // 7 players -> 4
    expect(calculateEliminationRounds(7)).toBe(4);
    // 10 players -> 5
    expect(calculateEliminationRounds(10)).toBe(5);
    // 11 players -> 6
    expect(calculateEliminationRounds(11)).toBe(6);
    // 20 players -> 10
    expect(calculateEliminationRounds(20)).toBe(10);
  });

  it('throws error for player counts below minimum (2)', () => {
    expect(() => calculateBunkerCapacity(1)).toThrow();
    expect(() => calculateEliminationRounds(0)).toThrow();
  });

  it('defines AP economy and player limits', () => {
    expect(MIN_PLAYERS).toBe(2);
    expect(MAX_PLAYERS).toBe(20);
    expect(AP_PER_ROUND).toBe(3);
  });

  it('determines constitution-based backpack capacity correctly per docs/cards/items.md', () => {
    // Constitution 1-2: 3 slots, 8 weight
    expect(getBackpackCapacity(1)).toEqual({ slots: 3, maxWeight: 8 });
    expect(getBackpackCapacity(2)).toEqual({ slots: 3, maxWeight: 8 });

    // Constitution 3-4: 3 slots, 11 weight
    expect(getBackpackCapacity(3)).toEqual({ slots: 3, maxWeight: 11 });
    expect(getBackpackCapacity(4)).toEqual({ slots: 3, maxWeight: 11 });

    // Constitution 5-6: 4 slots, 14 weight
    expect(getBackpackCapacity(5)).toEqual({ slots: 4, maxWeight: 14 });
    expect(getBackpackCapacity(6)).toEqual({ slots: 4, maxWeight: 14 });

    // Constitution 7+: 4 slots, 18 weight
    expect(getBackpackCapacity(7)).toEqual({ slots: 4, maxWeight: 18 });
    expect(getBackpackCapacity(10)).toEqual({ slots: 4, maxWeight: 18 });
  });

  it('calculates item slots by weight (weight 5 = 2 slots, weight 1-4 = 1 slot)', () => {
    expect(calculateItemSlots(1)).toBe(1);
    expect(calculateItemSlots(2)).toBe(1);
    expect(calculateItemSlots(3)).toBe(1);
    expect(calculateItemSlots(4)).toBe(1);
    expect(calculateItemSlots(5)).toBe(2);
  });
});
