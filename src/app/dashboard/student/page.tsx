'use client';

import { useEffect } from 'react';
import { BookOpen, Trophy, Clock, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchAvailableExams } from '@/lib/features/exams/studentExamsSlice';
import { ActionCard } from '@/components/shared/ActionCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatGrid, type StatCardProps } from '@/components/shared/StatCard';

export default function StudentDashboard() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { items, status } = useAppSelector((state) => state.studentExams);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAvailableExams());
    }
  }, [status, dispatch]);

  const loaded = status === 'succeeded';
  const completed = items.filter((exam) => exam.submission && exam.submission.status !== 'in_progress').length;
  const inProgress = items.filter((exam) => exam.submission?.status === 'in_progress').length;

  // Average over graded exams, as a percentage of each exam's total
  const graded = items.filter((exam) => exam.submission?.status === 'graded' && exam.submission.score !== null);
  const average =
    graded.length > 0
      ? `${Math.round((graded.reduce((sum, exam) => sum + exam.submission!.score! / exam.total_marks, 0) / graded.length) * 100)}%`
      : '—';

  const stats: StatCardProps[] = [
    { label: 'Exams To Take', value: loaded ? items.length - completed : '—', icon: BookOpen, tone: 'vivid' },
    { label: 'Exams Completed', value: loaded ? completed : '—', icon: CheckCircle2, tone: 'bright' },
    { label: 'In Progress', value: loaded ? inProgress : '—', icon: Clock, tone: 'navy' },
    { label: 'Average Score', value: loaded ? average : '—', icon: Trophy, tone: 'soft' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        variant="hero"
        title={`Hello, ${user?.name.split(' ')[0]} 🎓`}
        description="Ready to test your knowledge? Check your available exams below."
      />

      <StatGrid stats={stats} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ActionCard
          title="Browse Available Exams"
          description="Take the exams your teachers have published"
          href="/dashboard/student/exams"
          icon={BookOpen}
        />
        <ActionCard
          title="My Results"
          description="See your scores and feedback after grading"
          href="/dashboard/student/results"
          icon={Trophy}
        />
      </div>
    </div>
  );
}
