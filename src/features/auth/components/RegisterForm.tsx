'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Loader2, Building, User, Mail, Lock, Activity } from 'lucide-react';
import { FactoryOSLogo } from '@/components/factoryos-logo';

export function RegisterForm() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, ownerName, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/app/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Registration failed. Please check entries.');
      }
    } catch {
      setError('A connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Line-Art Accents (Blueprint detail) */}
      <div className="absolute top-16 right-8 w-24 h-24 border-t border-r border-slate-200 pointer-events-none opacity-60" />
      <div className="absolute bottom-16 left-8 w-24 h-24 border-b border-l border-slate-200 pointer-events-none opacity-60" />

      {/* Creative waves illustration behind form */}
      <div className="absolute top-1/4 -right-12 pointer-events-none opacity-20 select-none hidden sm:block">
        <svg width="240" height="180" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10,140 Q50,40 100,120 T210,60" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
          <circle cx="10" cy="140" r="3" fill="#6366f1" />
          <circle cx="100" cy="120" r="3" fill="#06b6d4" />
          <circle cx="210" cy="60" r="3" fill="#10b981" />
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="240" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Header brand logo */}
      <div className="flex items-center gap-2 mb-6 relative z-20">
        <FactoryOSLogo size={32} variant="light" />
      </div>

      {/* Central Auth Console Container */}
      <div className="max-w-md w-full mx-auto my-auto relative z-20">
        {/* Capsule Slider Selector */}
        <div className="inline-flex p-1 rounded-full bg-slate-100 border border-slate-200/80 mb-6 shadow-sm">
          <Link href="/login" className="px-5 py-2 rounded-full text-xs font-bold transition-all text-slate-500 hover:text-slate-800">
            Sign in
          </Link>
          <Link href="/register" className="px-5 py-2 rounded-full text-xs font-bold transition-all bg-white text-slate-800 shadow-sm border border-slate-200/30">
            Sign up
          </Link>
        </div>

        {/* Premium Glassmorphic Card */}
        <div className="bg-white/70 border border-slate-200/80 backdrop-blur-2xl p-6 sm:p-8 rounded-[2.5rem] shadow-[0_15px_40px_rgba(15,23,42,0.06)] space-y-4 relative overflow-hidden">
          {/* Top glass reflection light */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[9px] font-bold text-indigo-600 tracking-wider uppercase mb-0.5">
              <Activity className="h-3 w-3 text-indigo-600 animate-pulse" />
              Enterprise Console v1.3
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Register <span className="text-indigo-600">tenant</span>
            </h1>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Initialize a dedicated isolated instance to manage factory products and stock sheets.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Company Name */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Company Name</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Electronics Ltd"
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200/80 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Owner Name */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Primary Contact Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Arjun Sharma"
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200/80 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Login Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yourcompany.com"
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200/80 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Secret Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200/80 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-[0_4px_20px_rgba(15,23,42,0.15)] hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-5 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 outline-none"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <>
                  <span>Initialize Factory Instance</span>
                  <ArrowRight className="h-4 w-4 text-white" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200/60"></div>
            <span className="shrink mx-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
            <div className="grow border-t border-slate-200/60"></div>
          </div>

          {/* Google Signup */}
          <button
            id="google-register-btn"
            type="button"
            disabled={googleLoading}
            onClick={() => {
              setGoogleLoading(true);
              window.location.href = '/api/v1/auth/google';
            }}
            className="w-full flex h-11 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] transition-all duration-300 cursor-pointer font-bold shadow-sm"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
            )}
            <span>Continue with Google</span>
          </button>
        </div>
      </div>

      {/* Footer Redirect */}
      <div className="mt-6">
        <div className="text-center text-xs">
          <span className="text-slate-500">Already registered? </span>
          <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </>
  );
}
