export interface IProfessionSynergy {
  id: string; // e.g. "syn_doc_pharm"
  profession1Id: string;
  profession2Id: string;
  description: string;
  bonusEffect: {
    resourceMultiplier?: { resource: string; factor: number };
    customEffect: string;
  };
}
