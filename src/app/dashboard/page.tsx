'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';
import { DASHBOARD_HOME } from '@/config/navigation';

// /dashboard just forwards to the home page for the user's role
export default function DashboardPage() {
  const router = useRouter();
  const role = useAppSelector((state) => state.auth.user?.role);

  useEffect(() => {
    if (role) {
      router.replace(DASHBOARD_HOME[role]);
    }
  }, [role, router]);

  return null;
}
