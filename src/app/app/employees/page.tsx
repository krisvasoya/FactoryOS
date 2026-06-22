'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, UserCheck, UserX, DollarSign } from 'lucide-react';
import { TableSkeleton } from '@/components/skeleton';

interface Attendance {
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
  attendance: Attendance[];
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Production');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');

  async function loadEmployees() {
    try {
      const res = await fetch('/api/v1/employees');
      if (res.ok) setEmployees(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      loadEmployees();
    }, 0);
  }, []);

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
        setShowModal(false);
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
        body: JSON.stringify({ action: 'markAttendance', employeeId, status }),
      });
      loadEmployees();
    } catch (e) { console.error(e); }
  };

  const getTodayAttendance = (emp: Employee) => {
    const today = new Date().toDateString();
    return emp.attendance.find(a => new Date(a.date).toDateString() === today);
  };

  const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);
  const presentToday = employees.filter(e => getTodayAttendance(e)?.status === 'Present').length;

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Employee Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track staff attendance, departments, payroll, and performance.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2.5 text-xs shadow-md hover:scale-[1.02] hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
          <div><div className="text-[10px] font-bold text-muted-foreground uppercase">Total Staff</div><div className="text-xl font-bold mt-1">{employees.length}</div></div>
          <Users className="h-6 w-6 text-sky-400" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
          <div><div className="text-[10px] font-bold text-muted-foreground uppercase">Present Today</div><div className="text-xl font-bold mt-1 text-emerald-500">{presentToday}</div></div>
          <UserCheck className="h-6 w-6 text-emerald-500" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
          <div><div className="text-[10px] font-bold text-muted-foreground uppercase">Monthly Payroll</div><div className="text-xl font-bold mt-1">${totalPayroll.toLocaleString()}</div></div>
          <DollarSign className="h-6 w-6 text-amber-400" />
        </div>
      </div>

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
                <th className="p-4 font-semibold">Today&apos;s Status</th>
                <th className="p-4 font-semibold">Quick Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {employees.map((emp) => {
                const todayAtt = getTodayAttendance(emp);
                return (
                  <tr key={emp.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 text-white font-bold text-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold">{emp.name}</div>
                          <div className="text-[10px] text-muted-foreground">{emp.role || 'Staff'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="rounded-lg bg-secondary px-2 py-0.5 text-[10px] font-bold">{emp.department}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <div>{emp.email || '—'}</div>
                      <div className="text-[10px]">{emp.phone || '—'}</div>
                    </td>
                    <td className="p-4 font-bold">${emp.salary.toLocaleString()}</td>
                    <td className="p-4">
                      {todayAtt ? (
                        <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold ${
                          todayAtt.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500'
                          : todayAtt.status === 'Absent' ? 'bg-red-500/10 text-red-500'
                          : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {todayAtt.status}
                          {todayAtt.clockIn && ` · ${new Date(todayAtt.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Not marked</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAttendance(emp.id, 'Present')}
                          className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold hover:underline"
                        >
                          <UserCheck className="h-3.5 w-3.5" /> Present
                        </button>
                        <button
                          onClick={() => handleAttendance(emp.id, 'Absent')}
                          className="flex items-center gap-1 text-[10px] text-red-500 font-bold hover:underline"
                        >
                          <UserX className="h-3.5 w-3.5" /> Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-sm">Add Employee</span>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground text-xs hover:text-foreground">Cancel</button>
            </div>
            {error && <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Full Name *</label>
                  <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Vikram Singh" className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Department *</label>
                  <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none">
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
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="emp@company.com" className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 0000" className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Job Role / Title</label>
                  <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. SMT Operator" className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Monthly Salary ($)</label>
                  <input type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="2800" className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[0.98] hover:opacity-90 transition-all cursor-pointer">
                Onboard Employee
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
