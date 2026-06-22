'use client';

import React, { useState, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { AuthVisuals } from '@/features/auth/components/AuthVisuals';

function LoginContent() {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="h-screen max-h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-[#faf9f6] text-slate-800 font-sans relative selection:bg-indigo-500/20 selection:text-slate-900">
      {/* Decorative Blueprint Background Grids for entire page */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-60" />

      {/* Pulsing ambient lights */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-cyan-500/4 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* Left Column: Access Console Form */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 md:p-10 bg-white/80 border-r border-slate-200/50 backdrop-blur-md overflow-y-auto lg:overflow-hidden relative z-10 animate-fade-in">
        <LoginForm />
      </div>

      {/* Right Column: Visual Preview Slides */}
      <AuthVisuals currentSlide={currentSlide} setCurrentSlide={setCurrentSlide} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 font-sans">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
