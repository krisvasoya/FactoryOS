'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, Cpu, Database, Landmark, ShieldCheck, BarChart2, Zap } from 'lucide-react';
import { FactoryOSLogo } from '@/components/factoryos-logo';

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
        <div className="flex items-center gap-2 mb-8">
          <FactoryOSLogo size={30} variant="light" />
        </div>

        <div className="max-w-sm w-full mx-auto my-auto space-y-6">
          <div className="space-y-1.5">
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
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:border-indigo-600 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-slate-400 text-slate-900"
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
                  className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:border-indigo-600 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-slate-400 text-slate-900"
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
              className="w-full h-10 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-6 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 outline-none"
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

          <div className="grid grid-cols-2 gap-3">
            <button className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer font-semibold shadow-sm">
              <span className="text-[11px]"> Apple</span>
            </button>
            <button className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer font-semibold shadow-sm">
              <span className="text-[11px]"><span className="text-red-500">G</span> Google</span>
            </button>
          </div>

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

      {/* Right Column: Dynamic Mock UI Panels (Zero Images) */}
      <div className="hidden lg:col-span-7 lg:flex flex-col items-center justify-center p-8 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50/50 relative overflow-hidden">
        {/* Decorative subtle ambient lights */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Outer card frame matching mockup */}
        <div className="relative w-full max-w-xl aspect-4/3 rounded-3xl border border-slate-200/80 bg-white/80 p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between overflow-hidden">
          
          {/* Top Info Bar */}
          <div className="flex justify-between items-center z-10 w-full">
            {/* SYSTEM ONLINE Badge */}
            <div className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[9px] font-bold text-emerald-600 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM ONLINE
            </div>

            {/* Slide Indicators */}
            <div className="flex gap-1.5">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Middle Visualization Area */}
          <div className="grow flex items-center justify-center w-full z-10 my-4 min-h-[160px] relative">
            {slides.map((_, index) => {
              return (
                <div
                  key={index}
                  className={`w-full transition-all duration-700 absolute px-4 ${
                    index === currentSlide ? 'opacity-100 scale-100 relative' : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  {index === 0 && (
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <div className="bg-white/90 border border-slate-200/60 p-3 rounded-xl shadow-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-800">CNC Milling #1</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }}></div>
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-500 font-medium">
                          <span>Load: 82%</span>
                          <span>Temp: 41°C</span>
                        </div>
                      </div>
                      <div className="bg-white/90 border border-slate-200/60 p-3 rounded-xl shadow-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-800">Laser Cutter #2</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-500 font-medium">
                          <span>Load: 65%</span>
                          <span>Temp: 38°C</span>
                        </div>
                      </div>
                      <div className="bg-white/90 border border-slate-200/60 p-3 rounded-xl shadow-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-800">Robotic Arm #3</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: '91%' }}></div>
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-500 font-medium">
                          <span>Load: 91%</span>
                          <span>Temp: 35°C</span>
                        </div>
                      </div>
                      <div className="bg-white/90 border border-slate-200/60 p-3 rounded-xl shadow-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-800">PCB Solder #4</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-500 font-medium">
                          <span>Idle</span>
                          <span>Cooling Down</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {index === 1 && (
                    <div className="flex flex-col gap-2.5 w-full">
                      <div className="bg-white/90 border border-slate-200/60 p-3 rounded-xl shadow-xs space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-800">Copper Wiring</span>
                          <span className="text-red-500 font-extrabold uppercase text-[8px] tracking-wider">Critical (12%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: '12%' }}></div>
                        </div>
                      </div>
                      <div className="bg-white/90 border border-slate-200/60 p-3 rounded-xl shadow-xs space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-800">Steel Plates</span>
                          <span className="text-amber-500 font-extrabold uppercase text-[8px] tracking-wider">Low Stock (28%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: '28%' }}></div>
                        </div>
                      </div>
                      <div className="bg-white/90 border border-slate-200/60 p-3 rounded-xl shadow-xs space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-800">Microprocessors</span>
                          <span className="text-emerald-500 font-semibold uppercase text-[8px] tracking-wider">Healthy (84%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: '84%' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {index === 2 && (
                    <div className="bg-white/90 border border-slate-200/60 p-4 rounded-xl shadow-xs w-full space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Operational Cashflow</span>
                          <span className="text-sm font-extrabold text-slate-800">₹12,84,500</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider block">+14.2% MoM</span>
                          <span className="text-[8px] text-slate-400 font-medium">Yield Margin: 82%</span>
                        </div>
                      </div>
                      <div className="h-16 w-full relative">
                        <svg viewBox="0 0 300 60" className="w-full h-full overflow-visible">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <line x1="0" y1="15" x2="300" y2="15" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                          <line x1="0" y1="40" x2="300" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                          <path
                            d="M0 50 Q 40 35, 80 45 T 160 20 T 240 10 T 300 5 L 300 60 L 0 60 Z"
                            fill="url(#chartGrad)"
                          />
                          <path
                            d="M0 50 Q 40 35, 80 45 T 160 20 T 240 10 T 300 5"
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          <circle cx="300" cy="5" r="3" fill="#6366f1" />
                          <circle cx="300" cy="5" r="6" fill="#6366f1" fillOpacity="0.3" className="animate-ping" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {index === 3 && (
                    <div className="flex flex-col gap-3 w-full">
                      <div className="bg-indigo-50/50 border border-indigo-100/50 p-3 rounded-xl shadow-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-wider text-indigo-600">
                          <Cpu className="h-3.5 w-3.5 animate-[spin_4s_linear_infinite]" /> AI Optimization Engine
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                          <strong>Recommendation:</strong> Milling throughput can be calibrated to increase yield by <span className="text-indigo-600 font-bold">4.2%</span> to match raw material arrivals.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/90 border border-slate-200/60 p-2.5 rounded-xl shadow-xs flex items-center justify-between">
                          <div>
                            <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Yield Rate</span>
                            <span className="text-xs font-extrabold text-slate-800">94.2%</span>
                          </div>
                          <div className="h-6 w-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-[9px]">
                            ↑
                          </div>
                        </div>
                        <div className="bg-white/90 border border-slate-200/60 p-2.5 rounded-xl shadow-xs flex items-center justify-between">
                          <div>
                            <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Efficiency</span>
                            <span className="text-xs font-extrabold text-slate-800">98.1%</span>
                          </div>
                          <div className="h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-[9px]">
                            ★
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Card Content overlay */}
          <div className="relative z-10 mt-auto bg-white/95 border border-slate-200/60 p-6 rounded-2xl shadow-lg space-y-4">
            {slides.map((slide, index) => {
              return (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    index === currentSlide ? 'block opacity-100 translate-y-0' : 'hidden opacity-0 translate-y-2'
                  }`}
                >
                  <div className="text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1.5">
                    {slide.category}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 leading-snug">
                    {slide.title}<span className="text-indigo-600">{slide.highlight}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {slide.description}
                  </p>
                </div>
              );
            })}

            {/* Icons Grid Row */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-100 mt-4 text-center">
              <div className="flex flex-col items-center gap-1">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BarChart2 className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight mt-1">Real-time Analytics</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Cpu className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight mt-1">AI Insights</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight mt-1">Secure & Reliable</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight mt-1">High Performance</span>
              </div>
            </div>

            {/* Bottom Status Footer */}
            <div className="text-[9px] text-slate-400 font-mono tracking-widest pt-2 border-t border-slate-100 flex justify-between items-center">
              <span>FACTORYOS CONSOLE V1.2.9</span>
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
