import { Db } from 'mongodb';

export interface IScenarioDocument {
  _id?: string;
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
  catastropheId: string;
  bunkerType: string;
  initialDefects: string[];
  initialResources: {
    food: number;
    water: number;
    air: number;
    medicine: number;
    power: number;
    morale: number;
  };
  timeline: Array<{
    day: number;
    threatId?: string;
    defectId?: string;
    specialEvent?: string;
  }>;
  isOfficial?: boolean;
  createdAt: Date;
}

export const OFFICIAL_SCENARIOS: IScenarioDocument[] = [
  {
    id: 'scenario_nuclear_winter',
    title: 'Ядерная зима',
    description: 'Массированный ядерный удар. Температура на поверхности падает до -50°C. Радиационный фон критический.',
    difficulty: 'normal',
    catastropheId: 'cat_nuclear_strike',
    bunkerType: 'military',
    initialDefects: [],
    initialResources: {
      food: 100,
      water: 100,
      air: 100,
      medicine: 80,
      power: 90,
      morale: 70,
    },
    timeline: [
      { day: 3, threatId: 'threat_radiation_leak' },
      { day: 7, threatId: 'threat_water_filter_clog' },
      { day: 15, threatId: 'threat_generator_fault' },
      { day: 25, specialEvent: 'air_purifier_overload' },
    ],
    isOfficial: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'scenario_zombie_pandemic',
    title: 'Вирус «Штамм-Z»',
    description: 'Вспышка агрессивного нейротропного патогена. Внешний периметр осаждён инфицированными.',
    difficulty: 'hard',
    catastropheId: 'cat_zombie_virus',
    bunkerType: 'medical',
    initialDefects: ['defect_quarantine_breach'],
    initialResources: {
      food: 80,
      water: 90,
      air: 100,
      medicine: 120,
      power: 80,
      morale: 60,
    },
    timeline: [
      { day: 5, threatId: 'threat_infection_vector' },
      { day: 12, threatId: 'threat_perimeter_breach' },
      { day: 20, threatId: 'threat_supplies_spoilage' },
    ],
    isOfficial: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  },
];

export class ScenarioRepository {
  private inMemoryScenarios = new Map<string, IScenarioDocument>();

  constructor(private db: Db | null = null) {
    for (const sc of OFFICIAL_SCENARIOS) {
      this.inMemoryScenarios.set(sc.id, sc);
    }
  }

  public setDb(db: Db | null): void {
    this.db = db;
  }

  public async findAll(): Promise<IScenarioDocument[]> {
    if (this.db) {
      const dbScenarios = await this.db.collection<IScenarioDocument>('scenarios').find({}).toArray();
      if (dbScenarios.length > 0) return dbScenarios;
    }
    return Array.from(this.inMemoryScenarios.values());
  }

  public async findById(id: string): Promise<IScenarioDocument | null> {
    if (this.db) {
      const found = await this.db.collection<IScenarioDocument>('scenarios').findOne({ id });
      if (found) return found;
    }
    return this.inMemoryScenarios.get(id) || null;
  }

  public async create(data: Omit<IScenarioDocument, 'createdAt'> & { createdAt?: Date }): Promise<IScenarioDocument> {
    const doc: IScenarioDocument = {
      ...data,
      id: data.id || `custom_sc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: data.createdAt || new Date(),
    };

    if (this.db) {
      await this.db.collection('scenarios').insertOne({ ...doc } as any);
    }
    this.inMemoryScenarios.set(doc.id, doc);
    return doc;
  }
}
