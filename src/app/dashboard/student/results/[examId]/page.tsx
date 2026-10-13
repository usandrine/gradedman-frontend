'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchMyResult } from '@/lib/features/results/resultsSlice';
import { ResultView } from '@/components/results/ResultView';
import { BackLink } from '@/components/shared/BackLink';
import { FormAlert } from '@/components/shared/FormAlert';
import { PageHeader } from '@/components/shared/PageHeader';

const POLL_INTERVAL_MS = 3000;

export default function StudentResultPage() {
  const examId = Number(useParams<{ examId: string }>().examId);
  const dispatch = useAppDispatch();
  const { result, resultStatus, error } = useAppSelector((state) => state.results);

  useEffect(() => {
    dispatch(fetchMyResult({ examId }));
  }, [examId, dispatch]);

  const current = result?.exam.id === examId ? result : null;

  // Still being graded — keep checking until the marks arrive
  const waiting = current?.status === 'submitted' && !current.grading_error;

  useEffect(() => {
    if (!waiting) return;

    const timer = setInterval(() => dispatch(fetchMyResult({ examId, silent: true })), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [waiting, examId, dispatch]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackLink href="/dashboard/student/results">Back to My Results</BackLink>

      {current ? (
        <>
          <PageHeader title={current.exam.title} description="Your marked answers, with feedback on each one." />
          <ResultView result={current} />
        </>
      ) : resultStatus === 'failed' ? (
        <FormAlert message={error} />
      ) : (
        <Loader2 className="mx-auto my-12 size-6 animate-spin text-primary" />
      )}
    </div>
  );
}
