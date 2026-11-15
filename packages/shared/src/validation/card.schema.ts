import { z } from 'zod';

export const CardOriginTagSchema = z.enum(['BASE', 'ALPHA', 'EXPANSION', 'NEW']);

export const CardCategorySchema = z.enum([
  'profession',
  'biology_age',
  'biology_gender',
  'health',
  'hobby',
  'item',
  'fact',
  'special_condition',
  'catastrophe',
  'threat',
  'bunker_room',
  'bunker_defect',
  'bunker_archetype',
  'superpower',
  'phobia',
  'character'
]);

export const CardDocumentSchema = z.object({
  cardId: z.string().min(1),
  category: CardCategorySchema,
  originTag: CardOriginTagSchema,
  name: z.string().min(1),
  nameEn: z.string().min(1),
  description: z.string(),
  flavorText: z.string().optional(),
  metadata: z.record(z.any()).optional()
});
