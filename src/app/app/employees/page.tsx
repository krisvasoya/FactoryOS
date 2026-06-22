'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, UserCheck, UserX, IndianRupee, Calendar,
  X, ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle, Coffee,
} from 'lucide-react';
import { TableSkeleton } from '@/components/skeleton';

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  clockIn: string | null;
  clockOut: string | null;
}

interface Employee {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  department: string;
  role: string | null;
  salary: number;
  attendance: AttendanceRecord[];
}

type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave';

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; icon: React.ElementType; bg: string; text: string; dot: string }> = {
  Present: { label: 'Present', icon: CheckCircle2, bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-400' },
  Absent:  { label: 'Absent',  icon: XCircle,      bg: 'bg-red-500/10',     text: 'text-red-500',     dot: 'bg-red-400'     },
  Late:    { label: 'Late',    icon: Clock,         bg: 'bg-amber-500/10',   text: 'text-amber-500',   dot: 'bg-amber-400'   },
  Leave:   { label: 'Leave',   icon: Coffee,        bg: 'bg-sky-500/10',     text: 'text-sky-500',     dot: 'bg-sky-400'     },
};

function toLocalDateStr(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function AttendanceCalendar({
  attendance,
  employee,
}: {
  attendance: AttendanceRecord[];
  employee: Employee;
}) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const attMap: Record<string, string> = {};
  attendance.forEach((a) => {
    const key = toLocalDateStr(new Date(a.date));
    attMap[key] = a.status;
  });

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const presentDays = attendance.filter(a => {
    const d = new Date(a.date);
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear && a.status === 'Present';
  }).length;
  const absentDays = attendance.filter(a => {
    const d = new Date(a.date);
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear && a.status === 'Absent';
  }).length;
  const lateDays = attendance.filter(a => {
    const d = new Date(a.date);
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear && a.status === 'Late';
  }).length;

  return (
    <div className="space-y-4">
      {/* Monthly summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-emerald-500/10 p-3 text-center">
          <div className="text-lg font-bold text-emerald-500">{presentDays}</div>
          <div className="text-[10px] text-muted-foreground">Present</div>
        </div>
        <div className="rounded-xl bg-red-500/10 p-3 text-center">
          <div className="text-lg font-bold text-red-500">{absentDays}</div>
          <div className="text-[10px] text-muted-foreground">Absent</div>
        </div>
        <div className="rounded-xl bg-amber-500/10 p-3 text-center">
          <div className="text-lg font-bold text-amber-500">{lateDays}</div>
          <div className="text-[10px] text-muted-foreground">Late</div>
        </div>
      </div>

      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold">{monthLabel}</span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-muted-foreground mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const key = toLocalDateStr(new Date(viewYear, viewMonth, day));
          const status = attMap[key] as AttendanceStatus | undefined;
          const isToday = key === toLocalDateStr(today);
          const isFuture = new Date(viewYear, viewMonth, day) > today;

          let cellCls = 'rounded-lg h-8 w-full flex items-center justify-center text-[11px] font-semibold relative ';
          if (isToday) cellCls += 'ring-2 ring-primary ';
          if (isFuture) {
            cellCls += 'text-muted-foreground/30';
          } else if (status) {
            const cfg = STATUS_CONFIG[status];
            cellCls += `${cfg.bg} ${cfg.text}`;
          } else {
            cellCls += 'text-muted-foreground/50';
          }

          return (
            <div key={day} className={cellCls} title={status || (isFuture ? '' : 'Not marked')}>
              {day}
              {status && !isFuture && (
                <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${STATUS_CONFIG[status as AttendanceStatus].dot}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
        {(Object.entries(STATUS_CONFIG) as [AttendanceStatus, typeof STATUS_CONFIG[AttendanceStatus]][]).map(([s, cfg]) => (
          <div key={s} className="flex items-center gap-1.5 text-[10px]">
            <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
            <span className="text-muted-foreground">{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');

  // Date picker for bulk attendance
  const [selectedDate, setSelectedDate] = useState(toLocalDateStr(new Date()));

  // Employee profile drawer
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [empHistory, setEmpHistory] = useState<AttendanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Add employee form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Production');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');

  const loadEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/employees');
      if (res.ok) setEmployees(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const openEmployeeDrawer = async (emp: Employee) => {
    setSelectedEmployee(emp);
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/v1/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getEmployeeAttendance', employeeId: emp.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setEmpHistory(data.attendance ?? []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/v1/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createEmployee', name, email, phone, department, role, salary }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setName(''); setEmail(''); setPhone(''); setRole(''); setSalary('');
        loadEmployees();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to create employee');
      }
    } catch { setError('Connection failure'); }
  };

  const handleAttendance = async (employeeId: string, status: string) => {
    try {
      await fetch('/api/v1/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAttendance', employeeId, status, date: selectedDate }),
      });
      loadEmployees();
    } catch (e) { console.error(e); }
  };

  const getAttendanceForDate = (emp: Employee, dateStr: string) => {
    return emp.attendance.find(a => toLocalDateStr(new Date(a.date)) === dateStr);
  };

  const isToday = selectedDate === toLocalDateStr(new Date());
  const selectedDateLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);
  const markedToday = employees.filter(e => getAttendanceForDate(e, selectedDate)).length;
  const presentOnDate = employees.filter(e => getAttendanceForDate(e, selectedDate)?.status === 'Present').length;

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Employee Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track staff attendance, click a name to view their full attendance history.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2.5 text-xs shadow-md hover:scale-[1.02] hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Total Staff</div>
            <div className="text-xl font-bold mt-1">{employees.length}</div>
          </div>
          <Users className="h-6 w-6 text-sky-400" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Present</div>
            <div className="text-xl font-bold mt-1 text-emerald-500">{presentOnDate}</div>
          </div>
          <UserCheck className="h-6 w-6 text-emerald-500" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Marked</div>
            <div className="text-xl font-bold mt-1">{markedToday} / {employees.length}</div>
          </div>
          <UserX className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Monthly Payroll</div>
            <div className="text-xl font-bold mt-1">₹{totalPayroll.toLocaleString()}</div>
          </div>
          <IndianRupee className="h-6 w-6 text-amber-400" />
        </div>
      </div>

      {/* Attendance Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-xs font-bold">
          <Calendar className="h-4 w-4 text-primary" />
          <span>Marking attendance for:</span>
        </div>
        <div className="flex items-center gap-3 flex-1">
          <input
            type="date"
            value={selectedDate}
            max={toLocalDateStr(new Date())}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 rounded-xl border border-border bg-secondary/30 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          />
          <span className="text-xs text-muted-foreground">{selectedDateLabel}</span>
          {isToday && (
            <span className="rounded-lg bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 animate-pulse">
              TODAY
            </span>
          )}
        </div>
        {/* Bulk mark all present */}
        <button
          onClick={async () => {
            for (const emp of employees) {
              const att = getAttendanceForDate(emp, selectedDate);
              if (!att) {
                await fetch('/api/v1/employees', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'markAttendance', employeeId: emp.id, status: 'Present', date: selectedDate }),
                });
              }
            }
            loadEmployees();
          }}
          className="shrink-0 text-[10px] font-bold text-emerald-500 border border-emerald-500/30 rounded-lg px-3 py-1.5 hover:bg-emerald-500/10 transition-colors cursor-pointer"
        >
          ✓ Mark All Present
        </button>
      </div>

      {/* Employees Table */}
      {employees.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
          No employees registered. Add a team member to get started.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/20 text-muted-foreground">
                <th className="p-4 font-semibold">Employee</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Monthly Salary</th>
                <th className="p-4 font-semibold">Status — {selectedDateLabel}</th>
                <th className="p-4 font-semibold">Quick Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {employees.map((emp) => {
                const att = getAttendanceForDate(emp, selectedDate);
                const status = att?.status as AttendanceStatus | undefined;
                const cfg = status ? STATUS_CONFIG[status] : null;

                return (
                  <tr key={emp.id} className="hover:bg-secondary/20 transition-colors group">
                    {/* Clickable name cell */}
                    <td className="p-4">
                      <button
                        onClick={() => openEmployeeDrawer(emp)}
                        className="flex items-center gap-3 text-left group-hover:text-primary transition-colors"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-tr from-indigo-500 to-sky-400 text-white font-bold text-sm shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold group-hover:underline">{emp.name}</div>
                          <div className="text-[10px] text-muted-foreground">{emp.role || 'Staff'}</div>
                        </div>
                      </button>
                    </td>
                    <td className="p-4">
                      <span className="rounded-lg bg-secondary px-2 py-0.5 text-[10px] font-bold">{emp.department}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <div>{emp.email || '—'}</div>
                      <div className="text-[10px]">{emp.phone || '—'}</div>
                    </td>
                    <td className="p-4 font-bold">₹{emp.salary.toLocaleString()}</td>
                    <td className="p-4">
                      {cfg ? (
                        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {status}
                          {att?.clockIn && (
                            <span className="opacity-70 font-normal ml-0.5">
                              {new Date(att.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground italic">
                          <AlertCircle className="h-3 w-3" /> Not marked
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(['Present', 'Absent', 'Late', 'Leave'] as AttendanceStatus[]).map((s) => {
                          const c = STATUS_CONFIG[s];
                          return (
                            <button
                              key={s}
                              onClick={() => handleAttendance(emp.id, s)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all cursor-pointer border ${
                                status === s
                                  ? `${c.bg} ${c.text} border-current`
                                  : 'border-border text-muted-foreground hover:border-current hover:' + c.text
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Employee Attendance History Drawer */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedEmployee(null)}
          />
          {/* Drawer panel */}
          <div
            className="relative w-full max-w-md h-full bg-card border-l border-border shadow-2xl flex flex-col overflow-hidden"
            style={{ animation: 'slideInRight 0.25s ease both' }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-linear-to-tr from-indigo-500 to-sky-400 text-white font-bold flex items-center justify-center shrink-0">
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold">{selectedEmployee.name}</div>
                  <div className="text-[10px] text-muted-foreground">{selectedEmployee.role || 'Staff'} · {selectedEmployee.department}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Employee Info strip */}
            <div className="px-5 py-3 border-b border-border grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-[10px] text-muted-foreground">Email</div>
                <div className="font-medium">{selectedEmployee.email || '—'}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Phone</div>
                <div className="font-medium">{selectedEmployee.phone || '—'}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Monthly Salary</div>
                <div className="font-bold text-sm">₹{selectedEmployee.salary.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Total Records</div>
                <div className="font-bold text-sm">{empHistory.length} days</div>
              </div>
            </div>

            {/* Attendance Calendar */}
            <div className="flex-1 overflow-y-auto p-5">
              {historyLoading ? (
                <div className="flex items-center justify-center h-40 text-xs text-muted-foreground">
                  Loading attendance history…
                </div>
              ) : (
                <AttendanceCalendar attendance={empHistory} employee={selectedEmployee} />
              )}

              {/* Recent history list */}
              {!historyLoading && empHistory.length > 0 && (
                <div className="mt-6 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Recent Activity
                  </div>
                  {empHistory.slice(0, 15).map((a) => {
                    const s = a.status as AttendanceStatus;
                    const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.Absent;
                    return (
                      <div key={a.id} className="flex items-center justify-between rounded-xl px-3 py-2 border border-border/60 hover:bg-secondary/20 transition-colors">
                        <div className="text-xs">
                          <div className="font-semibold">
                            {new Date(a.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </div>
                          {a.clockIn && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              In: {new Date(a.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {a.clockOut && ` · Out: ${new Date(a.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </div>
                          )}
                        </div>
                        <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold ${cfg.bg} ${cfg.text}`}>
                          {a.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-sky-400" /> Add Employee
              </span>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            {error && <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Full Name *</label>
                  <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Vikram Singh"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Department *</label>
                  <select value={department} onChange={e => setDepartment(e.target.value)}
                    className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none">
                    <option>Production</option>
                    <option>Warehouse</option>
                    <option>Quality</option>
                    <option>Admin</option>
                    <option>Sales</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="emp@company.com"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 99999 00000"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Job Role / Title</label>
                  <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. SMT Operator"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Monthly Salary (₹)</label>
                  <input type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. 28000"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none" />
                </div>
              </div>
              <button type="submit"
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[0.98] hover:opacity-90 transition-all cursor-pointer">
                Onboard Employee
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
