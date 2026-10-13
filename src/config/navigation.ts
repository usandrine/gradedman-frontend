import {
  LayoutDashboard,
  Upload,
  FileQuestion,
  ClipboardList,
  BarChart3,
  BookOpen,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/lib/features/auth/authSlice';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  // Page is planned for a later phase — shown but not clickable yet
  comingSoon?: boolean;
}

export const DASHBOARD_HOME: Record<UserRole, string> = {
  teacher: '/dashboard/teacher',
  student: '/dashboard/student',
};

// Nav items per role
export const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  teacher: [
    { label: 'Dashboard', href: '/dashboard/teacher', icon: LayoutDashboard },
    { label: 'Upload Materials', href: '/dashboard/teacher/upload', icon: Upload },
    { label: 'Generate Questions', href: '/dashboard/teacher/generate', icon: FileQuestion },
    { label: 'My Exams', href: '/dashboard/teacher/exams', icon: ClipboardList },
    { label: 'Results', href: '/dashboard/teacher/results', icon: BarChart3 },
  ],
  student: [
    { label: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
    { label: 'Available Exams', href: '/dashboard/student/exams', icon: BookOpen },
    { label: 'My Results', href: '/dashboard/student/results', icon: Trophy },
  ],
};
