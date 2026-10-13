'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import type { User } from '@/lib/features/auth/authSlice';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { RoleBadge } from '@/components/shared/RoleBadge';

interface DashboardShellProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

// Sidebar + top bar frame shared by every dashboard page
export function DashboardShell({ user, onLogout, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-50">
      {/* Sidebar — Desktop */}
      <aside className="hidden w-64 shrink-0 flex-col lg:flex">
        <Sidebar user={user} onLogout={onLogout} />
      </aside>

      {/* Sidebar — Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute top-0 bottom-0 left-0 w-64 shadow-2xl">
            <Sidebar user={user} onLogout={onLogout} onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-brand-100 bg-white/80 px-4 backdrop-blur lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-brand-800 hover:bg-brand-50 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <h2 className="hidden text-sm font-medium text-muted-foreground lg:block">
            Welcome back, <span className="font-semibold text-brand-950">{user.name}</span> 👋
          </h2>
          <RoleBadge role={user.role} className="ml-auto" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
