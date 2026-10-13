import { Check, Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { scoreTone } from '@/components/results/ScoreBadge';
import { formatDate, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { GradedAnswer, SubmissionResult } from '@/lib/features/results/resultsSlice';

const optionLetter = (index: number) => String.fromCharCode(65 + index);

function GradedAnswerCard({ answer, number }: { answer: GradedAnswer; number: number }) {
  const score = answer.score ?? 0;
  const isMultipleChoice = answer.type === 'multiple_choice';
  const unanswered = isMultipleChoice ? answer.selected_option === null : !answer.answer_text;

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-vivid text-xs font-bold text-white shadow-sm shadow-brand-600/30">
            {number}
          </span>
          <p className="flex-1 pt-0.5 font-medium whitespace-pre-line text-brand-950">{answer.question}</p>
          <Badge variant="secondary" className={cn('shrink-0 tabular-nums', scoreTone(score, answer.marks))}>
            {score} / {answer.marks}
          </Badge>
        </div>

        {isMultipleChoice ? (
          <ul className="space-y-1.5">
            {answer.options.map((option, index) => {
              const isCorrect = index === answer.correct_option;
              const isChosen = index === answer.selected_option;
              return (
                <li
                  key={index}
                  className={cn(
                    'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm',
                    isCorrect
                      ? 'border-green-300 bg-green-50 text-green-900'
                      : isChosen
                        ? 'border-red-300 bg-red-50 text-red-900'
                        : 'border-gray-200 text-gray-700'
                  )}
                >
                  <span className="font-semibold">{optionLetter(index)}.</span>
                  <span className="flex-1">{option}</span>
                  {isChosen && <span className="text-xs font-medium">Chosen</span>}
                  {isCorrect && <Check className="mt-0.5 size-4 shrink-0 text-green-600" aria-label="Correct answer" />}
                  {isChosen && !isCorrect && <X className="mt-0.5 size-4 shrink-0 text-red-600" aria-label="Wrong answer" />}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-lg border border-gray-200 px-3 py-2">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Answer given</p>
            <p className={cn('mt-1 text-sm whitespace-pre-line', unanswered ? 'text-muted-foreground italic' : 'text-gray-800')}>
              {answer.answer_text || 'Not answered'}
            </p>
          </div>
        )}

        {isMultipleChoice && unanswered && <p className="text-sm text-muted-foreground italic">Not answered</p>}

        {answer.feedback && (
          <div className="rounded-lg bg-brand-50 px-3 py-2">
            <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">Feedback</p>
            <p className="mt-1 text-sm whitespace-pre-line text-brand-900">{answer.feedback}</p>
          </div>
        )}

        {!isMultipleChoice && (
          <div className="rounded-lg bg-muted px-3 py-2">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Model answer</p>
            <p className="mt-1 text-sm whitespace-pre-line text-gray-700">{answer.model_answer}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// A marked submission: overall score, then every answer with its marks and feedback.
// Shared by the student's result page and the teacher's view of a student.
export function ResultView({ result }: { result: SubmissionResult }) {
  const { exam, score, status } = result;

  if (status !== 'graded' || score === null) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-8 text-center">
          {result.grading_error ? (
            <>
              <p className="font-semibold text-brand-950">This exam could not be graded automatically</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {typeof result.grading_error === 'string'
                  ? result.grading_error
                  : 'Your teacher has been shown the problem and can run the grading again.'}
              </p>
            </>
          ) : (
            <>
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="mt-3 font-semibold text-brand-950">Grading in progress</p>
              <p className="mt-1 text-sm text-muted-foreground">The AI is marking the answers. This usually takes under a minute.</p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-3xl font-bold text-brand-950 tabular-nums">
              {score} <span className="text-lg font-medium text-muted-foreground">/ {exam.total_marks}</span>
            </p>
            {result.submitted_at && (
              <p className="mt-1 text-xs text-muted-foreground">Submitted {formatDate(result.submitted_at)}</p>
            )}
          </div>
          <span className={cn('rounded-xl px-4 py-2 text-2xl font-bold tabular-nums', scoreTone(score, exam.total_marks))}>
            {formatPercent(score, exam.total_marks)}
          </span>
        </CardContent>
      </Card>

      {result.answers.map((answer, index) => (
        <GradedAnswerCard key={answer.question_id} answer={answer} number={index + 1} />
      ))}
    </div>
  );
}
