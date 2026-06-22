'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/app/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Invalid credentials. Please try again.');
      }
    } catch {
      setError('A connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError('');
    setLoading(true);
    setEmail(demoEmail);
    setPassword('password123');

    try {
      const res = await fetch('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: 'password123' }),
      });

      if (res.ok) {
        router.push('/app/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to initialize demo session.');
      }
    } catch {
      setError('Demo initialization error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#090d16] text-white px-4 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-sky-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Card */}
      <div className="relative w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-600 shadow-xl shadow-indigo-600/30 text-white font-bold text-xl mb-4">
            F
          </div>
          <h1 className="text-xl font-bold tracking-tight">Welcome to FactoryOS</h1>
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
            Enterprise Manufacturing AI Console <Sparkles className="h-3 w-3 text-violet-400 fill-violet-400" />
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Sign-in Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-800 bg-slate-950/40 text-xs focus:border-sky-500 focus:outline-none transition-all duration-200 placeholder:text-slate-600 text-white"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <a href="#" className="text-[10px] text-sky-400 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-800 bg-slate-950/40 text-xs focus:border-sky-500 focus:outline-none transition-all duration-200 placeholder:text-slate-600 text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 text-slate-950 font-bold text-xs shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
            ) : (
              <>
                <span>Access Management Suite</span>
                <ArrowRight className="h-4 w-4 text-slate-950" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Triggers */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-8 border-t border-slate-800 pt-6">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-3 text-center">
              Demo Console Portals
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoLogin('owner@factoryos.com')}
                className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-900/40 text-[10px] font-semibold text-sky-400 hover:bg-slate-800/40 transition-colors text-center cursor-pointer"
              >
                Owner Portal (Arjun)
              </button>
              <button
                onClick={() => handleDemoLogin('production@factoryos.com')}
                className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-900/40 text-[10px] font-semibold text-indigo-400 hover:bg-slate-800/40 transition-colors text-center cursor-pointer"
              >
                Production Portal (Amit)
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-xs">
          <span className="text-slate-500">Need to onboard your business? </span>
          <Link href="/register" className="text-sky-400 font-semibold hover:underline">
            Register Tenant
          </Link>
        </div>
      </div>
    </div>
  );
}
