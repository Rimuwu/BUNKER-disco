export type BunkerResource =
  | 'food'
  | 'water'
  | 'air'
  | 'medicine'
  | 'power'
  | 'morale';

export const BUNKER_RESOURCES: BunkerResource[] = [
  'food',
  'water',
  'air',
  'medicine',
  'power',
  'morale'
];

export const DEFAULT_RESOURCE_BASELINES: Record<BunkerResource, number> = {
  food: 30,
  water: 30,
  air: 100,
  medicine: 15,
  power: 50,
  morale: 10
};

export const DAILY_CONSUMPTION_PER_CAPITA = {
  food: 1,
  water: 1,
  air: 0 // baseline ventilation handles unless defective
};
