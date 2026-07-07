import { z } from 'zod';

export const defectSchema = z.object({
  assetId: z.string().uuid('Select an asset'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.string().min(1, 'Category is required').max(64),
  description: z.string().min(10, 'Provide a description of at least 10 characters').max(2000),
  photoUrls: z.array(z.string().url()).optional().default([]),
});

export type DefectFormValues = z.infer<typeof defectSchema>;
