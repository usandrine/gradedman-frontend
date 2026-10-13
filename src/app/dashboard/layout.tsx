//src/app/dashboard/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ServerCrash } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getCurrentUser, logout, type UserRole } from '@/lib/features/auth/authSlice';
import { DASHBOARD_HOME } from '@/config/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { EmptyState } from '@/components/shared/EmptyState';
import { FullPageLoader } from '@/components/shared/FullPageLoader';
import { Button } from '@/components/ui/button';

// Is this path inside another role's area? e.g. a student opening /dashboard/teacher/upload
const isOtherRolesArea = (pathname: string, role: UserRole) =>
  Object.entries(DASHBOARD_HOME).some(
    ([otherRole, home]) => otherRole !== role && (pathname === home || pathname.startsWith(`${home}/`))
  );

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, token, userStatus } = useAppSelector((state) => state.auth);

  const wrongArea = !!user && isOtherRolesArea(pathname, user.role);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    } else if (!user && userStatus === 'idle') {
      // We have a token but no user in state (e.g. after page refresh) — fetch the user
      dispatch(getCurrentUser());
    }
  }, [token, user, userStatus, dispatch, router]);

  useEffect(() => {
    if (user && wrongArea) {
      router.replace(DASHBOARD_HOME[user.role]);
    }
  }, [user, wrongArea, router]);

  if (!user && userStatus === 'failed') {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-50">
        <EmptyState
          icon={ServerCrash}
          title="Couldn't load your account"
          description="The server didn't respond. Check that the API is running, then try again."
          action={<Button onClick={() => dispatch(getCurrentUser())}>Try again</Button>}
        />
      </div>
    );
  }

  if (!user || wrongArea) {
    return <FullPageLoader message="Loading your dashboard..." />;
  }

  return (
    <DashboardShell user={user} onLogout={() => dispatch(logout())}>
      {children}
    </DashboardShell>
  );
}
