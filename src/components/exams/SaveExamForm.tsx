'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { createExam } from '@/lib/features/exams/examsSlice';
import { clearQuestions, type Question } from '@/lib/features/questions/questionsSlice';
import { saveExamSchema, type SaveExamFormData } from '@/lib/validations/exam';
import { TextField } from '@/components/forms/FormField';
import { FormAlert } from '@/components/shared/FormAlert';
import { LoadingButton } from '@/components/shared/LoadingButton';

// Turns the reviewed questions into a draft exam, then goes to My Exams
export function SaveExamForm({ questions }: { questions: Question[] }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { saving, saveError } = useAppSelector((state) => state.exams);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SaveExamFormData>({
    resolver: zodResolver(saveExamSchema),
    defaultValues: { title: '', description: '', durationMinutes: 30 },
  });

  const onSubmit = async ({ title, description, durationMinutes }: SaveExamFormData) => {
    const result = await dispatch(
      createExam({
        title,
        description: description || undefined,
        durationMinutes,
        // Everything except the client-side id — the server assigns its own
        questions: questions.map(({ type, difficulty, question, options, correct_option, answer, marks }) => ({
          type,
          difficulty,
          question,
          options,
          correct_option,
          answer,
          marks,
        })),
      })
    );

    if (createExam.fulfilled.match(result)) {
      dispatch(clearQuestions());
      router.push('/dashboard/teacher/exams');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormAlert message={saveError} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <TextField
            label="Exam title"
            placeholder="e.g. Biology — Photosynthesis quiz"
            error={errors.title?.message}
            disabled={saving}
            {...register('title')}
          />
        </div>
        <TextField
          label="Duration (minutes)"
          type="number"
          min={1}
          max={300}
          error={errors.durationMinutes?.message}
          disabled={saving}
          {...register('durationMinutes', { valueAsNumber: true })}
        />
      </div>

      <TextField
        label="Instructions for students (optional)"
        placeholder="e.g. Answer all questions in your own words"
        error={errors.description?.message}
        disabled={saving}
        {...register('description')}
      />

      <LoadingButton type="submit" loading={saving} loadingText="Saving exam..." className="h-11 w-full">
        <Save />
        Save as exam
      </LoadingButton>

      <p className="text-center text-xs text-muted-foreground">
        The exam is saved as a draft. Students only see it after you publish it from My Exams.
      </p>
    </form>
  );
}
