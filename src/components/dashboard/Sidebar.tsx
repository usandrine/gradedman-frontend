'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/features/auth/authSlice';
import { DASHBOARD_HOME, NAV_ITEMS, type NavItem } from '@/config/navigation';
import { Logo } from '@/components/shared/Logo';
import { RoleBadge } from '@/components/shared/RoleBadge';

const navItemClass = 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all';

function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  if (item.comingSoon) {
    return (
      <span className={cn(navItemClass, 'cursor-not-allowed text-gray-400')} aria-disabled="true">
        <item.icon className="size-4 shrink-0" />
        {item.label}
        <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 uppercase">
          Soon
        </span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        navItemClass,
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <item.icon className="size-4 shrink-0" />
      {item.label}
    </Link>
  );
}

interface SidebarProps {
  user: User;
  onLogout: () => void;
  // Called after a link is clicked — used to close the mobile drawer
  onNavigate?: () => void;
}

export function Sidebar({ user, onLogout, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const home = DASHBOARD_HOME[user.role];

  // The dashboard home only matches exactly; other items also match their sub-pages
  const isActive = (href: string) =>
    href === home ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
        <Logo />
        <div>
          <p className="leading-none font-bold text-gray-900">Gradedman</p>
          <p className="mt-0.5 text-xs text-gray-400">AI Exam Platform</p>
        </div>
      </div>

      {/* User info */}
      <div className="border-b border-gray-100 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary">
            <UserIcon className="size-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
            <RoleBadge role={user.role} className="mt-0.5" />
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {NAV_ITEMS[user.role].map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} onNavigate={onNavigate} />
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-100 p-4">
        <button onClick={onLogout} className={cn(navItemClass, 'w-full text-red-600 hover:bg-red-50')}>
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
