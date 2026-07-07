import { z } from 'zod';

export const reportFilterSchema = z.object({
  type: z.enum(['inspection', 'defect', 'maintenance', 'compliance']),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  plantId: z.string().optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
});

export type ReportFilterFormValues = z.infer<typeof reportFilterSchema>;
