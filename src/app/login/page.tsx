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
                  placeholder="admin@factoryos.com"
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

      {/* Right Column: Premium Interactive 3D Isometric Factory Visualizer */}
      <div className="hidden lg:col-span-7 lg:flex flex-col items-center justify-center p-8 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] bg-size-[24px_24px] bg-slate-50 relative overflow-hidden">
        {/* Colorful glowing ambient lights */}
        <div className="absolute top-1/4 left-1/3 w-xl h-144 bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-lg h-128 bg-sky-400/10 rounded-full blur-[110px] pointer-events-none animate-pulse" />

        {/* Outer card frame matching mockup */}
        <div className="relative w-full max-w-xl aspect-4/3 rounded-3xl border border-slate-200/80 bg-white/70 backdrop-blur-xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
          
          {/* Top Info Bar */}
          <div className="flex justify-between items-center z-10 w-full">
            {/* SYSTEM ONLINE Badge */}
            <div className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[9px] font-bold text-emerald-600 flex items-center gap-1.5 uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              CYBER-PHYSICAL INTERFACE
            </div>

            {/* Slide Indicators */}
            <div className="flex gap-1.5">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentSlide ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Switch to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Middle 3D Isometric Factory Illustration Area */}
          <div className="grow flex items-center justify-center w-full z-10 my-4 min-h-[220px] relative">
            <svg viewBox="0 0 400 240" className="w-full h-full max-h-[210px] overflow-visible drop-shadow-xl select-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <style>
                  {`
                    @keyframes isometric-float {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(-5px); }
                    }
                    @keyframes pulse-signal {
                      0%, 100% { fill-opacity: 0.3; stroke-width: 1.5; }
                      50% { fill-opacity: 0.7; stroke-width: 3; }
                    }
                    @keyframes rotate-iso-gear {
                      to { transform: rotate(360deg); }
                    }
                    @keyframes flow-iso-line {
                      to { stroke-dashoffset: -30; }
                    }
                    .iso-float { animation: isometric-float 5s ease-in-out infinite; }
                    .iso-float-delayed { animation: isometric-float 5s ease-in-out infinite; animation-delay: 2.5s; }
                    .signal-glow { animation: pulse-signal 2s ease-in-out infinite; }
                    .gear-spin { animation: rotate-iso-gear 15s linear infinite; transform-origin: center; }
                    .conveyor-belt { stroke-dasharray: 6 4; animation: flow-iso-line 2.5s linear infinite; }
                  `}
                </style>
                <linearGradient id="gradient-top" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#312e81" />
                </linearGradient>
                <linearGradient id="gradient-side-light" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>
                <linearGradient id="gradient-side-dark" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3730a3" />
                  <stop offset="100%" stopColor="#111827" />
                </linearGradient>
              </defs>

              {/* Faint grid floor guidelines */}
              <g stroke="#e2e8f0" strokeWidth="0.8" opacity="0.6">
                <line x1="50" y1="200" x2="350" y2="50" />
                <line x1="50" y1="50" x2="350" y2="200" />
                <line x1="200" y1="20" x2="200" y2="220" />
              </g>

              {/* Connecting conveyor network */}
              <g fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round">
                {/* Automation path */}
                <path d="M 80,140 L 200,90 L 320,140" className="conveyor-belt" stroke="#c7d2fe" />
                {/* AI core linking path */}
                <path d="M 200,90 L 200,165" className="conveyor-belt" stroke="#6366f1" />
              </g>

              {/* Node 1: Automation Tower (Left) */}
              <g className="iso-float" opacity={currentSlide === 0 ? "1" : "0.55"}>
                {/* Base Shadow */}
                <polygon points="60,150 95,135 110,142 75,157" fill="#e2e8f0" />
                {/* 3D Box structure */}
                {/* Left Side */}
                <polygon points="60,150 75,157 75,127 60,120" fill="url(#gradient-side-light)" />
                {/* Right Side */}
                <polygon points="75,157 95,147 95,117 75,127" fill="url(#gradient-side-dark)" />
                {/* Top Cap */}
                <polygon points="60,120 75,127 95,117 80,110" fill="url(#gradient-top)" />
                
                {/* Floating Status Ring */}
                <ellipse cx="77" cy="98" rx="14" ry="7" fill="none" stroke="#6366f1" strokeWidth="1.5" className="signal-glow" />
              </g>

              {/* Node 2: Database Storage Stack (Right) */}
              <g className="iso-float-delayed" opacity={currentSlide === 1 ? "1" : "0.55"}>
                {/* Base Shadow */}
                <polygon points="290,150 325,135 340,142 305,157" fill="#e2e8f0" />
                {/* Bottom Disc */}
                <polygon points="290,150 305,157 325,147 310,140" fill="#cbd5e1" />
                
                {/* Storage Plates */}
                {/* Plate 1 */}
                <polygon points="290,140 305,147 325,137 310,130" fill="url(#gradient-side-light)" />
                <polygon points="305,147 325,137 325,134 305,144" fill="url(#gradient-side-dark)" />
                {/* Plate 2 */}
                <polygon points="290,125 305,132 325,122 310,115" fill="url(#gradient-side-light)" />
                <polygon points="305,132 325,122 325,119 305,129" fill="url(#gradient-side-dark)" />
                {/* Top Plate cap */}
                <polygon points="290,110 305,117 325,107 310,100" fill="url(#gradient-top)" />

                {/* Blinking Sensor */}
                <circle cx="307" cy="107" r="2.5" fill="#f43f5e" className="signal-glow" />
              </g>

              {/* Node 3: AI Central Processing Core (Middle) */}
              <g className="iso-float" opacity={currentSlide === 3 ? "1" : "0.75"}>
                {/* Isometric Cube base */}
                <polygon points="175,115 200,127 225,115 200,103" fill="#1e1b4b" opacity="0.3" />
                
                {/* Floating Core */}
                {/* Left Side */}
                <polygon points="180,95 200,105 200,80 180,70" fill="#312e81" />
                {/* Right Side */}
                <polygon points="200,105 220,95 220,70 200,80" fill="#4338ca" />
                {/* Top Cap */}
                <polygon points="180,70 200,80 220,70 200,60" fill="#6366f1" />

                {/* Energy Rings around the Core */}
                <ellipse cx="200" cy="83" rx="35" ry="16" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="15 15" className="conveyor-belt" />
                <ellipse cx="200" cy="98" rx="25" ry="12" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="8 6" className="conveyor-belt" />
              </g>

              {/* Node 4: Cashflow / Fin System (Bottom Center) */}
              <g className="iso-float-delayed" opacity={currentSlide === 2 ? "1" : "0.55"}>
                {/* Base Shadow */}
                <polygon points="175,190 200,202 225,190 200,178" fill="#e2e8f0" />
                
                {/* Financial bar charts isometric */}
                {/* Bar 1 */}
                <polygon points="185,185 193,189 193,165 185,161" fill="#10b981" />
                <polygon points="193,189 201,185 201,161 193,165" fill="#047857" />
                <polygon points="185,161 193,165 201,161 193,157" fill="#34d399" />
                
                {/* Bar 2 */}
                <polygon points="203,175 211,179 211,145 203,141" fill="#10b981" />
                <polygon points="211,179 219,175 219,141 211,145" fill="#047857" />
                <polygon points="203,141 211,145 219,141 211,137" fill="#34d399" />
              </g>
            </svg>

            {/* Micro Floating Metric Card Overlay */}
            <div className="absolute top-8 right-6 bg-white/90 border border-slate-100 p-2.5 rounded-xl shadow-lg flex items-center gap-2 select-none pointer-events-none float-card-1">
              <div className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                ↑
              </div>
              <div>
                <span className="text-[7px] text-slate-400 block uppercase font-bold tracking-wider">Yield Margin</span>
                <span className="text-[10px] font-extrabold text-slate-800">94.2%</span>
              </div>
            </div>

            <div className="absolute bottom-8 left-6 bg-white/90 border border-slate-100 p-2.5 rounded-xl shadow-lg flex items-center gap-2 select-none pointer-events-none float-card-2">
              <div className="h-6 w-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                ★
              </div>
              <div>
                <span className="text-[7px] text-slate-400 block uppercase font-bold tracking-wider">Status Isolate</span>
                <span className="text-[10px] font-extrabold text-slate-800">Active</span>
              </div>
            </div>
          </div>

          {/* Bottom Card Content overlay */}
          <div className="relative z-10 mt-auto bg-white/95 border border-slate-200/60 p-5 rounded-2xl shadow-lg space-y-4">
            {slides.map((slide, index) => {
              return (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    index === currentSlide ? 'block opacity-100 translate-y-0' : 'hidden opacity-0 translate-y-2'
                  }`}
                >
                  <div className="text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <slide.icon className="h-3.5 w-3.5 animate-pulse text-indigo-600" />
                    {slide.category}
                  </div>
                  <h3 className="text-base font-bold text-slate-800 leading-snug">
                    {slide.title}<span className="text-indigo-600">{slide.highlight}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {slide.description}
                  </p>
                </div>
              );
            })}

            {/* Icons Grid Row */}
            <div className="grid grid-cols-4 gap-2 pt-3.5 border-t border-slate-100 mt-4 text-center">
              <div className="flex flex-col items-center gap-1">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BarChart2 className="h-3.5 w-3.5" />
                </div>
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tight mt-1">Real-time Analytics</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Cpu className="h-3.5 w-3.5" />
                </div>
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tight mt-1">AI Insights</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tight mt-1">Secure & Reliable</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tight mt-1">High Performance</span>
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
