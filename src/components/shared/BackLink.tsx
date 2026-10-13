import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button variant="ghost" size="sm" asChild>
      <Link href={href}>
        <ArrowLeft />
        {children}
      </Link>
    </Button>
  );
}
