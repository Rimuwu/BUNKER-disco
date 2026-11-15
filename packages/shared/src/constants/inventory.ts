export interface IBackpackCapacity {
  slots: number;
  maxWeight: number;
}

/**
 * Calculates backpack slots and weight limit based on player's Constitution (Телосложение).
 * Rules per docs/cards/items.md:16-25:
 * 1-2: 3 slots, 8 weight units
 * 3-4: 3 slots, 11 weight units
 * 5-6: 4 slots, 14 weight units
 * 7+: 4 slots, 18 weight units
 */
export function getBackpackCapacity(constitution: number): IBackpackCapacity {
  if (constitution <= 2) {
    return { slots: 3, maxWeight: 8 };
  } else if (constitution <= 4) {
    return { slots: 3, maxWeight: 11 };
  } else if (constitution <= 6) {
    return { slots: 4, maxWeight: 14 };
  } else {
    return { slots: 4, maxWeight: 18 };
  }
}

/**
 * Items of weight 5 are bulky and occupy 2 slots.
 * Items of weight 1-4 occupy 1 slot.
 */
export function calculateItemSlots(weight: number): 1 | 2 {
  return weight >= 5 ? 2 : 1;
}
