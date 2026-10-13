'use client';

import { useState } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/FormField';
import { FormAlert } from '@/components/shared/FormAlert';
import { cn } from '@/lib/utils';
import type { Question } from '@/lib/features/questions/questionsSlice';

const optionLetter = (index: number) => String.fromCharCode(65 + index);

const difficultyStyles: Record<Question['difficulty'], string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

function validate(draft: Question): string | null {
  if (!draft.question.trim()) return 'The question cannot be empty.';
  if (draft.options.some((option) => !option.trim())) return 'Every option needs some text.';
  if (!draft.answer.trim()) {
    return draft.type === 'multiple_choice' ? 'The explanation cannot be empty.' : 'The model answer cannot be empty.';
  }
  if (!Number.isInteger(draft.marks) || draft.marks < 1 || draft.marks > 100) return 'Marks must be between 1 and 100.';
  return null;
}

interface QuestionCardProps {
  question: Question;
  // Position in the list, starting at 1
  number: number;
  // Leave both out for a read-only card (e.g. a question of a saved exam)
  onSave?: (question: Question) => void;
  onRemove?: (id: string) => void;
}

// One question: read view, with an edit mode so the teacher can fix it before saving
export function QuestionCard({ question, number, onSave, onRemove }: QuestionCardProps) {
  const [draft, setDraft] = useState<Question | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMultipleChoice = question.type === 'multiple_choice';
  const answerLabel = isMultipleChoice ? 'Explanation' : 'Model answer';

  const stopEditing = () => {
    setDraft(null);
    setError(null);
  };

  const handleSave = () => {
    if (!draft || !onSave) return;

    const problem = validate(draft);
    if (problem) {
      setError(problem);
      return;
    }

    onSave({
      ...draft,
      question: draft.question.trim(),
      options: draft.options.map((option) => option.trim()),
      answer: draft.answer.trim(),
    });
    stopEditing();
  };

  return (
    <Card>
      <CardContent className="space-y-3">
        {/* Header: number, tags, actions */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-vivid text-xs font-bold text-white shadow-sm shadow-brand-600/30">
            {number}
          </span>
          <Badge variant="secondary" className={cn('capitalize', difficultyStyles[question.difficulty])}>
            {question.difficulty}
          </Badge>
          <Badge variant="secondary">{isMultipleChoice ? 'Multiple choice' : 'Short answer'}</Badge>
          <Badge variant="outline">
            {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
          </Badge>

          {!draft && (
            <div className="ml-auto flex items-center">
              {onSave && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit question ${number}`}
                  title="Edit"
                  onClick={() => setDraft(question)}
                  className="text-gray-400 hover:text-primary"
                >
                  <Pencil />
                </Button>
              )}
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove question ${number}`}
                  title="Remove"
                  onClick={() => onRemove(question.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 />
                </Button>
              )}
            </div>
          )}
        </div>

        {draft ? (
          <div className="space-y-3">
            <FormAlert message={error} />

            <FormField label="Question" htmlFor={`question-${question.id}`}>
              <Textarea
                id={`question-${question.id}`}
                rows={3}
                value={draft.question}
                onChange={(event) => setDraft({ ...draft, question: event.target.value })}
              />
            </FormField>

            {isMultipleChoice && (
              <FormField label="Options — select the correct one">
                <div className="space-y-2">
                  {draft.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        aria-label={`Mark option ${optionLetter(index)} as correct`}
                        checked={draft.correct_option === index}
                        onChange={() => setDraft({ ...draft, correct_option: index })}
                        className="size-4 accent-brand-600"
                      />
                      <span className="w-4 text-sm font-medium text-gray-500">{optionLetter(index)}</span>
                      <Input
                        aria-label={`Option ${optionLetter(index)}`}
                        value={option}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            options: draft.options.map((current, i) => (i === index ? event.target.value : current)),
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </FormField>
            )}

            <FormField label={answerLabel} htmlFor={`answer-${question.id}`}>
              <Textarea
                id={`answer-${question.id}`}
                rows={3}
                value={draft.answer}
                onChange={(event) => setDraft({ ...draft, answer: event.target.value })}
              />
            </FormField>

            <FormField label="Marks" htmlFor={`marks-${question.id}`}>
              <Input
                id={`marks-${question.id}`}
                type="number"
                min={1}
                max={100}
                className="w-24"
                value={Number.isNaN(draft.marks) ? '' : draft.marks}
                onChange={(event) => setDraft({ ...draft, marks: event.target.valueAsNumber })}
              />
            </FormField>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={stopEditing}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save changes</Button>
            </div>
          </div>
        ) : (
          <>
            <p className="font-medium whitespace-pre-line text-brand-950">{question.question}</p>

            {isMultipleChoice && (
              <ul className="space-y-1.5">
                {question.options.map((option, index) => {
                  const isCorrect = index === question.correct_option;
                  return (
                    <li
                      key={index}
                      className={cn(
                        'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm',
                        isCorrect ? 'border-green-300 bg-green-50 text-green-900' : 'border-gray-200 text-gray-700'
                      )}
                    >
                      <span className="font-semibold">{optionLetter(index)}.</span>
                      <span className="flex-1">{option}</span>
                      {isCorrect && <Check className="mt-0.5 size-4 shrink-0 text-green-600" aria-label="Correct answer" />}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="rounded-lg bg-muted px-3 py-2">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{answerLabel}</p>
              <p className="mt-1 text-sm whitespace-pre-line text-gray-700">{question.answer}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
