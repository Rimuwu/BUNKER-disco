import { z } from 'zod';

export const CraftRecipeSchema = z.object({
  id: z.string().min(1),
  ingredient1Id: z.string().min(1),
  ingredient2Id: z.string().min(1),
  resultItemId: z.string().optional(),
  resultName: z.string().min(1),
  resultNameEn: z.string().min(1),
  icon: z.string().min(1),
  mechanicalEffect: z.string().min(1)
});
