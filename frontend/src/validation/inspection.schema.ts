import { z } from 'zod';

/**
 * Schema for inspection item responses (per checklist template item).
 * Full form-level schema is built dynamically in the Inspection form
 * based on the asset type's checklist template — see Week 2 build.
 */
export const inspectionItemResultSchema = z.object({
  result: z.enum(['pass', 'fail', 'na']),
  notes: z.string().max(500).optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
});

export type InspectionItemResultFormValues = z.infer<typeof inspectionItemResultSchema>;
