import { z } from 'zod';

export const approvalSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  comment: z.string().max(1000).optional().nullable(),
});

export type ApprovalFormValues = z.infer<typeof approvalSchema>;
