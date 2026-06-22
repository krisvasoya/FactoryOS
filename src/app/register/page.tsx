'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Loader2, Building, User, Mail, Lock, Cpu, Database, Landmark, ShieldCheck, BarChart2, Zap } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image: '/images/smart_factory.png',
      category: 'AUTOMATION & SCHEDULES',
      title: 'Orchestrate real-time production flow with advanced ',
      highlight: 'machine scheduling.',
      description: 'AI-powered insights, real-time analytics, and complete control over your manufacturing operations.',
      icon: Cpu,
    },
    {
      image: '/images/warehouse.png',
      category: 'INVENTORY & LEDGER',
      title: 'Monitor stock levels and track warehouse ',
      highlight: 'movements dynamically.',
      description: 'AI-powered insights, real-time analytics, and complete control over your manufacturing operations.',
      icon: Database,
    },
    {
      image: '/images/control_room.png',
      category: 'BUSINESS COMMAND',
      title: 'Visualize monthly financial gains and ',
      highlight: 'operational performance.',
      description: 'AI-powered insights, real-time analytics, and complete control over your manufacturing operations.',
      icon: Landmark,
    },
    {
      image: '/images/pcb_assembly.png',
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
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50/50 text-slate-800">
      {/* Left Column: Register Tenant Form */}
      <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-12 md:p-16 bg-white border-r border-slate-200/80 overflow-y-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-sm shadow-md">
            F
          </div>
          <span className="font-bold tracking-tight text-sm text-slate-800">FactoryOS</span>
        </div>

        <div className="max-w-sm w-full mx-auto my-auto space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Register <span className="text-indigo-600">tenant</span>
            </h1>
            <p className="text-xs text-slate-500">
              Initialize a dedicated isolated instance to manage factory products and stock sheets.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Company Name</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Electronics Ltd"
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:border-indigo-600 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-slate-400 text-slate-900"
                />
              </div>
            </div>

            {/* Owner Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Primary Contact Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Arjun Sharma"
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:border-indigo-600 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-slate-400 text-slate-900"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Login Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yourcompany.com"
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:border-indigo-600 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-slate-400 text-slate-900"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Secret Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:border-indigo-600 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-slate-400 text-slate-900"
                />
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
                  <span>Initialize Factory Instance</span>
                  <ArrowRight className="h-4 w-4 text-primary-foreground" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-xs">
          <span className="text-slate-500">Already registered? </span>
          <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>

      {/* Right Column: Asset Slideshow Carousel */}
      <div className="hidden lg:col-span-7 lg:flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40 relative overflow-hidden">
        {/* Decorative subtle ambient lights */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Outer card frame matching mockup */}
        <div className="relative w-full max-w-xl aspect-4/3 rounded-3xl border border-slate-200/80 bg-white/70 p-4 backdrop-blur-md shadow-2xl flex flex-col justify-between overflow-hidden">
          {/* Images rotating container */}
          <div className="absolute inset-0 z-0">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(255, 255, 255, 0.98) 25%, rgba(255, 255, 255, 0.4) 65%, rgba(255, 255, 255, 0.1) 100%), url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            ))}
          </div>

          {/* SYSTEM ONLINE Badge */}
          <div className="absolute top-6 left-6 z-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[9px] font-bold text-emerald-600 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SYSTEM ONLINE
          </div>

          {/* Slide Indicators top bar */}
          <div className="relative z-10 flex gap-1.5 self-center mt-2.5">
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
