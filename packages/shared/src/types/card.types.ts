/**
 * Card Origin Tags strictly enforcing GEMINI.md § 2:
 * [BASE] - Classic base game "Bunker" (3.0 / 3.1)
 * [ALPHA] - "Bunker: Generation Alpha" expansion
 * [EXPANSION] - Other official expansions (e.g. Bunker-B)
 * [NEW] - Authorial content designed specifically for PC BUNKER-disco
 */
export type CardOriginTag = 'BASE' | 'ALPHA' | 'EXPANSION' | 'NEW';

/**
 * 16 card categories spanning all core and expansion decks
 */
export type CardCategory =
  | 'profession'
  | 'biology_age'
  | 'biology_gender'
  | 'health'
  | 'hobby'
  | 'item'
  | 'fact'
  | 'special_condition'
  | 'catastrophe'
  | 'threat'
  | 'bunker_room'
  | 'bunker_defect'
  | 'bunker_archetype'
  | 'superpower'
  | 'phobia'
  | 'character';

/**
 * Core interface matching PROJECT.md § Interface Contracts § 1
 */
export interface ICardDocument {
  cardId: string;
  category: CardCategory;
  originTag: CardOriginTag;
  name: string;
  nameEn: string;
  description: string;
  flavorText?: string;
  metadata?: Record<string, any>;
}

// ---------------------------------------------------------------------------
// 1. Profession Deck
// ---------------------------------------------------------------------------
export type ProfessionDomain =
  | 'MEDICINE'
  | 'ENGINEERING'
  | 'SECURITY'
  | 'SCIENCE'
  | 'PSYCHOLOGY_DIPLOMACY'
  | 'SURVIVAL'
  | 'CRIMINAL'
  | 'OTHER';

export interface IProfessionAbility {
  name: string;
  description: string;
  apCost: number; // 1-3 AP
  cooldownRounds: number; // 0 = every round, 1..5
  oncePerGame?: boolean;
  isReaction?: boolean;
}

export interface IProfessionMetadata {
  domain: ProfessionDomain;
  activeAbility: IProfessionAbility;
  survivalPassive: string;
}

// ---------------------------------------------------------------------------
// 2. Biology Deck (Age & Gender)
// ---------------------------------------------------------------------------
export interface IBiologyStats {
  phys: number;
  psych: number;
  soc: number;
  med: number;
}

export interface IBiologyAgeMetadata {
  ageRange: string;
  stats: IBiologyStats;
  resourceMultiplier: number;
  specialRule?: string;
  roleplayHint: string;
}

export interface IBiologyGenderMetadata {
  gameplayEffect: string;
  hasSocialReactionRoll: boolean;
  roleplayHint: string;
  pronounRule?: string;
}

// ---------------------------------------------------------------------------
// 3. Health Deck
// ---------------------------------------------------------------------------
export type HealthStealthTier = 'OPEN' | 'PARTIALLY_HIDDEN' | 'HIDDEN';

export interface IHealthMetadata {
  stealthTier: HealthStealthTier;
  selectionPhaseEffect: string;
  survivalPhaseEffect: string;
}

// ---------------------------------------------------------------------------
// 4. Hobby Deck
// ---------------------------------------------------------------------------
export interface IHobbyMetadata {
  survivalEffect: string;
  selectionBonus: string;
  synergies: {
    professions: string[];
    items: string[];
  };
}

// ---------------------------------------------------------------------------
// 5. Item Deck
// ---------------------------------------------------------------------------
export type ItemCategory =
  | 'TOOLS'
  | 'MEDICINE'
  | 'FOOD_WATER'
  | 'WEAPONS'
  | 'TECH'
  | 'CLOTHING'
  | 'DOCUMENTS'
  | 'PERSONAL';

export type ItemWeight = 1 | 2 | 3 | 4 | 5;

