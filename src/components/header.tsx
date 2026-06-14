'use client';

import React, { useState } from 'react';
import { useTheme } from './theme-context';
import { Sun, Moon, Bell, Search, Settings, Calendar, ChevronDown, RefreshCw } from 'lucide-react';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
}

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 1, title: 'Low Stock Alert', message: 'RGB Status Indicator LED count is 450 (min 1000)', type: 'warning' },
    { id: 2, title: 'Maintenance Overdue', message: 'Plastic Injection Press 02 maintenance scheduled for 2026-06-12 is overdue', type: 'error' },
    { id: 3, title: 'Production Complete', message: 'Production Order PO-2026-02 is completed (20 units)', type: 'info' },
    { id: 4, title: 'New Order Received', message: 'Production order PO-2026-089 has been queued', type: 'info' },
  ]);

  const unreadCount = notifications.length;
  const markAllRead = () => setNotifications([]);

  return (
    <header
      className="top-header fixed top-0 right-0 z-10 flex h-16 w-[calc(100%-16rem)] items-center justify-between px-6"
      style={{ animation: 'fadeIn 0.35s ease both' }}
    >
      {/* Search Bar */}
      <div className="relative w-96 flex items-center">
        <Search
          className="absolute left-3 h-3.5 w-3.5"
          style={{ color: 'var(--muted-foreground)' }}
        />
        <input
          type="text"
          placeholder="Search anything... (Products, Orders, Invoices...)"
          className="h-9 w-full rounded-lg border pl-9 pr-12 text-xs outline-none transition-all duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--card-subtle)',
            color: 'var(--foreground)',
          }}
        />
        <span
          className="absolute right-3 px-1.5 py-0.5 rounded border text-[9px] font-medium pointer-events-none"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--card)',
            color: 'var(--muted-foreground)',
          }}
        >
          ⌘K
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Date Selector Dropdown */}
        <button
          className="flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-all duration-200 hover:bg-(--hover-bg) active:scale-95"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--card)',
            color: 'var(--foreground)',
          }}
        >
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">This Month</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {/* Refresh button */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 hover:bg-(--hover-bg) active:scale-95"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--card)',
            color: 'var(--foreground)',
          }}
          title="Refresh Data"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 hover:bg-(--hover-bg) active:scale-95"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--card)',
            }}
            title="Notifications"
          >
            <Bell className="h-4 w-4" style={{ color: 'var(--foreground)' }} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#10b981] text-[9px] font-bold text-white shadow">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-xl border shadow-xl animate-scale-in"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] font-medium hover:underline"
                    style={{ color: '#3b82f6' }}
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="space-y-2 p-3 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-4 text-center text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                    No active notifications
                  </div>
                ) : (
                  notifications.map((notif: NotificationItem) => (
                    <div
                      key={notif.id}
                      className="rounded-lg border p-2.5 text-xs"
                      style={{
                        borderColor: notif.type === 'error'
                          ? 'var(--status-danger-bg)'
                          : notif.type === 'warning'
                          ? 'var(--status-warning-bg)'
                          : 'var(--status-info-bg)',
                        backgroundColor: notif.type === 'error'
                          ? 'var(--status-danger-bg)'
                          : notif.type === 'warning'
                          ? 'var(--status-warning-bg)'
                          : 'var(--status-info-bg)',
                      }}
                    >
                      <div
                        className="font-semibold text-[11px]"
                        style={{
                          color: notif.type === 'error' ? 'var(--status-danger-text)' : notif.type === 'warning' ? 'var(--status-warning-text)' : 'var(--status-info-text)',
                        }}
                      >
                        {notif.title}
                      </div>
                      <div
                        className="text-[10px] mt-0.5 leading-relaxed"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {notif.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings button */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 hover:bg-(--hover-bg) active:scale-95"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--card)',
            color: 'var(--foreground)',
          }}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* Theme Toggler */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 hover:bg-(--hover-bg) active:scale-95"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--card)',
          }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-500" />
          )}
        </button>
      </div>
    </header>
  );
}
