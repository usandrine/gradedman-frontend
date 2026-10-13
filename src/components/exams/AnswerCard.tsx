import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { AnswerInput, StudentQuestion } from '@/lib/features/exams/studentExamsSlice';

const optionLetter = (index: number) => String.fromCharCode(65 + index);

interface AnswerCardProps {
  question: StudentQuestion;
  // Position in the exam, starting at 1
  number: number;
  answer: AnswerInput | undefined;
  onChange: (answer: AnswerInput) => void;
  disabled?: boolean;
}

// One exam question as the student sees it, with the control to answer it
export function AnswerCard({ question, number, answer, onChange, disabled }: AnswerCardProps) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-vivid text-xs font-bold text-white shadow-sm shadow-brand-600/30">
            {number}
          </span>
          <p className="flex-1 pt-0.5 font-medium whitespace-pre-line text-brand-950">{question.question}</p>
          <Badge variant="outline" className="shrink-0">
            {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
          </Badge>
        </div>

        {question.type === 'multiple_choice' ? (
          <div className="space-y-2" role="radiogroup" aria-label={`Question ${number}`}>
            {question.options.map((option, index) => {
              const selected = answer?.selectedOption === index;
              return (
                <label
                  key={index}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                    selected ? 'border-primary bg-brand-50 text-brand-900' : 'border-gray-200 text-gray-700 hover:bg-gray-50',
                    disabled && 'cursor-not-allowed opacity-60'
                  )}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={selected}
                    disabled={disabled}
                    onChange={() => onChange({ questionId: question.id, selectedOption: index })}
                    className="mt-0.5 size-4 accent-brand-600"
                  />
                  <span className="font-semibold">{optionLetter(index)}.</span>
                  <span className="flex-1">{option}</span>
                </label>
              );
            })}
          </div>
        ) : (
          <Textarea
            rows={4}
            placeholder="Type your answer here"
            aria-label={`Answer to question ${number}`}
            value={answer?.text ?? ''}
            disabled={disabled}
            onChange={(event) => onChange({ questionId: question.id, text: event.target.value })}
          />
        )}
      </CardContent>
    </Card>
  );
}
