'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ClipboardList, Loader2, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { deleteExam, fetchExams, setExamStatus } from '@/lib/features/exams/examsSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExamCard } from '@/components/exams/ExamCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { FormAlert } from '@/components/shared/FormAlert';
import { PageHeader } from '@/components/shared/PageHeader';

export default function TeacherExamsPage() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.exams);

  useEffect(() => {
    dispatch(fetchExams());
  }, [dispatch]);

  const newExamButton = (
    <Button asChild>
      <Link href="/dashboard/teacher/generate">
        <Sparkles />
        New exam
      </Link>
    </Button>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="My Exams"
        description="Publish an exam to let students take it. Drafts are only visible to you."
        action={newExamButton}
      />

      <FormAlert message={error} />

      {status === 'loading' && items.length === 0 ? (
        <Loader2 className="mx-auto my-12 size-6 animate-spin text-primary" />
      ) : items.length === 0 ? (
        status !== 'failed' && (
          <Card>
            <CardContent>
              <EmptyState
                icon={ClipboardList}
                title="No exams yet"
                description="Generate questions from your materials, then save them as an exam."
                action={newExamButton}
              />
            </CardContent>
          </Card>
        )
      ) : (
        <div className="space-y-4">
          {items.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onStatusChange={(id, newStatus) => dispatch(setExamStatus({ id, status: newStatus }))}
              onDelete={(id) => dispatch(deleteExam(id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
