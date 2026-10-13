'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { generateQuestions } from '@/lib/features/questions/questionsSlice';
import type { Material } from '@/lib/features/materials/materialsSlice';
import {
  DIFFICULTY_OPTIONS,
  QUESTION_TYPE_OPTIONS,
  MAX_QUESTIONS_PER_REQUEST,
  generateQuestionsSchema,
  type GenerateQuestionsFormData,
} from '@/lib/validations/question';
import { TextField } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { FormAlert } from '@/components/shared/FormAlert';
import { LoadingButton } from '@/components/shared/LoadingButton';

interface GenerateQuestionsFormProps {
  // Only materials that have finished processing
  materials: Material[];
  // True when there are already questions on screen that a new run would replace
  hasQuestions: boolean;
}

export function GenerateQuestionsForm({ materials, hasQuestions }: GenerateQuestionsFormProps) {
  const dispatch = useAppDispatch();
  const { generating, error } = useAppSelector((state) => state.questions);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GenerateQuestionsFormData>({
    resolver: zodResolver(generateQuestionsSchema),
    defaultValues: {
      materialId: materials.length === 1 ? String(materials[0].id) : '',
      count: 5,
      difficulty: 'medium',
      type: 'short_answer',
      marks: 5,
      topic: '',
    },
  });

  const onSubmit = ({ materialId, topic, ...rest }: GenerateQuestionsFormData) => {
    dispatch(generateQuestions({ ...rest, materialId: Number(materialId), topic: topic || undefined }));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormAlert message={error} />

      <Controller
        name="materialId"
        control={control}
        render={({ field }) => (
          <SelectField
            id="materialId"
            label="Material"
            placeholder="Choose the notes to generate from"
            value={field.value}
            onChange={field.onChange}
            options={materials.map((material) => ({ value: String(material.id), label: material.original_name }))}
            error={errors.materialId?.message}
            disabled={generating}
          />
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Number of questions"
          type="number"
          min={1}
          max={MAX_QUESTIONS_PER_REQUEST}
          error={errors.count?.message}
          disabled={generating}
          {...register('count', { valueAsNumber: true })}
        />

        <TextField
          label="Marks per question"
          type="number"
          min={1}
          max={100}
          error={errors.marks?.message}
          disabled={generating}
          {...register('marks', { valueAsNumber: true })}
        />

        <Controller
          name="difficulty"
          control={control}
          render={({ field }) => (
            <SelectField
              id="difficulty"
              label="Difficulty"
              value={field.value}
              onChange={field.onChange}
              options={DIFFICULTY_OPTIONS}
              error={errors.difficulty?.message}
              disabled={generating}
            />
          )}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <SelectField
              id="type"
              label="Question type"
              value={field.value}
              onChange={field.onChange}
              options={QUESTION_TYPE_OPTIONS}
              error={errors.type?.message}
              disabled={generating}
            />
          )}
        />
      </div>

      <TextField
        label="Focus topic (optional)"
        placeholder="e.g. The Calvin cycle — leave empty to cover the whole material"
        error={errors.topic?.message}
        disabled={generating}
        {...register('topic')}
      />

      <LoadingButton type="submit" loading={generating} loadingText="Generating questions..." className="h-11 w-full">
        <Sparkles />
        {hasQuestions ? 'Generate again' : 'Generate Questions'}
      </LoadingButton>

      <p className="text-center text-xs text-muted-foreground">
        {generating
          ? 'The AI is reading your material and writing questions. This can take up to a minute.'
          : hasQuestions && 'Generating again replaces the questions below, including your edits.'}
      </p>
    </form>
  );
}
