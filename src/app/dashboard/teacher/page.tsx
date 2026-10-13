'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Upload, FileQuestion, ClipboardList, BarChart3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchMaterials } from '@/lib/features/materials/materialsSlice';
import { fetchExams, type Exam } from '@/lib/features/exams/examsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionCard, type ActionCardProps } from '@/components/shared/ActionCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatGrid, type StatCardProps } from '@/components/shared/StatCard';

const quickActions: ActionCardProps[] = [
  {
    title: 'Upload Study Material',
    description: 'Upload a PDF or DOCX file and let AI process it',
    href: '/dashboard/teacher/upload',
    icon: Upload,
  },
  {
    title: 'Generate Questions',
    description: 'AI generates exam questions from your materials',
    href: '/dashboard/teacher/generate',
    icon: FileQuestion,
  },
  {
    title: 'View My Exams',
    description: 'Manage and publish your created exams',
    href: '/dashboard/teacher/exams',
    icon: ClipboardList,
  },
];

const steps = [
  'Upload your study materials (PDF or DOCX)',
  'AI reads and processes your documents',
  'Generate exam questions automatically',
  'Review, edit and publish your exam',
  'Students take the exam — AI grades instantly',
];

export default function TeacherDashboard() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { items, status } = useAppSelector((state) => state.materials);

  const exams = useAppSelector((state) => state.exams);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchMaterials());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (exams.status === 'idle') {
      dispatch(fetchExams());
    }
  }, [exams.status, dispatch]);

  const examsLoaded = exams.status === 'succeeded';
  const sum = (pick: (exam: Exam) => number) => exams.items.reduce((total, exam) => total + pick(exam), 0);

  const stats: StatCardProps[] = [
    { label: 'Materials Uploaded', value: status === 'succeeded' ? items.length : '—', icon: Upload, tone: 'vivid' },
    { label: 'Exams Created', value: examsLoaded ? exams.items.length : '—', icon: ClipboardList, tone: 'navy' },
    { label: 'Questions In Exams', value: examsLoaded ? sum((exam) => exam.question_count) : '—', icon: FileQuestion, tone: 'bright' },
    { label: 'Student Attempts', value: examsLoaded ? sum((exam) => exam.submission_count) : '—', icon: BarChart3, tone: 'soft' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        variant="hero"
        title={`Good day, ${user?.name.split(' ')[0]} 👋`}
        description="Here's an overview of your teaching activity on Gradedman."
        action={
          <Button asChild variant="outline" size="lg" className="border-transparent px-4 font-semibold text-brand-800 shadow-lg hover:bg-brand-50">
            <Link href="/dashboard/teacher/generate">
              <Sparkles />
              Create an exam
            </Link>
          </Button>
        }
      />

      <StatGrid stats={stats} />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-brand-950">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <ActionCard key={action.href} {...action} />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-brand-950">How Gradedman works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, i) => (
              <li key={step} className="rounded-xl bg-brand-50 p-4 text-sm text-brand-900">
                <span className="mb-3 flex size-8 items-center justify-center rounded-full bg-brand-vivid text-sm font-bold text-white shadow-md shadow-brand-600/30">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
