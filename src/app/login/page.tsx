'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, Cpu, Database, Landmark, ShieldCheck } from 'lucide-react';

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
      image: '/images/smart_factory.png',
      title: 'Automated Assembly Lines',
      description: 'Orchestrate real-time production flow with advanced machine scheduling.',
      icon: Cpu,
    },
    {
      image: '/images/warehouse.png',
      title: 'Smart Inventory Ledger',
      description: 'Monitor stock levels and track warehouse movements dynamically.',
      icon: Database,
    },
    {
      image: '/images/control_room.png',
      title: 'Business Command Console',
      description: 'Visualize monthly financial gains and operational performance.',
      icon: Landmark,
    },
    {
      image: '/images/pcb_assembly.png',
      title: 'Intelligent Manufacturing',
      description: 'Seamlessly generate bill of materials and optimize yields.',
      icon: ShieldCheck,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#090d16] text-white">
      {/* Left Column: Access Console Form */}
      <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-12 md:p-16 bg-[#0c101d] border-r border-slate-900 overflow-y-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-sm shadow-md">
            F
          </div>
          <span className="font-bold tracking-tight text-sm text-slate-200">FactoryOS</span>
        </div>

        <div className="max-w-sm w-full mx-auto my-auto space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="text-xs text-slate-400">
              Access the industrial enterprise console to manage active hardware pipelines.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-800 bg-slate-950/40 text-xs focus:border-sky-500 focus:outline-none transition-all duration-200 placeholder:text-slate-600 text-white"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
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
                  className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-800 bg-slate-950/40 text-xs focus:border-sky-500 focus:outline-none transition-all duration-200 placeholder:text-slate-600 text-white"
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
              className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-6"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
              ) : (
                <>
                  <span>Sign in to workspace</span>
                  <ArrowRight className="h-4 w-4 text-primary-foreground" />
                </>
              )}
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative flex py-2 items-center">
            <div className="grow border-t border-slate-800"></div>
            <span className="shrink mx-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Or continue with</span>
            <div className="grow border-t border-slate-800"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 text-xs text-slate-300 hover:bg-slate-800/40 transition-colors cursor-pointer">
              <span className="font-semibold">Apple</span>
            </button>
            <button className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 text-xs text-slate-300 hover:bg-slate-800/40 transition-colors cursor-pointer">
              <span className="font-semibold">Google</span>
            </button>
          </div>

          {/* Demo fast logs */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="border-t border-slate-800 pt-4 mt-6">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2.5 text-center">
                Demo Console Portals
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDemoLogin('owner@factoryos.com')}
                  className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-950/20 text-[10px] font-semibold text-sky-400 hover:bg-slate-800/40 transition-colors text-center cursor-pointer"
                >
                  Owner Portal
                </button>
                <button
                  onClick={() => handleDemoLogin('production@factoryos.com')}
                  className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-950/20 text-[10px] font-semibold text-indigo-400 hover:bg-slate-800/40 transition-colors text-center cursor-pointer"
                >
                  Production Portal
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-xs">
          <span className="text-slate-500">Need to onboard your business? </span>
          <Link href="/register" className="text-sky-400 font-semibold hover:underline">
            Register Tenant
          </Link>
        </div>
      </div>

      {/* Right Column: Asset Slideshow Carousel */}
      <div className="hidden lg:col-span-7 lg:flex flex-col items-center justify-center p-8 bg-[#090d16] relative overflow-hidden">
        {/* Decorative subtle ambient lights */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Outer card frame matching mockup */}
        <div className="relative w-full max-w-xl aspect-4/3 rounded-3xl border border-slate-800/60 bg-slate-900/30 p-4 backdrop-blur-md shadow-2xl flex flex-col justify-between overflow-hidden">
          {/* Images rotating container */}
          <div className="absolute inset-0 z-0">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(9, 13, 22, 0.95) 15%, rgba(9, 13, 22, 0.4) 60%, rgba(9, 13, 22, 0.1) 100%), url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            ))}
          </div>

          {/* Slide Indicators top bar */}
          <div className="relative z-10 flex gap-1.5 self-center mt-2.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'w-8 bg-sky-400' : 'w-2 bg-slate-600/60'
                }`}
              />
            ))}
          </div>

          {/* Bottom Card Content overlay */}
          <div className="relative z-10 mt-auto bg-slate-950/70 border border-slate-800/60 backdrop-blur-md p-6 rounded-2xl space-y-2">
            {slides.map((slide, index) => {
              const Icon = slide.icon;
              return (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    index === currentSlide ? 'block opacity-100 translate-y-0' : 'hidden opacity-0 translate-y-2'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                    <Icon className="h-4 w-4" /> {slide.title}
                  </div>
                  <p className="text-sm font-semibold text-slate-100 leading-snug">
                    {slide.description}
                  </p>
                </div>
              );
            })}
            <div className="text-[9px] text-slate-500 font-mono tracking-widest pt-2 border-t border-slate-800/40 flex justify-between items-center">
              <span>FACTORYOS CONSOLE V1.2.9</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" /> ONLINE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
