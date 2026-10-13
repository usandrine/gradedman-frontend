'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExamMeta } from '@/components/exams/ExamMeta';
import { ScoreBadge } from '@/components/results/ScoreBadge';
import { formatDate, formatDuration } from '@/lib/format';
import type { AvailableExam } from '@/lib/features/exams/studentExamsSlice';

// A published exam in the student's list, with the action that fits their progress
export function AvailableExamCard({ exam }: { exam: AvailableExam }) {
  const [confirming, setConfirming] = useState(false);

  const href = `/dashboard/student/exams/${exam.id}`;
  const status = exam.submission?.status;

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-brand-950">{exam.title}</h3>
            <p className="text-xs text-muted-foreground">By {exam.teacher_name}</p>
          </div>
          {status === 'in_progress' && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
              In progress
            </Badge>
          )}
          {(status === 'submitted' || status === 'graded') && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle2 />
              Submitted
            </Badge>
          )}
        </div>

        {exam.description && <p className="text-sm text-gray-600">{exam.description}</p>}

        <ExamMeta questionCount={exam.question_count} totalMarks={exam.total_marks} durationMinutes={exam.duration_minutes} />

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-3">
          {!status &&
            (confirming ? (
              <>
                <p className="mr-auto text-sm text-gray-600">
                  You get {formatDuration(exam.duration_minutes)} and one attempt. The timer starts now and keeps
                  running if you leave.
                </p>
                <Button asChild>
                  <Link href={href}>Begin</Link>
                </Button>
                <Button variant="ghost" onClick={() => setConfirming(false)}>
                  Not now
                </Button>
              </>
            ) : (
              <Button onClick={() => setConfirming(true)}>Start exam</Button>
            ))}

          {status === 'in_progress' && (
            <>
              <p className="mr-auto text-sm text-gray-600">Your timer is still running.</p>
              <Button asChild>
                <Link href={href}>Continue exam</Link>
              </Button>
            </>
          )}

          {(status === 'submitted' || status === 'graded') && (
            <>
              <p className="mr-auto text-sm text-muted-foreground">
                Submitted {exam.submission?.submitted_at ? formatDate(exam.submission.submitted_at) : ''}
              </p>
              <ScoreBadge status={status} score={exam.submission?.score ?? null} total={exam.total_marks} />
              <Button variant="outline" asChild>
                <Link href={`/dashboard/student/results/${exam.id}`}>View result</Link>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
