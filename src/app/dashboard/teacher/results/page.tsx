'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, Loader2, Users } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchExams } from '@/lib/features/exams/examsSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExamStatusBadge } from '@/components/exams/ExamMeta';
import { EmptyState } from '@/components/shared/EmptyState';
import { FormAlert } from '@/components/shared/FormAlert';
import { PageHeader } from '@/components/shared/PageHeader';

export default function TeacherResultsPage() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.exams);

  useEffect(() => {
    dispatch(fetchExams());
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Results" description="Choose an exam to see how each student did." />

      <FormAlert message={error} />

      {status === 'loading' && items.length === 0 ? (
        <Loader2 className="mx-auto my-12 size-6 animate-spin text-primary" />
      ) : items.length === 0 ? (
        status !== 'failed' && (
          <Card>
            <CardContent>
              <EmptyState
                icon={BarChart3}
                title="No exams yet"
                description="Results appear here once students take an exam you have published."
              />
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent>
            <ul className="divide-y divide-gray-100">
              {items.map((exam) => (
                <li key={exam.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-brand-950">{exam.title}</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="size-3.5" />
                      {exam.submission_count} {exam.submission_count === 1 ? 'student' : 'students'} · {exam.total_marks} marks
                    </p>
                  </div>
                  <ExamStatusBadge status={exam.status} />
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/teacher/results/${exam.id}`}>View results</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
