import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  // Page is planned for a later phase — shown but not clickable yet
  comingSoon?: boolean;
}

export function ActionCard({ title, description, href, icon: Icon, comingSoon }: ActionCardProps) {
  const card = (
    <Card
      className={cn(
        'group relative h-full overflow-hidden transition-all',
        comingSoon ? 'opacity-60' : 'hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-200/70 hover:ring-brand-300'
      )}
    >
      {/* Bright bar that slides in on hover */}
      {!comingSoon && (
        <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-brand-vivid transition-transform duration-300 group-hover:scale-x-100" />
      )}

      <CardContent>
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-brand-vivid shadow-lg shadow-brand-600/30">
          <Icon className="size-6 text-white" />
        </div>
        <h3 className="font-semibold text-brand-950">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand-600">
          {comingSoon ? (
            <span className="font-medium text-muted-foreground">Coming soon</span>
          ) : (
            <>
              Get started <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return comingSoon ? card : <Link href={href}>{card}</Link>;
}
