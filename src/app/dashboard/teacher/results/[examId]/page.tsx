'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BarChart3, CheckCircle2, Loader2, Trophy, Users } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchExamSubmissions } from '@/lib/features/results/resultsSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProctoringFlag } from '@/components/results/ProctoringReport';
import { ScoreBadge } from '@/components/results/ScoreBadge';
import { BackLink } from '@/components/shared/BackLink';
import { EmptyState } from '@/components/shared/EmptyState';
import { FormAlert } from '@/components/shared/FormAlert';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatGrid, type StatCardProps } from '@/components/shared/StatCard';
import { formatDate, formatPercent } from '@/lib/format';

export default function TeacherExamResultsPage() {
  const examId = Number(useParams<{ examId: string }>().examId);
  const dispatch = useAppDispatch();
  const { examSubmissions, listStatus, error } = useAppSelector((state) => state.results);

  useEffect(() => {
    dispatch(fetchExamSubmissions(examId));
  }, [examId, dispatch]);

  const data = examSubmissions?.exam.id === examId ? examSubmissions : null;

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <BackLink href="/dashboard/teacher/results">Back to Results</BackLink>
        {listStatus === 'failed' ? (
          <FormAlert message={error} />
        ) : (
          <Loader2 className="mx-auto my-12 size-6 animate-spin text-primary" />
        )}
      </div>
    );
  }

  const { exam, submissions } = data;
  const scores = submissions.filter((s) => s.status === 'graded' && s.score !== null).map((s) => s.score!);
  const average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null;

  const stats: StatCardProps[] = [
    { label: 'Students', value: submissions.length, icon: Users, tone: 'vivid' },
    { label: 'Graded', value: scores.length, icon: CheckCircle2, tone: 'bright' },
    { label: 'Average', value: average === null ? '—' : formatPercent(average, exam.total_marks), icon: BarChart3, tone: 'navy' },
    { label: 'Highest', value: scores.length ? `${Math.max(...scores)} / ${exam.total_marks}` : '—', icon: Trophy, tone: 'soft' },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackLink href="/dashboard/teacher/results">Back to Results</BackLink>

      <PageHeader title={exam.title} description={`${exam.question_count} questions · ${exam.total_marks} marks`} />

      <StatGrid stats={stats} />

      <Card>
        <CardContent>
          {submissions.length === 0 ? (
            <EmptyState icon={Users} title="No students yet" description="Nobody has started this exam." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {submissions.map((submission) => (
                <li key={submission.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-brand-950">{submission.student.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {submission.student.email}
                      {submission.submitted_at && ` · Submitted ${formatDate(submission.submitted_at)}`}
                    </p>
                  </div>
                  {submission.status === 'graded' && submission.score !== null && (
                    <span className="text-sm font-semibold text-gray-700 tabular-nums">
                      {formatPercent(submission.score, exam.total_marks)}
                    </span>
                  )}
                  <ProctoringFlag summary={submission.proctoring} />
                  <ScoreBadge
                    status={submission.status}
                    score={submission.score}
                    total={exam.total_marks}
                    failed={!!submission.grading_error}
                  />
                  {submission.status !== 'in_progress' && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/teacher/results/${exam.id}/${submission.id}`}>View answers</Link>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
