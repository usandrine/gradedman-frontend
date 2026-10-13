import { z } from 'zod';

// Keep in sync with the backend (src/validators/questionValidators.ts)
export const MAX_QUESTIONS_PER_REQUEST = 20;

export const QUESTION_TYPE_OPTIONS = [
  { value: 'short_answer', label: 'Short answer' },
  { value: 'multiple_choice', label: 'Multiple choice' },
] as const;

export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
] as const;

export const generateQuestionsSchema = z.object({
  materialId: z.string().min(1, 'Please choose a material'),
  count: z
    .number({ error: 'Enter how many questions you want' })
    .int('Use a whole number')
    .min(1, 'Generate at least 1 question')
    .max(MAX_QUESTIONS_PER_REQUEST, `Generate at most ${MAX_QUESTIONS_PER_REQUEST} questions at a time`),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  type: z.enum(['short_answer', 'multiple_choice']),
  marks: z
    .number({ error: 'Enter the marks for each question' })
    .int('Use a whole number')
    .min(1, 'Marks must be at least 1')
    .max(100, 'Marks must be at most 100'),
  topic: z.string().trim().max(200, 'Topic must be at most 200 characters'),
});

export type GenerateQuestionsFormData = z.infer<typeof generateQuestionsSchema>;
