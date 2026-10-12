import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface FormAlertProps {
  message?: string | null;
  variant?: 'error' | 'success';
  className?: string;
}

// Inline message for the result of a form or request. Renders nothing without a message.
export function FormAlert({ message, variant = 'error', className }: FormAlertProps) {
  if (!message) return null;

  const isError = variant === 'error';

  return (
    <Alert
      variant={isError ? 'destructive' : 'default'}
      className={cn(isError ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50 text-green-800', className)}
    >
      {isError ? <AlertCircle /> : <CheckCircle2 />}
      <AlertDescription className={isError ? undefined : 'text-green-800'}>{message}</AlertDescription>
    </Alert>
  );
}
