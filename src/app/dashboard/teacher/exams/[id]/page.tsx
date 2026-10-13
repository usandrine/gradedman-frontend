'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchExam, setExamStatus } from '@/lib/features/exams/examsSlice';
import { Button } from '@/components/ui/button';
import { ExamMeta, ExamStatusBadge } from '@/components/exams/ExamMeta';
import { QuestionCard } from '@/components/questions/QuestionCard';
import { FormAlert } from '@/components/shared/FormAlert';
import { PageHeader } from '@/components/shared/PageHeader';

export default function TeacherExamDetailPage() {
  const examId = Number(useParams<{ id: string }>().id);
  const dispatch = useAppDispatch();
  const { current: exam, currentStatus, error } = useAppSelector((state) => state.exams);

  useEffect(() => {
    dispatch(fetchExam(examId));
  }, [examId, dispatch]);

  const backLink = (
    <Button variant="ghost" size="sm" asChild>
      <Link href="/dashboard/teacher/exams">
        <ArrowLeft />
        Back to My Exams
      </Link>
    </Button>
  );

  // Also covers the moment before the fetch starts, when another exam may still be in state
  if (!exam || exam.id !== examId) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        {backLink}
        {currentStatus === 'failed' ? (
          <FormAlert message={error} />
        ) : (
          <Loader2 className="mx-auto my-12 size-6 animate-spin text-primary" />
        )}
      </div>
    );
  }

  const isPublished = exam.status === 'published';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {backLink}

      <PageHeader
        title={exam.title}
        description={exam.description ?? undefined}
        action={
          <div className="flex items-center gap-2">
            <ExamStatusBadge status={exam.status} />
            <Button
              variant={isPublished ? 'outline' : 'default'}
              onClick={() => dispatch(setExamStatus({ id: exam.id, status: isPublished ? 'draft' : 'published' }))}
            >
              {isPublished ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        }
      />

      <ExamMeta questionCount={exam.question_count} totalMarks={exam.total_marks} durationMinutes={exam.duration_minutes} />

      <FormAlert message={error} />

      <div className="space-y-4">
        {exam.questions.map((question, index) => (
          <QuestionCard key={question.id} question={{ ...question, id: String(question.id) }} number={index + 1} />
        ))}
      </div>
    </div>
  );
}
