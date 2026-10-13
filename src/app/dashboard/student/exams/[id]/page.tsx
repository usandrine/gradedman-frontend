'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { startExam } from '@/lib/features/exams/studentExamsSlice';
import { Button } from '@/components/ui/button';
import { ExamRunner } from '@/components/exams/ExamRunner';
import { FormAlert } from '@/components/shared/FormAlert';

export default function TakeExamPage() {
  const examId = Number(useParams<{ id: string }>().id);
  const dispatch = useAppDispatch();
  const { attempt, attemptStatus, attemptError } = useAppSelector((state) => state.studentExams);

  // Starts the attempt, or resumes it — the timer keeps running on the server either way
  useEffect(() => {
    dispatch(startExam(examId));
  }, [examId, dispatch]);

  if (attempt && attempt.exam.id === examId) {
    return <ExamRunner key={attempt.submission.id} attempt={attempt} />;
  }

  if (attemptStatus === 'failed') {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <FormAlert message={attemptError} />
        <Button variant="outline" asChild>
          <Link href="/dashboard/student/exams">Back to exams</Link>
        </Button>
      </div>
    );
  }

  return <Loader2 className="mx-auto my-12 size-6 animate-spin text-primary" />;
}
