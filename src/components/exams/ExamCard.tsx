'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExamMeta, ExamStatusBadge } from '@/components/exams/ExamMeta';
import { LoadingButton } from '@/components/shared/LoadingButton';
import { formatDate } from '@/lib/format';
import type { Exam, ExamStatus } from '@/lib/features/exams/examsSlice';

interface ExamCardProps {
  exam: Exam;
  onStatusChange: (id: number, status: ExamStatus) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
}

// One of the teacher's exams, with publish / view / delete actions
export function ExamCard({ exam, onStatusChange, onDelete }: ExamCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const isPublished = exam.status === 'published';

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    await action();
    // After a successful delete this card is already gone; otherwise reset it
    setBusy(false);
    setConfirming(false);
  };

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-brand-950">{exam.title}</h3>
            <p className="text-xs text-muted-foreground">Created {formatDate(exam.created_at)}</p>
          </div>
          <ExamStatusBadge status={exam.status} />
        </div>

        {exam.description && <p className="text-sm text-gray-600">{exam.description}</p>}

        <ExamMeta questionCount={exam.question_count} totalMarks={exam.total_marks} durationMinutes={exam.duration_minutes} />

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4" />
            {exam.submission_count} {exam.submission_count === 1 ? 'student' : 'students'}
          </span>

          {confirming ? (
            <div className="flex items-center gap-1">
              <span className="mr-1 text-sm text-gray-600">
                Delete{exam.submission_count > 0 ? ' with all student answers' : ''}?
              </span>
              <LoadingButton variant="destructive" size="sm" loading={busy} onClick={() => run(() => onDelete(exam.id))}>
                Delete
              </LoadingButton>
              <Button variant="ghost" size="sm" disabled={busy} onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/teacher/exams/${exam.id}`}>
                  <Eye />
                  View
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${exam.title}`}
                title="Delete"
                onClick={() => setConfirming(true)}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 />
              </Button>
              <LoadingButton
                size="sm"
                variant={isPublished ? 'outline' : 'default'}
                loading={busy}
                onClick={() => run(() => onStatusChange(exam.id, isPublished ? 'draft' : 'published'))}
              >
                {isPublished ? 'Unpublish' : 'Publish'}
              </LoadingButton>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
