import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  // Tailwind background class for the icon tile, e.g. 'bg-purple-600'
  color: string;
  // Page is planned for a later phase — shown but not clickable yet
  comingSoon?: boolean;
}

export function ActionCard({ title, description, href, icon: Icon, color, comingSoon }: ActionCardProps) {
  const card = (
    <Card className={cn('group h-full transition-shadow', comingSoon ? 'opacity-60' : 'hover:shadow-md')}>
      <CardContent>
        <div className={cn('mb-4 flex size-11 items-center justify-center rounded-xl', color)}>
          <Icon className="size-5 text-white" />
        </div>
        <h3 className={cn('font-semibold text-gray-900', !comingSoon && 'transition-colors group-hover:text-primary')}>
          {title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
          {comingSoon ? (
            <span className="text-muted-foreground">Coming soon</span>
          ) : (
            <>
              Get started <ArrowRight className="size-3.5" />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return comingSoon ? card : <Link href={href}>{card}</Link>;
}
