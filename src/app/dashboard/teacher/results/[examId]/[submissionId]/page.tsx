'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, RotateCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchSubmission, regradeSubmission } from '@/lib/features/results/resultsSlice';
import { ProctoringReport } from '@/components/results/ProctoringReport';
import { ResultView } from '@/components/results/ResultView';
import { BackLink } from '@/components/shared/BackLink';
import { FormAlert } from '@/components/shared/FormAlert';
import { LoadingButton } from '@/components/shared/LoadingButton';
import { PageHeader } from '@/components/shared/PageHeader';

export default function TeacherSubmissionPage() {
  const params = useParams<{ examId: string; submissionId: string }>();
  const examId = Number(params.examId);
  const submissionId = Number(params.submissionId);

  const dispatch = useAppDispatch();
  const { result, resultStatus, regrading, error } = useAppSelector((state) => state.results);

  useEffect(() => {
    dispatch(fetchSubmission({ examId, submissionId }));
  }, [examId, submissionId, dispatch]);

  const current = result?.submission_id === submissionId ? result : null;
  const backHref = `/dashboard/teacher/results/${examId}`;

  if (!current) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <BackLink href={backHref}>Back to exam results</BackLink>
        {resultStatus === 'failed' ? (
          <FormAlert message={error} />
        ) : (
          <Loader2 className="mx-auto my-12 size-6 animate-spin text-primary" />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackLink href={backHref}>Back to exam results</BackLink>

      <PageHeader
        title={current.student?.name ?? 'Student'}
        description={`${current.exam.title}${current.student ? ` · ${current.student.email}` : ''}`}
        action={
          <LoadingButton
            variant="outline"
            loading={regrading}
            loadingText="Grading..."
            onClick={() => dispatch(regradeSubmission({ examId, submissionId }))}
          >
            <RotateCw />
            Grade again
          </LoadingButton>
        }
      />

      <FormAlert message={error} />

      {current.proctoring && <ProctoringReport report={current.proctoring} />}

      <ResultView result={current} />
    </div>
  );
}
