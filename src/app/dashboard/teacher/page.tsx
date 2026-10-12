'use client';

import { useEffect } from 'react';
import { Upload, FileQuestion, ClipboardList, BarChart3 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchMaterials } from '@/lib/features/materials/materialsSlice';
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
    color: 'bg-blue-600',
  },
  {
    title: 'Generate Questions',
    description: 'AI generates exam questions from your materials',
    href: '/dashboard/teacher/generate',
    icon: FileQuestion,
    color: 'bg-purple-600',
    comingSoon: true,
  },
  {
    title: 'View My Exams',
    description: 'Manage and publish your created exams',
    href: '/dashboard/teacher/exams',
    icon: ClipboardList,
    color: 'bg-green-600',
    comingSoon: true,
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

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchMaterials());
    }
  }, [status, dispatch]);

  // Exams, questions and grading are placeholders until those phases exist
  const stats: StatCardProps[] = [
    { label: 'Materials Uploaded', value: status === 'succeeded' ? items.length : '—', icon: Upload, tone: 'blue' },
    { label: 'Exams Created', value: '0', icon: ClipboardList, tone: 'purple' },
    { label: 'Questions Generated', value: '0', icon: FileQuestion, tone: 'green' },
    { label: 'Students Graded', value: '0', icon: BarChart3, tone: 'orange' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good day, ${user?.name.split(' ')[0]} 👋`}
        description="Here's an overview of your teaching activity on Gradedman."
      />

      <StatGrid stats={stats} />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <ActionCard key={action.href} {...action} />
          ))}
        </div>
      </div>

      <Card className="bg-blue-50/50 ring-blue-100">
        <CardHeader>
          <CardTitle className="font-semibold text-blue-900">🚀 How Gradedman works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {steps.map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-sm text-blue-800">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
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
