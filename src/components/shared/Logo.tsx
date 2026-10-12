import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizes = {
  sm: { box: 'size-8 rounded-lg', icon: 'size-5' },
  lg: { box: 'size-14 rounded-2xl shadow-lg', icon: 'size-8' },
};

export function Logo({ size = 'sm', className }: { size?: keyof typeof sizes; className?: string }) {
  return (
    <div className={cn('flex shrink-0 items-center justify-center bg-primary', sizes[size].box, className)}>
      <GraduationCap className={cn('text-primary-foreground', sizes[size].icon)} />
    </div>
  );
}
