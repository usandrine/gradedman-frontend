import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizes = {
  sm: { box: 'size-9 rounded-xl', icon: 'size-5' },
  lg: { box: 'size-16 rounded-2xl', icon: 'size-9' },
};

const variants = {
  // On white or light backgrounds
  solid: { box: 'bg-brand-vivid shadow-lg shadow-brand-600/30', icon: 'text-white' },
  // On the dark blue gradient
  light: { box: 'bg-white shadow-lg shadow-brand-950/40', icon: 'text-brand-800' },
};

interface LogoProps {
  size?: keyof typeof sizes;
  variant?: keyof typeof variants;
  className?: string;
}

export function Logo({ size = 'sm', variant = 'solid', className }: LogoProps) {
  return (
    <div className={cn('flex shrink-0 items-center justify-center', sizes[size].box, variants[variant].box, className)}>
      <GraduationCap className={cn(sizes[size].icon, variants[variant].icon)} />
    </div>
  );
}
