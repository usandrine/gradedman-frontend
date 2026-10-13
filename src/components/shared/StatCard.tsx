import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Four strengths of the brand blue, so a row of cards has rhythm without leaving the palette
const tones = {
  navy: 'bg-brand-800 text-white shadow-brand-800/30',
  vivid: 'bg-brand-vivid text-white shadow-brand-600/30',
  bright: 'bg-brand-500 text-white shadow-brand-500/30',
  soft: 'bg-brand-100 text-brand-700 shadow-brand-200/60',
};

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: keyof typeof tones;
}

export function StatCard({ label, value, icon: Icon, tone = 'vivid' }: StatCardProps) {
  return (
    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-200/60">
      <CardContent className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-brand-950 tabular-nums">{value}</p>
        </div>
        <div className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl shadow-lg', tones[tone])}>
          <Icon className="size-6" />
        </div>
      </CardContent>
    </Card>
  );
}

// Responsive row of stat cards
export function StatGrid({ stats }: { stats: StatCardProps[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
