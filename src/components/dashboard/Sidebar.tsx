'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/features/auth/authSlice';
import { DASHBOARD_HOME, NAV_ITEMS, type NavItem } from '@/config/navigation';
import { Logo } from '@/components/shared/Logo';

const navItemClass = 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all';

function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  if (item.comingSoon) {
    return (
      <span className={cn(navItemClass, 'cursor-not-allowed text-white/35')} aria-disabled="true">
        <item.icon className="size-4 shrink-0" />
        {item.label}
        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/60 uppercase">
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
          ? 'bg-white text-brand-800 shadow-lg shadow-brand-950/40'
          : 'text-brand-100 hover:bg-white/10 hover:text-white'
      )}
    >
      <item.icon className={cn('size-4 shrink-0', active && 'text-brand-600')} />
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
    <div className="flex h-full flex-col bg-brand-gradient text-white">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6">
        <Logo variant="light" />
        <div>
          <p className="text-lg leading-none font-bold tracking-tight">Gradedman</p>
          <p className="mt-1 text-xs text-brand-200">AI Exam Platform</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-brand-300 uppercase">Menu</p>
        {NAV_ITEMS[user.role].map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} onNavigate={onNavigate} />
        ))}
      </nav>

      {/* User + logout */}
      <div className="space-y-2 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-brand-800">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-brand-200 capitalize">{user.role}</p>
          </div>
        </div>

        <button onClick={onLogout} className={cn(navItemClass, 'w-full text-brand-100 hover:bg-white/10 hover:text-white')}>
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
