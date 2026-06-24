'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Users2,
  ShoppingCart,
  Scan,
} from 'lucide-react';
import { FactoryOSLogo } from '@/components/factoryos-logo';

const sidebarItems = [
  { name: 'Dashboard',  href: '/app/dashboard',      icon: LayoutDashboard },
  { name: 'Products',   href: '/app/products',        icon: Package },
  { name: 'Inventory',  href: '/app/inventory',       icon: Archive },
  { name: 'Production', href: '/app/production',      icon: ClipboardList },
  { name: 'Finance',    href: '/app/finance',         icon: Receipt },
  { name: 'Documents',  href: '/app/documents',       icon: Scan },
  { name: 'Employees',  href: '/app/employees',       icon: Users },
  { name: 'Contacts',   href: '/app/contacts',        icon: Users2 },
  { name: 'Orders',     href: '/app/orders',          icon: ShoppingCart },
  { name: 'Machines',   href: '/app/machines',        icon: Cpu },
  { name: 'Reports',    href: '/app/reports',         icon: BarChart3 },
  { name: 'Settings',   href: '/app/settings',        icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="sidebar fixed inset-y-0 left-0 z-20 flex w-64 flex-col"
      style={{ animation: 'slideInLeft 0.3s ease both' }}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center px-5 border-b border-[var(--sidebar-border)]">
        <Link href="/app/dashboard" className="flex items-center group">
          <FactoryOSLogo size={28} variant="dark" />
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
    </aside>
  );
}
