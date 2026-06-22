'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from './theme-context';
import { Sun, Moon, Bell, Search, Settings, Calendar, ChevronDown, RefreshCw } from 'lucide-react';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
}

export default function Header() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [period, setPeriod] = useState('This Month');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch('/api/v1/dashboard');
        if (res.ok) {
          const data = await res.json();
          const list: NotificationItem[] = [];
          
          // 1. Low Stock alerts from dynamic database
          if (data.lowStock && data.lowStock.length > 0) {
            data.lowStock.forEach((item: any, idx: number) => {
              list.push({
                id: idx + 1,
                title: 'Low Stock Alert',
                message: `${item.name} count is ${item.currentStock} ${item.unit} (min ${item.minStock} ${item.unit})`,
                type: 'warning',
              });
            });
          }

          // 2. Machine maintenance alert from dynamic database
          if (data.machines && data.machines.maintenance > 0) {
            list.push({
              id: list.length + 1,
              title: 'Machine Maintenance',
              message: `${data.machines.maintenance} machine(s) are currently undergoing maintenance checkups.`,
              type: 'info',
            });
          }

          setNotifications(list);

          // 3. Trigger active alert notification to the user if warnings exist
          if (list.length > 0) {
            const warningNotifs = list.filter(n => n.type === 'warning');
            if (warningNotifs.length > 0) {
              const firstWarning = warningNotifs[0];
              alert(`🚨 ${firstWarning.title}: ${firstWarning.message}`);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load header notification telemetry', e);
      }
    }
    fetchAlerts();
  }, []);

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
        <div className="relative">
          <button
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-all duration-200 hover:bg-(--hover-bg) active:scale-95 cursor-pointer"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--card)',
              color: 'var(--foreground)',
            }}
          >
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{period}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {showPeriodDropdown && (
            <div
              className="absolute right-0 mt-2 w-40 rounded-xl border shadow-xl animate-scale-in z-20"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="p-1.5 space-y-0.5">
                {['This Month', 'Last 30 Days', 'This Year'].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPeriod(p);
                      setShowPeriodDropdown(false);
                      alert(`📅 Period filter changed to: ${p}`);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                      period === p ? 'bg-secondary text-primary font-bold' : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={() => {
            alert('🔄 Refreshing data fields across all modules...');
            window.location.reload();
          }}
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 hover:bg-(--hover-bg) active:scale-95 cursor-pointer"
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
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 hover:bg-(--hover-bg) active:scale-95 cursor-pointer"
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
              className="absolute right-0 mt-2 w-80 rounded-xl border shadow-xl animate-scale-in z-20"
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
                    className="text-[10px] font-medium hover:underline cursor-pointer"
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
          onClick={() => router.push('/app/settings')}
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 hover:bg-(--hover-bg) active:scale-95 cursor-pointer"
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
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 hover:bg-(--hover-bg) active:scale-95 cursor-pointer"
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
