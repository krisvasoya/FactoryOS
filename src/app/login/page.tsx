'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, Cpu, Database, Landmark, ShieldCheck, BarChart2, Zap, Activity } from 'lucide-react';
import { FactoryOSLogo } from '@/components/factoryos-logo';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [telemetry, setTelemetry] = useState('Initializing secure console connection...');

  // Telemetry loop for modern industrial feel
  useEffect(() => {
    const messages = [
      'Secure session cluster validated. Standby.',
      'Active network links: 4 industrial edge nodes live.',
      'DB engine connected: Neon PostgreSQL cluster.',
      'Prisma client client-pool successfully initialized.',
      'AI optimization co-pilot online (v1.3.0).',
      'Tenant partition verification complete.',
    ];
    let i = 0;
    const interval = setInterval(() => {
      setTelemetry(messages[i]);
      i = (i + 1) % messages.length;
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Read ?error= param from Google OAuth callback and initialize error state
  const googleErrorMessages: Record<string, string> = {
    google_access_denied: 'Google sign-in was cancelled.',
    google_token_failed: 'Google sign-in failed. Please try again.',
    google_profile_failed: 'Could not retrieve your Google profile.',
    google_email_unverified: 'Your Google account email is not verified.',
    google_internal: 'An internal error occurred during Google sign-in.',
  };
  const [error, setError] = useState<string>(() => {
    const param = searchParams.get('error');
    return param ? (googleErrorMessages[param] ?? 'Google sign-in failed. Please try again.') : '';
  });

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

  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      category: 'AUTOMATION & SCHEDULES',
      title: 'Orchestrate real-time production flow with advanced ',
      highlight: 'machine scheduling.',
      description: 'AI-powered insights, real-time analytics, and complete control over your manufacturing operations.',
      icon: Cpu,
    },
    {
      category: 'INVENTORY & LEDGER',
      title: 'Monitor stock levels and track warehouse ',
      highlight: 'movements dynamically.',
      description: 'AI-powered insights, real-time analytics, and complete control over your manufacturing operations.',
      icon: Database,
    },
    {
      category: 'BUSINESS COMMAND',
      title: 'Visualize monthly financial gains and ',
      highlight: 'operational performance.',
      description: 'AI-powered insights, real-time analytics, and complete control over your manufacturing operations.',
      icon: Landmark,
    },
    {
      category: 'INTELLIGENT MANUFACTURING',
      title: 'Seamlessly generate bill of materials and ',
      highlight: 'optimize yields.',
      description: 'AI-powered insights, real-time analytics, and complete control over your manufacturing operations.',
      icon: ShieldCheck,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50/50 text-slate-800">
      {/* Left Column: Access Console Form */}
      <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-12 md:p-16 bg-white border-r border-slate-200/80 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <FactoryOSLogo size={30} variant="light" />
        </div>

        <div className="max-w-sm w-full mx-auto my-auto space-y-6">
          {/* Real-time Telemetry Dashboard Bar */}
          <div className="w-full bg-slate-900 text-emerald-400 font-mono text-[10px] p-2.5 rounded-xl flex items-center gap-2 border border-slate-800 shadow-inner">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="opacity-80">Telemetry:</span>
            <span className="truncate flex-1">{telemetry}</span>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-600 tracking-wider uppercase mb-1">
              <Activity className="h-3 w-3 text-indigo-600" />
              Enterprise Console v1.3
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome <span className="text-indigo-600">back</span>
            </h1>
            <p className="text-xs text-slate-500">
              Access the industrial enterprise console to manage active hardware pipelines.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="krishvasoya6@gmail.com"
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100/50 focus:outline-none transition-all duration-200 placeholder:text-slate-400 text-slate-900"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <a href="#" className="text-[10px] text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100/50 focus:outline-none transition-all duration-200 placeholder:text-slate-400 text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white font-bold text-xs shadow-md hover:from-indigo-900 hover:to-slate-900 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-6 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-900 outline-none"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <>
                  <span>Sign in to workspace</span>
                  <ArrowRight className="h-4 w-4 text-white" />
                </>
              )}
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative flex py-2 items-center">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          {/* Google OAuth Button */}
          <button
            id="google-login-btn"
            type="button"
            disabled={googleLoading}
            onClick={() => {
              setGoogleLoading(true);
              window.location.href = '/api/v1/auth/google';
            }}
            className="w-full flex h-11 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 hover:border-indigo-200 active:scale-[0.99] hover:scale-[1.01] hover:shadow-md hover:shadow-indigo-50/50 transition-all duration-300 cursor-pointer font-semibold shadow-xs"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            ) : (
              /* Google coloured 'G' SVG icon */
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Demo fast logs */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="border-t border-slate-200 pt-4 mt-6">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2.5 text-center">
                Demo Console Portals
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDemoLogin('owner@factoryos.com')}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-semibold text-indigo-600 hover:bg-slate-100 transition-colors text-center cursor-pointer"
                >
                  Owner Portal
                </button>
                <button
                  onClick={() => handleDemoLogin('production@factoryos.com')}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-semibold text-indigo-600 hover:bg-slate-100 transition-colors text-center cursor-pointer"
                >
                  Production Portal
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-xs">
          <span className="text-slate-500">Need to onboard your business? </span>
          <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
            Register Tenant
          </Link>
        </div>
      </div>

      {/* Right Column: Premium Cyber-Physical Factory Visualizer */}
      <div className="hidden lg:col-span-7 lg:flex flex-col items-center justify-center p-8 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[16px_16px] bg-slate-50/50 relative overflow-hidden">
        {/* Soft atmospheric gradient backdrops */}
        <div className="absolute top-1/3 left-1/3 w-[35rem] h-[35rem] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-[30rem] h-[30rem] bg-sky-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

        {/* Console Container */}
        <div className="relative w-full max-w-xl aspect-4/3 rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
          
          {/* Header Status Bar */}
          <div className="flex justify-between items-center z-10 w-full">
            <div className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[9px] font-extrabold text-emerald-600 flex items-center gap-1.5 tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              LIVE TELEMETRY NODE
            </div>
            
            {/* Interactive Slide Controls */}
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                    index === currentSlide ? 'w-8 bg-indigo-600' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Show telemetry view ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Connected Pipelines Map */}
          <div className="grow w-full z-10 my-6 relative flex flex-col items-center justify-center min-h-[220px]">
            {/* SVG Connecting Flow Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              
              {/* Core pipeline path */}
              <path
                d="M 60,110 C 140,40 260,40 340,110"
                fill="none"
                stroke="url(#flowGrad)"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                className="animate-[dash_15s_linear_infinite]"
              />
              <path
                d="M 340,110 C 260,180 140,180 60,110"
                fill="none"
                stroke="url(#flowGrad)"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="animate-[dash_25s_linear_reverse_infinite]"
              />
            </svg>

            {/* Layout Cards */}
            <div className="w-full h-full flex items-center justify-around relative">
              {/* Node 1: Automation */}
              <div className={`p-4 rounded-2xl border transition-all duration-500 w-36 ${
                currentSlide === 0 
                  ? 'bg-indigo-600/5 border-indigo-500 shadow-lg scale-105 translate-y-[-8px]' 
                  : 'bg-white/90 border-slate-200/60 opacity-60 shadow-xs'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-extrabold text-slate-400">NODE_01</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${currentSlide === 0 ? 'bg-indigo-600 animate-pulse' : 'bg-slate-400'}`} />
                </div>
                <h4 className="text-[10px] font-bold text-slate-800">AUTOMATION</h4>
                <div className="h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-[8px] text-slate-500 mt-1 font-medium">85% Dispatch Rate</p>
              </div>

              {/* Node 2: Core AI Center */}
              <div className={`p-4 rounded-2xl border transition-all duration-500 w-40 ${
                currentSlide === 3 
                  ? 'bg-slate-900 border-slate-800 text-white shadow-xl scale-110 translate-y-[-10px]' 
                  : 'bg-white/90 border-slate-200/60 opacity-80 shadow-xs'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-extrabold text-indigo-400">AI_CORE</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${currentSlide === 3 ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                </div>
                <h4 className={`text-[10px] font-extrabold ${currentSlide === 3 ? 'text-white' : 'text-slate-800'}`}>CO-PILOT ENGINE</h4>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-mono font-bold text-emerald-400">99.2% Accurate</span>
                </div>
                <p className={`text-[8px] mt-1 ${currentSlide === 3 ? 'text-slate-400' : 'text-slate-500'} font-medium`}>Yield calibrated</p>
              </div>

              {/* Node 3: Finance Ledger */}
              <div className={`p-4 rounded-2xl border transition-all duration-500 w-36 ${
                currentSlide === 2 
                  ? 'bg-emerald-600/5 border-emerald-500 shadow-lg scale-105 translate-y-[-8px]' 
                  : 'bg-white/90 border-slate-200/60 opacity-60 shadow-xs'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-extrabold text-slate-400">NODE_03</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${currentSlide === 2 ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
                </div>
                <h4 className="text-[10px] font-bold text-slate-800">FINANCES</h4>
                <div className="h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <p className="text-[8px] text-emerald-600 mt-1 font-bold">+14.2% MoM</p>
              </div>
            </div>
          </div>

          {/* Bottom Card Content Info Panel */}
          <div className="relative z-10 mt-auto bg-white/90 border border-slate-200 p-5 rounded-2xl shadow-lg space-y-4">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`transition-all duration-500 ${
                  index === currentSlide ? 'block opacity-100 translate-y-0' : 'hidden opacity-0 translate-y-2'
                }`}
              >
                <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <slide.icon className="h-4 w-4 text-indigo-600 animate-pulse" />
                  {slide.category}
                </div>
                <h3 className="text-base font-bold text-slate-800 leading-snug">
                  {slide.title}<span className="text-indigo-600">{slide.highlight}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {slide.description}
                </p>
              </div>
            ))}

            {/* Bottom Status Grid */}
            <div className="grid grid-cols-4 gap-2 pt-3.5 border-t border-slate-100 text-center">
              <div className="flex flex-col items-center gap-0.5">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BarChart2 className="h-3.5 w-3.5" />
                </div>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight mt-1">Analytics</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Cpu className="h-3.5 w-3.5" />
                </div>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight mt-1">AI Engine</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight mt-1">Security</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight mt-1">Performance</span>
              </div>
            </div>

            {/* Bottom Status Footer */}
            <div className="text-[9px] text-slate-400 font-mono tracking-widest pt-2 border-t border-slate-100 flex justify-between items-center">
              <span>FACTORYOS CONSOLE V1.3.0</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                ONLINE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
