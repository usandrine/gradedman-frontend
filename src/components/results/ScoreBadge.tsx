import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SubmissionStatus } from '@/lib/features/exams/studentExamsSlice';

// Green from 70%, amber from 40%, red below
export const scoreTone = (score: number, total: number) => {
  const ratio = total > 0 ? score / total : 0;
  if (ratio >= 0.7) return 'bg-green-100 text-green-700';
  if (ratio >= 0.4) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

interface ScoreBadgeProps {
  status: SubmissionStatus;
  score: number | null;
  total: number;
  // Grading was attempted and failed
  failed?: boolean;
}

// "7.5 / 10" once graded; otherwise where the submission is in the process
export function ScoreBadge({ status, score, total, failed }: ScoreBadgeProps) {
  if (status === 'graded' && score !== null) {
    return (
      <Badge variant="secondary" className={cn('tabular-nums', scoreTone(score, total))}>
        {score} / {total}
      </Badge>
    );
  }

  if (status === 'in_progress') {
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
        In progress
      </Badge>
    );
  }

  if (failed) {
    return (
      <Badge variant="secondary" className="bg-red-100 text-red-700">
        Grading failed
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-brand-100 text-brand-700">
      <Loader2 className="animate-spin" />
      Grading
    </Badge>
  );
}
