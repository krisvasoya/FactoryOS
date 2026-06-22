'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Activity, ShieldAlert, CheckSquare, Clock } from 'lucide-react';
import { TableSkeleton } from '@/components/skeleton';

interface MaintenanceLog {
  id: string;
  description: string;
  cost: number;
  scheduledAt: string;
  completedAt: string | null;
  notes: string | null;
}

interface Machine {
  id: string;
  name: string;
  code: string;
  status: string;
  runningHours: number;
  lastMaintenance: string | null;
  maintenanceLogs: MaintenanceLog[];
}

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [error, setError] = useState('');

  // Schedule Form State
  const [machineId, setMachineId] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  // Complete Form State
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [logId, setLogId] = useState('');
  const [notes, setNotes] = useState('');

  const [now] = useState(() => Date.now());

  const loadMachines = React.useCallback(async () => {
    try {
      const res = await fetch('/api/v1/machines');
      if (res.ok) {
        const data = await res.json();
        setMachines(data);
        if (data.length > 0) {
          setMachineId(data[0].id);
          setSelectedMachine(data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const res = await fetch('/api/v1/machines');
        if (res.ok && active) {
          const data = await res.json();
          setMachines(data);
          if (data.length > 0) {
            setMachineId(data[0].id);
            setSelectedMachine(data[0]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    init();
    return () => { active = false; };
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/v1/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createMaintenance',
          machineId,
          description,
          cost,
          scheduledAt,
        }),
      });

      if (res.ok) {
        setShowScheduleModal(false);
        setDescription('');
        setCost('');
        setScheduledAt('');
        loadMachines();
      } else {
        const payload = await res.json();
        setError(payload.error || 'Failed to schedule checkup.');
      }
    } catch {
      setError('Connection failure.');
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/v1/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'completeMaintenance',
          logId,
          machineId: selectedMachine?.id,
          notes,
        }),
      });

      if (res.ok) {
        setShowCompleteModal(false);
        setNotes('');
        loadMachines();
      } else {
        const payload = await res.json();
        setError(payload.error || 'Failed to complete job.');
      }
    } catch {
      setError('Connection failure.');
    }
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Machine Monitoring</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Supervise assembly hardware, log active running hours, and schedule checkups.
          </p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2.5 text-xs shadow-md hover:scale-[1.02] hover:opacity-90 transition-all cursor-pointer"
        >
          <Calendar className="h-4 w-4 text-slate-950" />
          <span>Book Maintenance</span>
        </button>
      </div>

      {machines.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
          No hardware assets monitored.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Columns: Machines grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {machines.map((m) => {
                const isSelected = selectedMachine?.id === m.id;
                // AI Predictive Maintenance threshold check
                const requiresMaintenance = m.runningHours >= 300 && (!m.lastMaintenance || (now - new Date(m.lastMaintenance).getTime() > 1000 * 60 * 60 * 24 * 30));

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMachine(m)}
                    className={`rounded-2xl border p-5 shadow-sm space-y-4 cursor-pointer hover:shadow-md transition-all duration-200 relative overflow-hidden ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/5'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-foreground text-xs uppercase">{m.name}</h3>
                        <div className="text-[10px] text-muted-foreground font-mono">{m.code}</div>
                      </div>
                      <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold ${
                        m.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : m.status === 'Maintenance'
                          ? 'bg-amber-500/10 text-amber-500 animate-pulse'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-xl bg-secondary/30 p-2.5">
                        <div className="text-sm font-bold flex items-center justify-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {m.runningHours}h
                        </div>
                        <div className="text-[9px] text-muted-foreground mt-0.5">Running logs</div>
                      </div>
                      <div className="rounded-xl bg-secondary/30 p-2.5">
                        <div className="text-[10px] font-bold text-foreground">
                          {m.lastMaintenance ? new Date(m.lastMaintenance).toLocaleDateString() : 'Never'}
                        </div>
                        <div className="text-[9px] text-muted-foreground mt-0.5">Last Overhaul</div>
                      </div>
                    </div>

                    {/* AI predictive warning */}
                    {requiresMaintenance && (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 flex items-center gap-2 text-[10px]">
                        <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 animate-pulse" />
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          AI Alert: Checkup recommended. Run time exceeds 300 hours.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: selected machine logs */}
          {selectedMachine && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 self-start">
              <div className="border-b border-border pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-indigo-400" /> Maintenance Records
                </h3>
                <div className="text-[10px] text-muted-foreground mt-1">
                  History logs for {selectedMachine.name}
                </div>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {selectedMachine.maintenanceLogs.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No scheduled checkup entries.
                  </div>
                ) : (
                  selectedMachine.maintenanceLogs.map((log) => (
                    <div key={log.id} className="rounded-xl border border-border/80 p-3 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div className="font-semibold">{log.description}</div>
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          log.completedAt ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {log.completedAt ? 'Completed' : 'Scheduled'}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Due: {new Date(log.scheduledAt).toLocaleDateString()}</span>
                        {log.cost > 0 && <span>Value: ₹{log.cost.toFixed(2)}</span>}
                      </div>

                      {!log.completedAt && (
                        <button
                          onClick={() => {
                            setLogId(log.id);
                            setShowCompleteModal(true);
                          }}
                          className="flex items-center gap-1 text-[10px] text-sky-400 font-bold hover:underline border-t border-border pt-2 w-full text-left"
                        >
                          <CheckSquare className="h-3.5 w-3.5" /> Sign-off Completed Job
                        </button>
                      )}

                      {log.completedAt && log.notes && (
                        <div className="text-[9px] text-muted-foreground bg-secondary/30 p-2 rounded-lg italic">
                          Notes: {log.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-sky-400" /> Book Machine Maintenance
              </span>
              <button onClick={() => setShowScheduleModal(false)} className="text-muted-foreground hover:text-foreground text-xs">
                Cancel
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleSchedule} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold">Select Machine Asset *</label>
                <select
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value)}
                  className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Maintenance Description *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Hydraulic pressure lines check and recalibration"
                  className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Estimated Repair Cost (₹)</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="250.00"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Schedule Date *</label>
                  <input
                    type="date"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none text-[10px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[0.98] hover:opacity-90 transition-all cursor-pointer"
              >
                Schedule Checkup
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-sm flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-emerald-500" /> Complete Maintenance Job
              </span>
              <button onClick={() => setShowCompleteModal(false)} className="text-muted-foreground hover:text-foreground text-xs">
                Cancel
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleComplete} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold">Technician Completion Notes *</label>
                <textarea
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe repair actions, pressure readings, seals replaced, calibration parameters..."
                  className="w-full h-24 border border-border rounded-xl bg-secondary/20 p-2.5 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[0.98] hover:opacity-90 transition-all cursor-pointer"
              >
                Sign-off Job & Restore Telemetry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
