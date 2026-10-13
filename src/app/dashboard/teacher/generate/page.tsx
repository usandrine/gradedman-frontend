'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Upload } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchMaterials } from '@/lib/features/materials/materialsSlice';
import { clearQuestions, removeQuestion, updateQuestion } from '@/lib/features/questions/questionsSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SaveExamForm } from '@/components/exams/SaveExamForm';
import { GenerateQuestionsForm } from '@/components/questions/GenerateQuestionsForm';
import { QuestionCard } from '@/components/questions/QuestionCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { FormAlert } from '@/components/shared/FormAlert';
import { PageHeader } from '@/components/shared/PageHeader';

export default function GenerateQuestionsPage() {
  const dispatch = useAppDispatch();
  const materials = useAppSelector((state) => state.materials);
  const { items: questions, sourceName, notice } = useAppSelector((state) => state.questions);

  useEffect(() => {
    dispatch(fetchMaterials());
  }, [dispatch]);

  const readyMaterials = materials.items.filter((material) => material.status === 'ready');
  const materialsLoaded = materials.status === 'succeeded' || materials.items.length > 0;
  const totalMarks = questions.reduce((sum, question) => sum + question.marks, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Generate Questions"
        description="Let AI write exam questions from your uploaded materials, then review and edit them."
      />

      <Card>
        <CardHeader>
          <CardTitle>Exam parameters</CardTitle>
          <CardDescription>Questions are written only from the material you choose.</CardDescription>
        </CardHeader>
        <CardContent>
          {!materialsLoaded ? (
            materials.status === 'failed' ? (
              <FormAlert message={materials.error} />
            ) : (
              <Loader2 className="mx-auto my-8 size-6 animate-spin text-primary" />
            )
          ) : readyMaterials.length === 0 ? (
            <EmptyState
              icon={Upload}
              title="No material is ready yet"
              description={
                materials.items.length === 0
                  ? 'Upload your study notes first — questions are generated from them.'
                  : 'Your materials are still being processed, or processing failed. Check them on the upload page.'
              }
              action={
                <Button asChild>
                  <Link href="/dashboard/teacher/upload">Go to Upload Materials</Link>
                </Button>
              }
            />
          ) : (
            <GenerateQuestionsForm materials={readyMaterials} hasQuestions={questions.length > 0} />
          )}
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-brand-950">
                {questions.length} {questions.length === 1 ? 'question' : 'questions'} · {totalMarks} marks
              </h2>
              {sourceName && <p className="text-sm text-muted-foreground">Generated from {sourceName}</p>}
            </div>
            <Button variant="outline" onClick={() => dispatch(clearQuestions())}>
              Clear all
            </Button>
          </div>

          <FormAlert message={notice} />

          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              number={index + 1}
              onSave={(updated) => dispatch(updateQuestion(updated))}
              onRemove={(id) => dispatch(removeQuestion(id))}
            />
          ))}

          <Card>
            <CardHeader>
              <CardTitle>Save as exam</CardTitle>
              <CardDescription>
                Happy with the questions above? Save them as an exam. Unsaved questions are lost if you refresh.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SaveExamForm questions={questions} />
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
