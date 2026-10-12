import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/shared/Logo';

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

// Shared layout for the login and register pages: background, brand and card
export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <Logo size="lg" className="mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">Gradedman</h1>
          <p className="text-sm text-muted-foreground">AI-Powered Exam Platform</p>
        </div>

        <Card className="bg-white/80 py-6 shadow-xl ring-0 backdrop-blur [--card-spacing:--spacing(6)]">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
