import { Clock, FileQuestion, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDuration } from '@/lib/format';
import type { ExamStatus } from '@/lib/features/exams/examsSlice';

const statusStyles: Record<ExamStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  published: { label: 'Published', className: 'bg-green-100 text-green-700' },
};

export function ExamStatusBadge({ status }: { status: ExamStatus }) {
  const { label, className } = statusStyles[status];

  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  );
}

interface ExamMetaProps {
  questionCount: number;
  totalMarks: number;
  durationMinutes: number;
}

// The "5 questions · 25 marks · 30 min" line shown wherever an exam is listed
export function ExamMeta({ questionCount, totalMarks, durationMinutes }: ExamMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <FileQuestion className="size-4" />
        {questionCount} {questionCount === 1 ? 'question' : 'questions'}
      </span>
      <span className="flex items-center gap-1.5">
        <Trophy className="size-4" />
        {totalMarks} {totalMarks === 1 ? 'mark' : 'marks'}
      </span>
      <span className="flex items-center gap-1.5">
        <Clock className="size-4" />
        {formatDuration(durationMinutes)}
      </span>
    </div>
  );
}
