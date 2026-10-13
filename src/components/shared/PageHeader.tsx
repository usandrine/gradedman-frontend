interface PageHeaderProps {
  title: string;
  description?: string;
  // Optional buttons shown on the right
  action?: React.ReactNode;
  // "hero" is the big dark blue banner used at the top of the dashboards
  variant?: 'plain' | 'hero';
}

export function PageHeader({ title, description, action, variant = 'plain' }: PageHeaderProps) {
  if (variant === 'hero') {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 text-white shadow-xl shadow-brand-800/25 lg:p-8">
        <div className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 size-56 rounded-full bg-brand-500/20 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{title}</h1>
            {description && <p className="mt-2 max-w-xl text-brand-100">{description}</p>}
          </div>
          {action}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-950">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
