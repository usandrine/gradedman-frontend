import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/features/auth/authSlice';

const roleStyles: Record<UserRole, string> = {
  teacher: 'bg-purple-100 text-purple-700',
  student: 'bg-green-100 text-green-700',
};

export function RoleBadge({ role, className }: { role: UserRole; className?: string }) {
  return (
    <Badge variant="secondary" className={cn('capitalize', roleStyles[role], className)}>
      {role}
    </Badge>
  );
}
