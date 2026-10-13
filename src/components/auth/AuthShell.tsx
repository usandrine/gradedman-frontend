import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/shared/Logo';

const highlights = [
  'Turn your notes into exam questions in seconds',
  'Students take exams online, against the clock',
  'AI marks every answer and explains the score',
];

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

// Shared layout for the login and register pages: brand panel on the left, form card on the right
export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-brand-gradient">
      {/* Soft glows that give the dark blue some depth */}
      <div className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-brand-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-40 size-[28rem] rounded-full bg-brand-400/25 blur-3xl" />

      {/* Brand panel — large screens only */}
      <div className="relative hidden flex-1 flex-col justify-center px-16 text-white lg:flex">
        <div className="flex items-center gap-3">
          <Logo size="lg" variant="light" />
          <span className="text-3xl font-bold tracking-tight">Gradedman</span>
        </div>
        <h2 className="mt-10 max-w-md text-4xl leading-tight font-bold tracking-tight">
          Exams that write <span className="text-brand-300">and mark</span> themselves.
        </h2>
        <ul className="mt-8 space-y-4">
          {highlights.map((highlight) => (
            <li key={highlight} className="flex items-center gap-3 text-brand-100">
              <CheckCircle2 className="size-5 shrink-0 text-brand-300" />
              {highlight}
            </li>
          ))}
        </ul>
      </div>

      {/* Form */}
      <div className="relative flex flex-1 items-center justify-center p-4 lg:max-w-xl lg:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center lg:hidden">
            <Logo size="lg" variant="light" className="mx-auto" />
            <h1 className="text-3xl font-bold text-white">Gradedman</h1>
            <p className="text-sm text-brand-200">AI-Powered Exam Platform</p>
          </div>

          <Card className="py-7 shadow-2xl shadow-brand-950/50 ring-0 [--card-spacing:--spacing(7)]">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-brand-950">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
