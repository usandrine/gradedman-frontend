import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/features/auth/authSlice';

const roles: { value: UserRole; label: string }[] = [
  { value: 'student', label: '🎓 Student' },
  { value: 'teacher', label: '👨‍🏫 Teacher' },
];

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3" role="radiogroup">
      {roles.map((role) => (
        <button
          key={role.value}
          type="button"
          role="radio"
          aria-checked={value === role.value}
          onClick={() => onChange(role.value)}
          className={cn(
            'h-11 rounded-lg border-2 text-sm font-medium transition-all',
            value === role.value
              ? 'border-primary bg-brand-50 text-brand-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          )}
        >
          {role.label}
        </button>
      ))}
    </div>
  );
}
