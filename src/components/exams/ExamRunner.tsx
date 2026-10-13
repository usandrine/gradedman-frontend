'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, Eye } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { submitExam, type AnswerInput, type ExamAttempt } from '@/lib/features/exams/studentExamsSlice';
import { useCountdown } from '@/hooks/useCountdown';
import { useProctoring } from '@/hooks/useProctoring';
import { formatCountdown } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnswerCard } from '@/components/exams/AnswerCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { FormAlert } from '@/components/shared/FormAlert';
import { LoadingButton } from '@/components/shared/LoadingButton';

type Answers = Record<number, AnswerInput>;

// Answers are kept in the browser while the exam is open, so a refresh doesn't lose them
const storageKey = (submissionId: number) => `gradedman-exam-answers-${submissionId}`;

function loadSavedAnswers(submissionId: number): Answers {
  try {
    return JSON.parse(localStorage.getItem(storageKey(submissionId)) ?? '{}');
  } catch {
    return {};
  }
}

const isAnswered = (answer: AnswerInput | undefined) =>
  !!answer && (answer.selectedOption != null || !!answer.text?.trim());

// The exam while it is being taken: questions, countdown and submitting
export function ExamRunner({ attempt }: { attempt: ExamAttempt }) {
  const { exam, submission } = attempt;

  const dispatch = useAppDispatch();
  const { submitting, submitError } = useAppSelector((state) => state.studentExams);

  const [answers, setAnswers] = useState<Answers>(() => loadSavedAnswers(submission.id));
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<{ answered: number; total: number; timedOut: boolean } | null>(null);

  const secondsLeft = useCountdown(result ? null : attempt.localDeadline);
  // Monitoring stops as soon as the exam is handed in
  const { tabSwitches, blockedMessage } = useProctoring(exam.id, !result);
  const answeredCount = exam.questions.filter((question) => isAnswered(answers[question.id])).length;

  // Always holds the latest answers, so the timer can submit them without re-creating itself
  const answersRef = useRef(answers);
  const submitStarted = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
    localStorage.setItem(storageKey(submission.id), JSON.stringify(answers));
  }, [answers, submission.id]);

  const submit = useCallback(
    async (timedOut: boolean) => {
      if (submitStarted.current) return;
      submitStarted.current = true;

      const action = await dispatch(submitExam({ examId: exam.id, answers: Object.values(answersRef.current) }));

      if (submitExam.fulfilled.match(action)) {
        localStorage.removeItem(storageKey(submission.id));
        setResult({ answered: action.payload.answered, total: action.payload.total, timedOut });
      } else {
        // Let the student try again
        submitStarted.current = false;
        setConfirming(false);
      }
    },
    [dispatch, exam.id, submission.id]
  );

  // Time is up — hand in whatever has been answered
  useEffect(() => {
    if (secondsLeft === 0) {
      submit(true);
    }
  }, [secondsLeft, submit]);

  if (result) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent>
          <EmptyState
            icon={CheckCircle2}
            title={result.timedOut ? 'Time is up — your exam was submitted' : 'Exam submitted'}
            description={`You answered ${result.answered} of ${result.total} questions in "${exam.title}". It is being graded now — this usually takes under a minute.`}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild>
                  <Link href={`/dashboard/student/results/${exam.id}`}>See my result</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/student/exams">Back to exams</Link>
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
    );
  }

  const lowOnTime = secondsLeft !== null && secondsLeft <= 60;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Sticky bar: always-visible timer and submit */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-md ring-1 ring-foreground/10">
        <div className="min-w-0">
          <h1 className="truncate font-semibold text-brand-950">{exam.title}</h1>
          <p className="text-xs text-muted-foreground">
            {answeredCount} of {exam.questions.length} answered · {exam.total_marks} marks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            role="timer"
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-sm font-semibold tabular-nums',
              lowOnTime ? 'bg-red-100 text-red-700' : 'bg-brand-50 text-brand-700'
            )}
          >
            <Clock className="size-4" />
            {secondsLeft === null ? '--:--' : formatCountdown(secondsLeft)}
          </span>

          {confirming ? (
            <div className="flex items-center gap-1">
              <LoadingButton loading={submitting} loadingText="Submitting..." onClick={() => submit(false)}>
                Yes, submit
              </LoadingButton>
              <Button variant="ghost" disabled={submitting} onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <LoadingButton loading={submitting} loadingText="Submitting..." onClick={() => setConfirming(true)}>
              Submit exam
            </LoadingButton>
          )}
        </div>

        {confirming && !submitting && (
          <p className="w-full text-sm text-gray-600">
            {answeredCount < exam.questions.length
              ? `You have ${exam.questions.length - answeredCount} unanswered ${exam.questions.length - answeredCount === 1 ? 'question' : 'questions'}. `
              : ''}
            You can&apos;t change your answers after submitting.
          </p>
        )}
      </div>

      <FormAlert message={submitError} />
      <FormAlert message={blockedMessage} />

      <p
        className={cn(
          'flex items-start gap-2 rounded-lg px-4 py-3 text-sm',
          tabSwitches > 0 ? 'bg-amber-50 text-amber-900' : 'bg-gray-100 text-gray-600'
        )}
      >
        <Eye className="mt-0.5 size-4 shrink-0" />
        {tabSwitches > 0
          ? `You have left this exam ${tabSwitches} ${tabSwitches === 1 ? 'time' : 'times'}. Each time is recorded and shown to your teacher.`
          : 'This exam is monitored. Leaving this tab or window is recorded and shown to your teacher, and copy and paste are disabled.'}
      </p>

      {exam.description && (
        <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-900">{exam.description}</p>
      )}

      {exam.questions.map((question, index) => (
        <AnswerCard
          key={question.id}
          question={question}
          number={index + 1}
          answer={answers[question.id]}
          disabled={submitting}
          onChange={(answer) => setAnswers((current) => ({ ...current, [question.id]: answer }))}
        />
      ))}
    </div>
  );
}
