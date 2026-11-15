export interface IBunkerResources {
  food: number;
  water: number;
  air: number;
  medicine: number;
  power: number;
  morale: number;
}

export interface IResourceDeficitTracker {
  foodZeroDays: number;
  waterZeroDays: number;
  airZeroDays: number;
  moraleZeroDays: number;
}

export class ResourceManager {
  public static getInitialResources(archetypeMetadata?: any): IBunkerResources {
    return {
      food: archetypeMetadata?.startingResources?.food ?? 50,
      water: archetypeMetadata?.startingResources?.water ?? 60,
      air: 100, // Percentage
      medicine: archetypeMetadata?.startingResources?.medicine ?? 25,
      power: archetypeMetadata?.startingResources?.power ?? 50,
      morale: archetypeMetadata?.startingResources?.morale ?? 75,
    };
  }

  public static calculateDailyConsumption(
    survivorsCount: number,
    activeRoomPowerDraw = 0,
    modifiers: {
      foodMultiplier?: number;
      waterMultiplier?: number;
      isVentilationOnline?: boolean;
      moraleDecay?: number;
    } = {}
  ): {
    consumption: IBunkerResources;
    deltas: IBunkerResources;
  } {
    const foodMulti = modifiers.foodMultiplier ?? 1.0;
    const waterMulti = modifiers.waterMultiplier ?? 1.0;
    const ventOnline = modifiers.isVentilationOnline !== false;
    const moraleDecay = modifiers.moraleDecay ?? 1.0;

    // Daily per-capita rates
    const foodConsumed = survivorsCount * 1.0 * foodMulti;
    const waterConsumed = survivorsCount * 1.5 * waterMulti;
    // Air is sustained by ventilation if online; if disabled/damaged, drops by 0.5 per person
    const airConsumed = ventOnline ? 0 : survivorsCount * 0.5;
    const medicineConsumed = 0; // consumed reactively
    const powerConsumed = 2.0 + activeRoomPowerDraw;
    const moraleConsumed = moraleDecay;

    return {
      consumption: {
        food: Number(foodConsumed.toFixed(1)),
        water: Number(waterConsumed.toFixed(1)),
        air: Number(airConsumed.toFixed(1)),
        medicine: medicineConsumed,
        power: Number(powerConsumed.toFixed(1)),
        morale: Number(moraleConsumed.toFixed(1)),
      },
      deltas: {
        food: -Number(foodConsumed.toFixed(1)),
        water: -Number(waterConsumed.toFixed(1)),
        air: -Number(airConsumed.toFixed(1)),
        medicine: 0,
        power: -Number(powerConsumed.toFixed(1)),
        morale: -Number(moraleConsumed.toFixed(1)),
      },
    };
  }

  public static applyDeltas(
    current: IBunkerResources,
    deltas: Partial<IBunkerResources>
  ): {
    updated: IBunkerResources;
    clampedDeltas: Partial<IBunkerResources>;
  } {
    const updated: IBunkerResources = {
      food: Math.max(0, Number(((current.food ?? 0) + (deltas.food ?? 0)).toFixed(1))),
      water: Math.max(0, Number(((current.water ?? 0) + (deltas.water ?? 0)).toFixed(1))),
      air: Math.max(0, Math.min(100, Number(((current.air ?? 100) + (deltas.air ?? 0)).toFixed(1)))),
      medicine: Math.max(0, Number(((current.medicine ?? 0) + (deltas.medicine ?? 0)).toFixed(1))),
      power: Math.max(0, Number(((current.power ?? 0) + (deltas.power ?? 0)).toFixed(1))),
      morale: Math.max(0, Math.min(100, Number(((current.morale ?? 75) + (deltas.morale ?? 0)).toFixed(1)))),
    };

    return { updated, clampedDeltas: deltas };
  }

  public static evaluateDeficits(
    resources: IBunkerResources,
    tracker: IResourceDeficitTracker
  ): {
    updatedTracker: IResourceDeficitTracker;
    penalties: {
      starvationCasualties: number;
      dehydrationDamage: number;
      airCatastrophe: boolean;
      desertionTriggered: boolean;
    };
  } {
    const updatedTracker: IResourceDeficitTracker = { ...tracker };

    // Food deficit
    if (resources.food <= 0) {
      updatedTracker.foodZeroDays += 1;
    } else {
      updatedTracker.foodZeroDays = 0;
    }

    // Water deficit
    if (resources.water <= 0) {
      updatedTracker.waterZeroDays += 1;
    } else {
      updatedTracker.waterZeroDays = 0;
    }

    // Air deficit
    if (resources.air <= 0) {
      updatedTracker.airZeroDays += 1;
    } else {
      updatedTracker.airZeroDays = 0;
    }

    // Morale deficit
    if (resources.morale <= 0) {
      updatedTracker.moraleZeroDays += 1;
    } else {
      updatedTracker.moraleZeroDays = 0;
    }

    const starvationCasualties = updatedTracker.foodZeroDays >= 3 ? 1 : 0;
    const dehydrationDamage = updatedTracker.waterZeroDays >= 2 ? 30 : 0;
    const airCatastrophe = resources.air <= 0;
    const desertionTriggered = updatedTracker.moraleZeroDays >= 1;

    return {
      updatedTracker,
      penalties: {
        starvationCasualties,
        dehydrationDamage,
        airCatastrophe,
        desertionTriggered,
      },
    };
  }
}
