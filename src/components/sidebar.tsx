'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Archive,
  ClipboardList,
  Receipt,
  Users,
  Cpu,
  BarChart3,
  Settings,
  LogOut,
  Factory,
} from 'lucide-react';

const sidebarItems = [
  { name: 'Dashboard',  href: '/app/dashboard',      icon: LayoutDashboard },
  { name: 'Products',   href: '/app/products',        icon: Package },
  { name: 'Inventory',  href: '/app/inventory',       icon: Archive },
  { name: 'Production', href: '/app/production',      icon: ClipboardList },
  { name: 'Finance',    href: '/app/finance',         icon: Receipt },
  { name: 'Employees',  href: '/app/employees',       icon: Users },
  { name: 'Machines',   href: '/app/machines',        icon: Cpu },
  { name: 'Reports',    href: '/app/reports',         icon: BarChart3 },
  { name: 'Settings',   href: '/app/settings',        icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<{ name: string; role: string } | null>(null);

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/v1/auth');
        if (res.ok) {
          const data = await res.json();
          setUser({
            name: data.user.name,
            role: data.user.role,
          });
        }
      } catch (err) {
        console.error('Failed to load user info in sidebar', err);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth', { method: 'DELETE' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside
      className="sidebar fixed inset-y-0 left-0 z-20 flex w-64 flex-col"
      style={{ animation: 'slideInLeft 0.3s ease both' }}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center px-5 border-b border-[var(--sidebar-border)]">
        <Link href="/app/dashboard" className="flex items-center gap-2.5 group">
          {/* Factory-specific icon mark */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #10221a 0%, #070809 100%)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              border: '1px solid var(--sidebar-border)',
            }}
          >
            <Factory className="h-4 w-4 text-(--sidebar-active-text)" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col leading-none">
            <span
              className="font-bold text-sm tracking-tight"
              style={{ color: 'var(--foreground)' }}
            >
              FactoryOS
            </span>
            <span
              className="text-[10px] font-medium mt-0.5"
              style={{ color: 'var(--muted-foreground)' }}
            >
              AI
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {sidebarItems.map((item, idx) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={`${item.name}-${idx}`}
              href={item.href}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <Icon
                className="sidebar-icon h-4 w-4 flex-shrink-0"
                strokeWidth={isActive ? 2 : 1.75}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile & Sign Out */}
      <div
        className="p-4 border-t flex flex-col gap-3"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        {user && (
          <div className="flex items-center gap-3 px-1 animate-fade-in">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold border"
              style={{
                background: 'linear-gradient(135deg, #10221a, #070809)',
                borderColor: 'var(--sidebar-border)',
                color: 'var(--sidebar-active-text)',
              }}
            >
              {getInitials(user.name)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                {user.name}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                {user.role}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-left flex items-center gap-2 px-1 hover:bg-red-500/10 rounded-lg py-1.5 transition-all"
          style={{ color: '#f87171' }}
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} style={{ color: '#f87171' }} />
          <span className="text-xs font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
