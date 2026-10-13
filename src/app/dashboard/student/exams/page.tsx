'use client';

import { useEffect } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchAvailableExams } from '@/lib/features/exams/studentExamsSlice';
import { Card, CardContent } from '@/components/ui/card';
import { AvailableExamCard } from '@/components/exams/AvailableExamCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { FormAlert } from '@/components/shared/FormAlert';
import { PageHeader } from '@/components/shared/PageHeader';

export default function StudentExamsPage() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.studentExams);

  useEffect(() => {
    dispatch(fetchAvailableExams());
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Available Exams" description="Exams your teachers have published. You get one attempt at each." />

      <FormAlert message={error} />

      {status === 'loading' && items.length === 0 ? (
        <Loader2 className="mx-auto my-12 size-6 animate-spin text-primary" />
      ) : items.length === 0 ? (
        status !== 'failed' && (
          <Card>
            <CardContent>
              <EmptyState
                icon={BookOpen}
                title="No exams yet"
                description="When a teacher publishes an exam, it will show up here."
              />
            </CardContent>
          </Card>
        )
      ) : (
        <div className="space-y-4">
          {items.map((exam) => (
            <AvailableExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}
    </div>
  );
}
