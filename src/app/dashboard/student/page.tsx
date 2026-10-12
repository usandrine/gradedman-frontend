'use client';

import { BookOpen, Trophy, Clock, CheckCircle2 } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatGrid, type StatCardProps } from '@/components/shared/StatCard';

// Placeholder numbers until the exam system exists (Phase 6)
const stats: StatCardProps[] = [
  { label: 'Exams Available', value: '0', icon: BookOpen, tone: 'blue' },
  { label: 'Exams Completed', value: '0', icon: CheckCircle2, tone: 'green' },
  { label: 'Average Score', value: '—', icon: Trophy, tone: 'yellow' },
  { label: 'Time Spent', value: '0h', icon: Clock, tone: 'purple' },
];

export default function StudentDashboard() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${user?.name.split(' ')[0]} 🎓`}
        description="Ready to test your knowledge? Your exams will show up here."
      />

      <StatGrid stats={stats} />

      <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30 ring-0">
        <CardContent>
          <EmptyState
            icon={BookOpen}
            title="No exams yet"
            description="When your teacher publishes an exam, you'll be able to take it from here."
          />
        </CardContent>
      </Card>
    </div>
  );
}
