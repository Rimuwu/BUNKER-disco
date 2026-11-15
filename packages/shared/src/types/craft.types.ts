export interface ICraftRecipe {
  id: string; // e.g. "craft_adv_medkit"
  ingredient1Id: string;
  ingredient2Id: string;
  resultItemId?: string;
  resultName: string;
  resultNameEn: string;
  icon: string;
  mechanicalEffect: string;
}
