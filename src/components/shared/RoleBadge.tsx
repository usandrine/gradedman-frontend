import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/features/auth/authSlice';

const roleStyles: Record<UserRole, string> = {
  teacher: 'bg-brand-800 text-white',
  student: 'bg-brand-100 text-brand-800',
};

export function RoleBadge({ role, className }: { role: UserRole; className?: string }) {
  return (
    <Badge variant="secondary" className={cn('capitalize', roleStyles[role], className)}>
      {role}
    </Badge>
  );
}
