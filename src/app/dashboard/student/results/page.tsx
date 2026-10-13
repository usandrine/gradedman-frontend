'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Trophy } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchAvailableExams } from '@/lib/features/exams/studentExamsSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScoreBadge } from '@/components/results/ScoreBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { FormAlert } from '@/components/shared/FormAlert';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatDate, formatPercent } from '@/lib/format';

export default function StudentResultsPage() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.studentExams);

  useEffect(() => {
    dispatch(fetchAvailableExams());
  }, [dispatch]);

  // Exams this student has handed in
  const submitted = items.filter((exam) => exam.submission && exam.submission.status !== 'in_progress');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="My Results" description="Scores and feedback for the exams you have submitted." />

      <FormAlert message={error} />

      {status === 'loading' && items.length === 0 ? (
        <Loader2 className="mx-auto my-12 size-6 animate-spin text-primary" />
      ) : submitted.length === 0 ? (
        status !== 'failed' && (
          <Card>
            <CardContent>
              <EmptyState
                icon={Trophy}
                title="No results yet"
                description="Once you submit an exam, your score and feedback will appear here."
                action={
                  <Button asChild>
                    <Link href="/dashboard/student/exams">Browse exams</Link>
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent>
            <ul className="divide-y divide-gray-100">
              {submitted.map((exam) => {
                const submission = exam.submission!;
                const graded = submission.status === 'graded' && submission.score !== null;

                return (
                  <li key={exam.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-brand-950">{exam.title}</p>
                      <p className="text-xs text-muted-foreground">
                        By {exam.teacher_name}
                        {submission.submitted_at && ` · Submitted ${formatDate(submission.submitted_at)}`}
                      </p>
                    </div>
                    {graded && (
                      <span className="text-sm font-semibold text-gray-700 tabular-nums">
                        {formatPercent(submission.score!, exam.total_marks)}
                      </span>
                    )}
                    <ScoreBadge status={submission.status} score={submission.score} total={exam.total_marks} />
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/student/results/${exam.id}`}>{graded ? 'View feedback' : 'View'}</Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