export interface IItemMetadata {
  itemCategory: ItemCategory;
  weight: ItemWeight;
  slotsOccupied: 1 | 2;
  isQuestItem?: boolean;
  selectionPhaseEffect: string;
  survivalPhaseEffect: string;
  canBeCraftedResult?: boolean;
}

// ---------------------------------------------------------------------------
// 6. Fact Deck
// ---------------------------------------------------------------------------
export type FactSubcategory = 'MECHANIC' | 'FLAVOR';

export interface IFactMetadata {
  subcategory: FactSubcategory;
  statModifiers?: Partial<IBiologyStats>;
  specialRule?: string;
}

// ---------------------------------------------------------------------------
// 7. Special Condition / Quest Deck
// ---------------------------------------------------------------------------
export type SpecialConditionType = 'PASSIVE' | 'ACTIVE' | 'QUEST';
export type GamePhaseMoment = 'SELECTION' | 'SURVIVAL' | 'BOTH';

export interface ISpecialConditionMetadata {
  conditionType: SpecialConditionType;
  moment: GamePhaseMoment;
  revealTiming: string;
  mechanic: string;
  victoryCondition?: string;
}

// ---------------------------------------------------------------------------
// 8. Catastrophe Deck
// ---------------------------------------------------------------------------
export interface ICatastropheMetadata {
  code: string; // e.g. "К-01"
  initialResources: {
    food: number;
    water: number;
    air: number;
    medicine: number;
  };
  specialCrisisRule: string;
  criticalDeficit: string;
  vulnerableCards: string;
}

// ---------------------------------------------------------------------------
// 9. Threat Deck
// ---------------------------------------------------------------------------
export type ThreatTier = 'FREQUENT' | 'RARE' | 'UNIQUE';

export interface IThreatMetadata {
  code: string; // e.g. "У-01"
  tier: ThreatTier;
  mechanicalPenalty: string;
  counterSpecialists: string[];
  neutralizationAction: string;
}

// ---------------------------------------------------------------------------
// 10. Bunker Rooms, Defects & Archetypes
// ---------------------------------------------------------------------------
export interface IBunkerRoomMetadata {
  powerDraw: number;
  waterDraw: number;
  foodOutput: number;
  workerCapacity: number;
  effectiveProfessions: string[];
  roomEvents: string[];
  roomUpgrades: string[];
}

export interface IBunkerDefectMetadata {
  defectCode: string; // e.g. "DEF-01"
  failurePenalty: string;
  repairRequirements: {
    tools: string[];
    professions: string[];
    days: number;
  };
}

export interface IBunkerArchetypeMetadata {
  voxelStyle: string;
  startingRooms: string[];
  startingResources: {
    food: number;
    water: number;
    air: number;
    medicine: number;
    power: number;
    morale: number;
  };
  uniqueRule: string;
  drawback: string;
}

// ---------------------------------------------------------------------------
// 11. Superpower Expansion Deck
// ---------------------------------------------------------------------------
export interface ISuperpowerMetadata {
  code: string; // e.g. "СП-01"
  passivePerk: string;
  activeAbility?: {
    name: string;
    description: string;
    apCost: number;
    cooldownDays: number;
  };
  selectionArgument: string;
}

// ---------------------------------------------------------------------------
// 12. Phobia Expansion Deck
// ---------------------------------------------------------------------------
export interface IPhobiaMetadata {
  code: string; // e.g. "Ф-01"
  fearDescription: string;
  panicTrigger: string;
  selectionDebateImpact: string;
  survivalPenalty: string;
}

// ---------------------------------------------------------------------------
// 13. Character Traits Expansion Deck
// ---------------------------------------------------------------------------
export interface ICharacterMetadata {
  code: string; // e.g. "Х-01"
  psychologicalPortrait: string;
  speechStyleGuide: string;
  selectionModifier: string;
  survivalEffect: string;
  conflictsWith?: string[];
  synergiesWith?: string[];
}
