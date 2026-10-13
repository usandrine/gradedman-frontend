import { Loader2 } from 'lucide-react';

export function FullPageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex h-screen items-center justify-center bg-brand-50">
      <div className="space-y-3 text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
