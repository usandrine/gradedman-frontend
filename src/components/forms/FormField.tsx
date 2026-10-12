'use client';

import { useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}

// Label + control + validation message. Wrap any control with this.
export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-gray-700">
        {label}
      </Label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3" />
          {error}
        </p>
      )}
    </div>
  );
}

type TextFieldProps = React.ComponentProps<typeof Input> & {
  label: string;
  error?: string;
};

// Text input with label and error. Works with react-hook-form: <TextField label="Email" {...register('email')} />
export function TextField({ label, error, id, className, ...props }: TextFieldProps) {
  const fieldId = id ?? props.name;

  return (
    <FormField label={label} htmlFor={fieldId} error={error}>
      <Input id={fieldId} aria-invalid={!!error} className={cn('h-11', className)} {...props} />
    </FormField>
  );
}

// Same as TextField, with a show/hide toggle
export function PasswordField({ label, error, id, className, ...props }: Omit<TextFieldProps, 'type'>) {
  const [visible, setVisible] = useState(false);
  const fieldId = id ?? props.name;

  return (
    <FormField label={label} htmlFor={fieldId} error={error}>
      <div className="relative">
        <Input
          id={fieldId}
          type={visible ? 'text' : 'password'}
          aria-invalid={!!error}
          className={cn('h-11 pr-10', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </FormField>
  );
}
