import { z } from 'zod';

// Keep in sync with the backend (src/validators/examValidators.ts)
export const saveExamSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(150, 'Title must be at most 150 characters'),
  description: z.string().trim().max(500, 'Description must be at most 500 characters'),
  durationMinutes: z
    .number({ error: 'Enter how long students get' })
    .int('Use a whole number of minutes')
    .min(1, 'Duration must be at least 1 minute')
    .max(300, 'Duration must be at most 300 minutes'),
});

export type SaveExamFormData = z.infer<typeof saveExamSchema>;
