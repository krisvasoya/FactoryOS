'use client';

import React, { useEffect } from 'react';
import { Cpu, Database, Landmark, ShieldCheck, BarChart2, Zap } from 'lucide-react';

interface AuthVisualsProps {
  currentSlide: number;
  setCurrentSlide: (idx: number) => void;
}

export function AuthVisuals({ currentSlide, setCurrentSlide }: AuthVisualsProps) {
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
      setCurrentSlide((currentSlide + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide, slides.length, setCurrentSlide]);

  return (
    <div className="hidden lg:col-span-7 lg:flex flex-col items-center justify-center p-8 bg-[#f5f4f0]/60 border-l border-slate-200/50 relative overflow-hidden">
      
      {/* Animated Gradient Flowing Ribbon Backdrop (Mockup 1 style) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.15]">
        <svg className="w-full h-full min-w-[800px] overflow-visible" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#06b6d4" stopOpacity="0.7" />
              <stop offset="65%" stopColor="#fbbf24" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M -100,500 C 150,580 250,150 480,280 C 700,380 620,80 920,-50" stroke="url(#ribbonGrad)" strokeWidth="70" strokeLinecap="round" fill="none" opacity="0.85" />
          <path d="M -80,480 C 170,560 270,130 460,260 C 680,360 600,60 900,-70" stroke="#000" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.1" />
        </svg>
      </div>

      {/* Faint coordinate blueprint ticks (Creativity detailing) */}
      <div className="absolute top-6 left-6 w-32 h-32 border-t border-l border-slate-300/40 pointer-events-none rounded-tl-3xl" />
      <div className="absolute top-6 right-6 w-32 h-32 border-t border-r border-slate-300/40 pointer-events-none rounded-tr-3xl" />
      <div className="absolute bottom-6 left-6 w-32 h-32 border-b border-l border-slate-300/40 pointer-events-none rounded-bl-3xl" />
      <div className="absolute bottom-6 right-6 w-32 h-32 border-b border-r border-slate-300/40 pointer-events-none rounded-br-3xl" />
      
      <div className="absolute top-8 left-8 text-[8px] font-mono text-slate-400 select-none tracking-widest pointer-events-none">
        SYS_COORD: [34.789° N, 114.298° E]
      </div>
      <div className="absolute bottom-8 right-8 text-[8px] font-mono text-slate-400 select-none tracking-widest pointer-events-none">
        NODE_ID: FOS_NODE_09
      </div>

      {/* Floating Corner Dashboards (Light Glassmorphic Style) */}
      {/* Top-Left Live Log */}
      <div className="absolute top-12 left-12 w-52 bg-white/70 border border-slate-200/60 p-3.5 rounded-2xl shadow-md font-mono text-[9px] text-slate-600 space-y-1 select-none pointer-events-none hover:translate-y-[-2px] transition-transform duration-300 hidden xl:block z-10 backdrop-blur-md shadow-slate-100">
        <div className="flex justify-between items-center text-slate-800 font-bold border-b border-slate-200/60 pb-1.5 mb-1.5 uppercase tracking-wider text-[8px]">
          <span>System Telemetry</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="truncate text-indigo-600 font-semibold">&gt; Secure session node live</div>
        <div className="truncate">&gt; DB connected: Neon PostgreSQL</div>
        <div className="truncate">&gt; Encryption: AES-256 standard</div>
        <div className="truncate text-emerald-600 font-semibold">&gt; Co-pilot online (v1.3)</div>
      </div>

      {/* Bottom-Left Live Workload */}
      <div className="absolute bottom-12 left-12 w-48 bg-white/70 border border-slate-200/60 p-3.5 rounded-2xl shadow-md space-y-1.5 select-none pointer-events-none hover:translate-y-[-2px] transition-transform duration-300 hidden xl:block z-10 backdrop-blur-md shadow-slate-100">
        <div className="flex justify-between items-center text-slate-800 font-bold border-b border-slate-200/60 pb-1 mb-1.5 uppercase tracking-wider text-[8px]">
          <span>Hardware Pipelines</span>
          <span className="text-slate-400 font-normal">Active</span>
        </div>
        <div className="space-y-1.5 text-[9px] text-slate-600 font-semibold">
          <div className="flex justify-between">
            <span>Milling Mach #1</span>
            <span className="text-indigo-600">82%</span>
          </div>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: '82%' }}></div>
          </div>
          <div className="flex justify-between pt-0.5">
            <span>Laser Cutter #2</span>
            <span className="text-emerald-600">65%</span>
          </div>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>
      </div>

      {/* Top-Right Overall Yield */}
      <div className="absolute top-12 right-12 w-44 bg-white/70 border border-slate-200/60 p-3.5 rounded-2xl shadow-md space-y-1 select-none pointer-events-none hover:translate-y-[-2px] transition-transform duration-300 hidden xl:block z-10 backdrop-blur-md shadow-slate-100">
        <div className="text-slate-400 uppercase font-bold tracking-widest text-[7px]">Overall Quality Yield</div>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-xl font-extrabold text-slate-800">98.4%</span>
          <span className="text-[9px] font-bold text-emerald-600">↑ 1.2%</span>
        </div>
        <div className="text-[8px] font-semibold text-slate-400">Zero error threshold achieved</div>
      </div>

      {/* Bottom-Right Secure Layer */}
      <div className="absolute bottom-12 right-12 w-48 bg-white/70 border border-slate-200/60 p-3.5 rounded-2xl shadow-md hidden xl:flex items-center gap-2.5 select-none pointer-events-none hover:translate-y-[-2px] transition-transform duration-300 z-10 backdrop-blur-md shadow-slate-100">
        <div className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-xs">
          🛡️
        </div>
        <div>
          <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider">Tenant Layer</span>
          <span className="text-[10px] font-extrabold text-slate-800">AES-256 Iso</span>
        </div>
      </div>

      {/* Outer Card Frame (Light Glassmorphic Preview) */}
      <div className="relative w-full max-w-xl aspect-4/3 rounded-3xl border border-slate-200/80 bg-white/60 backdrop-blur-2xl p-6 shadow-xl flex flex-col justify-between overflow-hidden shadow-slate-200/30">
        
        {/* Top Info Bar */}
        <div className="flex justify-between items-center z-10 w-full">
          <div className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[9px] font-bold text-emerald-700 flex items-center gap-1.5 uppercase tracking-widest">
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
                  index === currentSlide ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200 hover:bg-slate-350'
                }`}
                aria-label={`Switch to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Center SVG illustrations */}
        <div className="grow flex items-center justify-center w-full z-10 my-4 min-h-[220px] relative">
          {currentSlide === 0 && (
            <svg viewBox="0 0 400 240" className="w-full h-full max-h-[210px] overflow-visible drop-shadow-sm select-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <style>
                  {`
                    @keyframes robotic-float {
                      0%, 100% { transform: translateY(0px) rotate(0deg); }
                      50% { transform: translateY(-4px) rotate(3deg); }
                    }
                    @keyframes claw-pulse {
                      0%, 100% { fill-opacity: 0.2; stroke-width: 1; }
                      50% { fill-opacity: 0.8; stroke-width: 2.5; }
                    }
                    @keyframes gear-rotate {
                      to { transform: rotate(360deg); }
                    }
                    @keyframes conveyor-flow {
                      to { stroke-dashoffset: -20; }
                    }
                    .robotic-part { animation: robotic-float 4s ease-in-out infinite; transform-origin: 130px 165px; }
                    .gear-spin-1 { animation: gear-rotate 12s linear infinite; transform-origin: 80px 80px; }
                    .gear-spin-2 { animation: gear-rotate 8s linear reverse infinite; transform-origin: 94px 92px; }
                    .conveyor-belt-line { stroke-dasharray: 5 3; animation: conveyor-flow 1.5s linear infinite; }
                    .signal-glow-ring { animation: claw-pulse 2s ease-in-out infinite; }
                  `}
                </style>
                <linearGradient id="gradient-top" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#312e81" />
                </linearGradient>
              </defs>
              {/* Tech Grids */}
              <g stroke="rgba(0,0,0,0.04)" strokeWidth="0.6" opacity="0.4">
                <line x1="50" y1="200" x2="350" y2="50" />
                <line x1="50" y1="50" x2="350" y2="200" />
                <line x1="200" y1="20" x2="200" y2="220" />
              </g>
              
              {/* Conveyor track */}
              <path d="M 50,160 L 350,160" stroke="rgba(0,0,0,0.08)" strokeWidth="6" strokeLinecap="round" />
              <path d="M 50,160 L 350,160" className="conveyor-belt-line" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
              
              {/* Conveyor boxes */}
              <g fill="#4f46e5">
                <polygon points="100,160 115,152 130,160 115,168" />
                <polygon points="270,160 285,152 300,160 285,168" />
              </g>

              {/* Robotic Arm Base */}
              <polygon points="110,180 150,180 140,165 120,165" fill="#e2e8f0" />
              
              {/* Robotic Arm segments */}
              <g className="robotic-part">
                <line x1="130" y1="165" x2="160" y2="110" stroke="#4f46e5" strokeWidth="6" strokeLinecap="round" />
                <circle cx="130" cy="165" r="4.5" fill="#312e81" />
                <line x1="160" y1="110" x2="210" y2="125" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
                <circle cx="160" cy="110" r="3.5" fill="#312e81" />
                
                {/* Joint Head and Claw laser pointing down */}
                <circle cx="210" cy="125" r="5" fill="#f43f5e" />
                <line x1="210" y1="125" x2="210" y2="155" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 2" className="signal-glow-ring" />
              </g>

              {/* Overlap schedule cards */}
              <rect x="220" y="40" width="60" height="24" rx="6" fill="rgba(0,0,0,0.02)" stroke="rgba(0,0,0,0.06)" strokeWidth="1" opacity="0.9" />
              <text x="228" y="55" fill="#4f46e5" fontSize="9" fontWeight="bold" fontFamily="monospace">JOB_#104</text>
              
              {/* Gears */}
              <circle cx="80" cy="80" r="12" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="2.5" strokeDasharray="4 2" className="gear-spin-1" />
              <circle cx="80" cy="80" r="5" fill="rgba(0,0,0,0.15)" />
              <circle cx="94" cy="92" r="8" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2" strokeDasharray="3 2" className="gear-spin-2" />
            </svg>
          )}

          {currentSlide === 1 && (
            <svg viewBox="0 0 400 240" className="w-full h-full max-h-[210px] overflow-visible drop-shadow-sm select-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <style>
                  {`
                    @keyframes storage-pulse {
                      0%, 100% { opacity: 0.6; }
                      50% { opacity: 1; }
                    }
                    @keyframes crane-move {
                      0%, 100% { transform: translateX(0px); }
                      50% { transform: translateX(45px); }
                    }
                    .storage-cap { animation: storage-pulse 2s ease-in-out infinite; }
                    .crane-animation { animation: crane-move 6s ease-in-out infinite; }
                  `}
                </style>
              </defs>
              {/* Grid Floor */}
              <g stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" opacity="0.4">
                <line x1="50" y1="180" x2="350" y2="180" />
                <line x1="100" y1="200" x2="300" y2="100" />
                <line x1="300" y1="200" x2="100" y2="100" />
              </g>

              {/* Warehouse Shelf Towers (Isometric Shelving) */}
              {/* Tower 1 (Left) */}
              <g opacity="0.9">
                <polygon points="100,160 120,150 140,160 120,170" fill="rgba(0,0,0,0.02)" stroke="rgba(0,0,0,0.08)" />
                <line x1="100" y1="160" x2="100" y2="90" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
                <line x1="120" y1="170" x2="120" y2="100" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
                <line x1="140" y1="160" x2="140" y2="90" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />
                
                {/* Shelves */}
                <polygon points="100,130 120,120 140,130 120,140" fill="rgba(0,0,0,0.03)" opacity="0.5" />
                <polygon points="100,105 120,95 140,105 120,115" fill="rgba(0,0,0,0.03)" opacity="0.5" />
                
                {/* Box on shelf */}
                <polygon points="106,126 114,122 122,126 114,130" fill="#f59e0b" />
                <polygon points="106,126 114,130 114,136 106,132" fill="#d97706" />
              </g>

              {/* Tower 2 (Right) */}
              <g opacity="0.9">
                <polygon points="260,160 280,150 300,160 280,170" fill="rgba(0,0,0,0.02)" stroke="rgba(0,0,0,0.08)" />
                <line x1="260" y1="160" x2="260" y2="90" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
                <line x1="280" y1="170" x2="280" y2="100" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
                <line x1="300" y1="160" x2="300" y2="90" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />
                
                <polygon points="260,130 280,120 300,130 280,140" fill="rgba(0,0,0,0.03)" opacity="0.5" />
                <polygon points="260,105 280,95 300,105 280,115" fill="rgba(0,0,0,0.03)" opacity="0.5" />

                {/* Boxes on shelf */}
                <polygon points="266,126 274,122 282,126 274,130" fill="#10b981" />
                <polygon points="274,122 282,126 290,122 282,118" fill="#3b82f6" />
              </g>

              {/* Moving crane hook */}
              <g className="crane-animation">
                <line x1="120" y1="50" x2="220" y2="50" stroke="rgba(0,0,0,0.1)" strokeWidth="3" strokeLinecap="round" />
                <line x1="150" y1="50" x2="150" y2="95" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
                
                {/* Floating Box */}
                <polygon points="142,95 150,91 158,95 150,99" fill="#818cf8" />
                <polygon points="142,95 150,99 150,105 142,101" fill="#4f46e5" />
                <polygon points="150,99 158,95 158,101 150,105" fill="#3730a3" />
              </g>

              {/* Capacity meter */}
              <rect x="315" y="40" width="16" height="50" rx="3" fill="rgba(0,0,0,0.02)" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
              <rect x="317" y="55" width="12" height="33" rx="2" fill="#10b981" className="storage-cap" />
              <text x="315" y="105" fill="rgba(0,0,0,0.4)" fontSize="8" fontWeight="bold">82%</text>
            </svg>
          )}

          {currentSlide === 2 && (
            <svg viewBox="0 0 400 240" className="w-full h-full max-h-[210px] overflow-visible drop-shadow-sm select-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <style>
                  {`
                    @keyframes chart-rise {
                      0% { transform: scaleY(0.1); }
                      100% { transform: scaleY(1); }
                    }
                    @keyframes badge-float {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(-4px); }
                    }
                    .bar-rise-1 { animation: chart-rise 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform-origin: bottom; }
                    .floating-badge { animation: badge-float 3s ease-in-out infinite; }
                  `}
                </style>
              </defs>
              {/* Tech grid guidelines */}
              <g stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" opacity="0.4">
                <line x1="50" y1="180" x2="350" y2="180" />
                <line x1="50" y1="130" x2="350" y2="130" />
                <line x1="50" y1="80" x2="350" y2="80" />
              </g>

              {/* 3D Column Bars */}
              {/* Bar 1 */}
              <g transform="translate(90, 180)" className="bar-rise-1" style={{ animationDelay: '0.1s' }}>
                <polygon points="0,0 0,-40 20,-30 20,0" fill="#34d399" />
                <polygon points="20,-30 40,-40 40,0 20,0" fill="#059669" />
                <polygon points="0,-40 20,-50 40,-40 20,-30" fill="#6ee7b7" />
              </g>

              {/* Bar 2 */}
              <g transform="translate(170, 180)" className="bar-rise-1" style={{ animationDelay: '0.3s' }}>
                <polygon points="0,0 0,-70 20,-60 20,0" fill="#60a5fa" />
                <polygon points="20,-60 40,-70 40,0 20,0" fill="#2563eb" />
                <polygon points="0,-70 20,-80 40,-70 20,-60" fill="#93c5fd" />
              </g>

              {/* Bar 3 */}
              <g transform="translate(250, 180)" className="bar-rise-1" style={{ animationDelay: '0.5s' }}>
                <polygon points="0,0 0,-100 20,-90 20,0" fill="#818cf8" />
                <polygon points="20,-90 40,-100 40,0 20,0" fill="#4f46e5" />
                <polygon points="0,-100 20,-110 40,-100 20,-90" fill="#a5b4fc" />
              </g>

              {/* Trend line */}
              <path d="M 110,130 L 190,120 L 270,70" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="270" cy="70" r="4.5" fill="#f43f5e" />
              <circle cx="270" cy="70" r="9" fill="none" stroke="#f43f5e" strokeWidth="1.5" opacity="0.4" className="signal-glow" />

              {/* Floating currency badge */}
              <g className="floating-badge" transform="translate(280, 30)">
                <circle cx="20" cy="20" r="16" fill="rgba(0,0,0,0.02)" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />
                <text x="15" y="25" fill="#334155" fontSize="13" fontWeight="bold">₹</text>
              </g>
            </svg>
          )}

          {currentSlide === 3 && (
            <svg viewBox="0 0 400 240" className="w-full h-full max-h-[210px] overflow-visible drop-shadow-sm select-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <style>
                  {`
                    @keyframes pulse-node {
                      0%, 100% { transform: scale(1); }
                      50% { transform: scale(1.1); }
                    }
                    @keyframes flow-dashed {
                      to { stroke-dashoffset: -20; }
                    }
                    .bom-core { animation: pulse-node 3s ease-in-out infinite; transform-origin: 200px 90px; }
                    .flow-lines { stroke-dasharray: 4 3; animation: flow-dashed 1s linear infinite; }
                  `}
                </style>
              </defs>
              {/* Tech lines background */}
              <g stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" opacity="0.4">
                <line x1="200" y1="20" x2="200" y2="220" />
                <line x1="50" y1="160" x2="350" y2="160" />
              </g>

              {/* Core finished product node */}
              <g className="bom-core">
                <circle cx="200" cy="90" r="22" fill="#4f46e5" />
                <circle cx="200" cy="90" r="28" fill="none" stroke="#818cf8" strokeWidth="1.5" opacity="0.5" />
                <text x="187" y="93" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">BOM</text>
              </g>

              {/* Raw material input nodes */}
              <g transform="translate(100, 170)">
                <circle cx="0" cy="0" r="14" fill="#10b981" />
                <text x="-9" y="3" fill="#fff" fontSize="8" fontWeight="bold">COP</text>
              </g>
              <path d="M 100,156 L 178,100" fill="none" stroke="#10b981" strokeWidth="2.5" className="flow-lines" />

              <g transform="translate(200, 180)">
                <circle cx="0" cy="0" r="14" fill="#3b82f6" />
                <text x="-9" y="3" fill="#fff" fontSize="8" fontWeight="bold">ALU</text>
              </g>
              <path d="M 200,166 L 200,118" fill="none" stroke="#3b82f6" strokeWidth="2.5" className="flow-lines" />

              <g transform="translate(300, 170)">
                <circle cx="0" cy="0" r="14" fill="#f59e0b" />
                <text x="-9" y="3" fill="#fff" fontSize="8" fontWeight="bold">PLA</text>
              </g>
              <path d="M 300,156 L 222,100" fill="none" stroke="#f59e0b" strokeWidth="2.5" className="flow-lines" />
            </svg>
          )}

          {/* Micro Floating Metric Card Overlay */}
          <div className="absolute top-8 right-6 bg-white/80 border border-slate-200/60 p-2.5 rounded-xl shadow-md flex items-center gap-2 select-none pointer-events-none float-card-1 backdrop-blur-md shadow-slate-100">
            <div className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              ↑
            </div>
            <div>
              <span className="text-[7px] text-slate-400 block uppercase font-bold tracking-wider">Yield Margin</span>
              <span className="text-[10px] font-extrabold text-slate-800">94.2%</span>
            </div>
          </div>

          <div className="absolute bottom-8 left-6 bg-white/80 border border-slate-200/60 p-2.5 rounded-xl shadow-md flex items-center gap-2 select-none pointer-events-none float-card-2 backdrop-blur-md shadow-slate-100">
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
        <div className="relative z-10 mt-auto bg-white/80 border border-slate-200/60 p-5 rounded-2xl shadow-md space-y-4 backdrop-blur-md">
          {slides.map((slide, index) => {
            return (
              <div
                key={index}
                className={`transition-all duration-500 ${
                  index === currentSlide ? 'block opacity-100 translate-y-0' : 'hidden opacity-0 translate-y-2'
                }`}
              >
                <div className="text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <slide.icon className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
                  {slide.category}
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {slide.title}<span className="text-indigo-600">{slide.highlight}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {slide.description}
                </p>
              </div>
            );
          })}

          {/* Icons Grid Row */}
          <div className="grid grid-cols-4 gap-2 pt-3.5 border-t border-slate-200/60 mt-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <div className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-200/60 text-indigo-600 flex items-center justify-center">
                <BarChart2 className="h-3.5 w-3.5" />
              </div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight mt-1">Real-time Analytics</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-200/60 text-indigo-600 flex items-center justify-center">
                <Cpu className="h-3.5 w-3.5" />
              </div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight mt-1">AI Insights</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-200/60 text-indigo-600 flex items-center justify-center">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight mt-1">Secure & Reliable</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-200/60 text-indigo-600 flex items-center justify-center">
                <Zap className="h-3.5 w-3.5" />
              </div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight mt-1">High Performance</span>
            </div>
          </div>

          {/* Bottom Status Footer */}
          <div className="text-[9px] text-slate-400 font-mono tracking-widest pt-2 border-t border-slate-200/60 flex justify-between items-center">
            <span>FACTORYOS CONSOLE V1.3.0</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              ONLINE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
