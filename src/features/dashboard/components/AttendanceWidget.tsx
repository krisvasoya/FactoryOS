'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, Play, Square, Coffee, Sparkles, CheckCircle2 } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  clockIn: string | null;
  clockOut: string | null;
}

interface AttendanceStatusResponse {
  employee: {
    id: string;
    name: string;
    email: string | null;
    department: string;
    role: string | null;
  };
  attendanceToday: AttendanceRecord | null;
  history: AttendanceRecord[];
}

export function AttendanceWidget() {
  const [data, setData] = useState<AttendanceStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  
  // Stopwatch states
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const [isOnBreak, setIsOnBreak] = useState<boolean>(false);
  const [breakAccumulatedMs, setBreakAccumulatedMs] = useState<number>(0);
  const breakStartRef = useRef<number | null>(null);
  
  // Geolocation
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('idle'); // idle, fetching, success, error

  // Local Storage keys
  const getLocalStorageKey = (key: string) => `factoryos_attendance_${key}`;

  // Fetch current status
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/v1/attendance');
      if (res.ok) {
        const payload: AttendanceStatusResponse = await res.json();
        setData(payload);
      }
    } catch (err) {
      console.error('Failed to load attendance status', err);
    } finally {
      setLoading(false);
    }
  };

  // Clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync break state with localStorage on mount
  useEffect(() => {
    fetchStatus();

    const storedBreak = localStorage.getItem(getLocalStorageKey('isOnBreak'));
    const storedAccumulated = localStorage.getItem(getLocalStorageKey('breakAccumulatedMs'));
    const storedBreakStart = localStorage.getItem(getLocalStorageKey('breakStart'));

    if (storedBreak === 'true') {
      setIsOnBreak(true);
    }
    if (storedAccumulated) {
      setBreakAccumulatedMs(parseInt(storedAccumulated, 10));
    }
    if (storedBreakStart) {
      breakStartRef.current = parseInt(storedBreakStart, 10);
    }
  }, []);

  // Active stopwatch tick when clocked in
  useEffect(() => {
    if (!data?.attendanceToday?.clockIn || data.attendanceToday.clockOut) {
      setElapsedTime('00:00:00');
      return;
    }

    const clockInTime = new Date(data.attendanceToday.clockIn).getTime();

    const interval = setInterval(() => {
      let activeMs = Date.now() - clockInTime;
      let totalBreakMs = breakAccumulatedMs;

      // Add current active break duration if on break
      if (isOnBreak && breakStartRef.current) {
        totalBreakMs += Date.now() - breakStartRef.current;
      }

      const netMs = Math.max(0, activeMs - totalBreakMs);

      const secs = Math.floor(netMs / 1000) % 60;
      const mins = Math.floor(netMs / 60000) % 60;
      const hrs = Math.floor(netMs / 3600000);

      const pad = (num: number) => num.toString().padStart(2, '0');
      setElapsedTime(`${pad(hrs)}:${pad(mins)}:${pad(secs)}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.attendanceToday, isOnBreak, breakAccumulatedMs]);

  // Request browser geolocation
  const requestLocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationStatus('error');
        resolve(null);
        return;
      }

      setLocationStatus('fetching');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const fetchedCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoords(fetchedCoords);
          setLocationStatus('success');
          resolve(fetchedCoords);
        },
        (error) => {
          console.warn('Geolocation access denied or failed. Proceeding without location.', error);
          setLocationStatus('error');
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const handleClockIn = async () => {
    setActionLoading(true);
    // Request location
    const location = await requestLocation();
    
    try {
      const res = await fetch('/api/v1/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clockIn',
          coords: location,
        }),
      });

      if (res.ok) {
        // Reset break state in local storage just in case
        localStorage.removeItem(getLocalStorageKey('isOnBreak'));
        localStorage.removeItem(getLocalStorageKey('breakAccumulatedMs'));
        localStorage.removeItem(getLocalStorageKey('breakStart'));
        setIsOnBreak(false);
        setBreakAccumulatedMs(0);
        breakStartRef.current = null;
        await fetchStatus();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to clock in');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during check-in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    // Request location for checkout audit
    const location = coords || (await requestLocation());

    try {
      const res = await fetch('/api/v1/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clockOut',
          coords: location,
        }),
      });

      if (res.ok) {
        // Clear local break state
        localStorage.removeItem(getLocalStorageKey('isOnBreak'));
        localStorage.removeItem(getLocalStorageKey('breakAccumulatedMs'));
        localStorage.removeItem(getLocalStorageKey('breakStart'));
        setIsOnBreak(false);
        setBreakAccumulatedMs(0);
        breakStartRef.current = null;
        await fetchStatus();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to clock out');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during check-out');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleBreak = () => {
    if (isOnBreak) {
      // Resume shift
      if (breakStartRef.current) {
        const currentBreakDuration = Date.now() - breakStartRef.current;
        const newAccumulated = breakAccumulatedMs + currentBreakDuration;
        setBreakAccumulatedMs(newAccumulated);
        localStorage.setItem(getLocalStorageKey('breakAccumulatedMs'), newAccumulated.toString());
      }
      setIsOnBreak(false);
      localStorage.setItem(getLocalStorageKey('isOnBreak'), 'false');
      localStorage.removeItem(getLocalStorageKey('breakStart'));
      breakStartRef.current = null;
    } else {
      // Start break
      const nowMs = Date.now();
      breakStartRef.current = nowMs;
      localStorage.setItem(getLocalStorageKey('breakStart'), nowMs.toString());
      setIsOnBreak(true);
      localStorage.setItem(getLocalStorageKey('isOnBreak'), 'true');
    }
  };

  // Generate streak dots
  const renderStreakDots = () => {
    const totalDots = 14;
    const dots = [];
    const now = new Date();
    
    for (let i = totalDots - 1; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() - i);
      const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
      const dateString = targetDate.toDateString();

      // Find record in history
      const record = data?.history.find(
        (h) => new Date(h.date).toDateString() === dateString
      );

      let color = 'bg-secondary border-border';
      let title = `${targetDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}: No Record`;

      if (record) {
        if (record.status === 'Present') {
          color = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500';
          title = `${targetDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}: Present`;
        } else if (record.status === 'Late') {
          color = 'bg-amber-500/20 border-amber-500/40 text-amber-500';
          title = `${targetDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}: Late`;
        } else {
          color = 'bg-red-500/20 border-red-500/40 text-red-500';
          title = `${targetDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}: Absent`;
        }
      } else if (isWeekend) {
        color = 'bg-secondary/40 border-border/40';
        title = `${targetDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}: Weekend`;
      } else if (targetDate.getTime() < now.getTime() && targetDate.toDateString() !== now.toDateString()) {
        // Past weekday with no record is considered absent/missed
        color = 'bg-red-500/10 border-red-500/20 text-red-400/60';
        title = `${targetDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}: Missed`;
      }

      dots.push(
        <div
          key={i}
          title={title}
          className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center text-[8px] font-bold cursor-help transition-all hover:scale-110 ${color}`}
        >
          {record ? (record.status === 'Late' ? 'L' : 'P') : (isWeekend ? 'W' : '-')}
        </div>
      );
    }

    return dots;
  };

  if (loading) {
    return (
      <div className="card p-5 animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-1/3"></div>
        <div className="h-8 bg-muted rounded w-1/2 mx-auto"></div>
        <div className="h-10 bg-muted rounded w-full"></div>
      </div>
    );
  }

  const isClockedIn = !!data?.attendanceToday?.clockIn;
  const isClockedOut = !!data?.attendanceToday?.clockOut;

  return (
    <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      {/* Title Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            Attendance Desk
          </h3>
        </div>
        <div className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-lg font-semibold">
          {data?.employee?.department || 'Operations'}
        </div>
      </div>

      {/* Clock Display */}
      <div className="text-center py-4 rounded-2xl border border-border/60 bg-secondary/15 relative overflow-hidden mb-4">
        <div className="absolute top-0 right-0 p-2 opacity-5">
          <Sparkles className="h-16 w-16" />
        </div>
        <div className="text-2xl font-extrabold tracking-tight tabular-nums" style={{ color: 'var(--foreground)' }}>
          {currentTime}
        </div>
        <div className="text-[10.5px] font-semibold text-muted-foreground mt-0.5 uppercase tracking-wider">
          {currentDate}
        </div>
      </div>

      {/* Stopwatch & Status */}
      {isClockedIn && !isClockedOut && (
        <div className="space-y-3 mb-4 animate-fade-in">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10.5px] font-bold uppercase text-muted-foreground">Shift Stopwatch</span>
            <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-xs ${isOnBreak ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 animate-pulse'}`}>
              {isOnBreak ? 'On Break' : 'Shift Active'}
            </span>
          </div>

          <div className="text-center py-3 bg-primary-foreground/5 rounded-2xl border border-border">
            <div className="text-xl font-bold tabular-nums tracking-wider" style={{ color: 'var(--foreground)' }}>
              {elapsedTime}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              Started at {data.attendanceToday?.clockIn ? new Date(data.attendanceToday.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </div>
          </div>
        </div>
      )}

      {isClockedOut && (
        <div className="mb-4 p-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-center text-xs animate-fade-in">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold mb-1">
            <CheckCircle2 className="h-4 w-4" /> Shift Completed
          </div>
          <div className="text-[10.5px] text-muted-foreground">
            Today&apos;s shift logged: {data?.attendanceToday?.clockIn ? new Date(data.attendanceToday.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} - {data?.attendanceToday?.clockOut ? new Date(data.attendanceToday.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2 mb-4">
        {!isClockedIn && (
          <button
            onClick={handleClockIn}
            disabled={actionLoading}
            className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[0.98] hover:opacity-95 transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {actionLoading ? 'Verifying...' : 'Clock In / Check-In'}
          </button>
        )}

        {isClockedIn && !isClockedOut && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={toggleBreak}
              className={`h-10 rounded-xl border font-bold hover:scale-[0.98] transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5 ${isOnBreak ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' : 'bg-secondary/40 border-border text-muted-foreground hover:bg-secondary/60'}`}
            >
              <Coffee className="h-3.5 w-3.5" />
              {isOnBreak ? 'Resume' : 'Take Break'}
            </button>
            <button
              onClick={handleClockOut}
              disabled={actionLoading}
              className="h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 font-bold hover:scale-[0.98] transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              Clock Out
            </button>
          </div>
        )}
      </div>

      {/* Location tracking status */}
      {locationStatus !== 'idle' && (
        <div className="flex items-center gap-1.5 px-1 py-1 text-[9.5px] text-muted-foreground border-b border-border/40 pb-2 mb-3">
          <MapPin className="h-3.5 w-3.5" />
          {locationStatus === 'fetching' && <span className="animate-pulse text-amber-500">Acquiring GPS fix...</span>}
          {locationStatus === 'success' && <span className="text-emerald-500">Secure GPS verified: {coords?.lat.toFixed(4)}, {coords?.lng.toFixed(4)}</span>}
          {locationStatus === 'error' && <span className="text-red-400">GPS offline. Logging default IP coordinates.</span>}
        </div>
      )}

      {/* Attendance Streak Tracker */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block px-1">
          Attendance Streak (14-Day Calendar)
        </span>
        <div className="flex items-center justify-between gap-1 bg-secondary/10 p-2.5 rounded-xl border border-border/50">
          {renderStreakDots()}
        </div>
      </div>
    </div>
  );
}
