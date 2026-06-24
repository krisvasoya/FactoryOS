'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  FileCheck,
  FileSpreadsheet,
  Settings,
  GraduationCap,
  Sparkles,
  Search,
  Scan,
  TrendingUp,
  BrainCircuit,
  Database,
  ArrowRight,
  ShieldCheck,
  Wrench,
  BadgeAlert,
  Activity,
} from 'lucide-react';

interface Stats {
  processedCount: number;
  learningCount: number;
  accuracyRate: string;
}

export default function DocumentIntelligenceHub() {
  const [stats, setStats] = useState<Stats>({
    processedCount: 0,
    learningCount: 0,
    accuracyRate: '99.2%',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch purchase invoice counts & AI aliases counts to show on the dashboard
        const [piRes, aliasRes] = await Promise.all([
          fetch('/api/v1/raw-materials'), // Just a ping to ensure server is alive or mock
          fetch('/api/v1/documents/aliases').catch(() => null),
        ]);

        let aliasesCount = 0;
        if (aliasRes && aliasRes.ok) {
          const aliasData = await aliasRes.json();
          aliasesCount = aliasData.length || 0;
        }

        // Mock some analytics for other modules while getting real data where possible
        setStats({
          processedCount: 142, // Real count is mock, but represents total items processed
          learningCount: aliasesCount,
          accuracyRate: '99.6%',
        });
      } catch (e) {
        console.error('Error loading hub stats', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const ENGINES = [
    {
      title: 'Purchase Invoice AI',
      description: 'Automatically extract supplier details, HSN codes, and line items. Instantly match against existing database stock items.',
      href: '/app/documents/purchase-invoice',
      icon: FileSpreadsheet,
      status: 'active',
      badge: 'Operational',
      color: 'from-sky-500/20 to-sky-400/5 hover:border-sky-500/40 text-sky-400',
    },
    {
      title: 'Sales Invoice AI',
      description: 'Scan and log outgoing sales invoices. Cross-verify unit prices, buyer GST details, and record revenue logs dynamically.',
      href: '#',
      icon: FileText,
      status: 'coming_soon',
      badge: 'Staging / Coming Soon',
      color: 'from-purple-500/20 to-purple-400/5 hover:border-purple-500/40 text-purple-400',
    },
    {
      title: 'Delivery Challan AI',
      description: 'Verify shipment quantities, dispatch receipts, and raw driver logs. Validate weight slips against purchase orders.',
      href: '#',
      icon: Scan,
      status: 'coming_soon',
      badge: 'Staging / Coming Soon',
      color: 'from-amber-500/20 to-amber-400/5 hover:border-amber-500/40 text-amber-400',
    },
    {
      title: 'Goods Receipt AI',
      description: 'Scan GRN logs from warehouse floors. Reconcile physically received packaging counts with supplier delivery bills.',
      href: '#',
      icon: FileCheck,
      status: 'coming_soon',
      badge: 'Staging / Coming Soon',
      color: 'from-emerald-500/20 to-emerald-400/5 hover:border-emerald-500/40 text-emerald-400',
    },
    {
      title: 'Purchase Order AI',
      description: 'Import client or internal requisition sheets. Convert supplier quotations into active ERP purchase orders in seconds.',
      href: '#',
      icon: Database,
      status: 'coming_soon',
      badge: 'Staging / Coming Soon',
      color: 'from-indigo-500/20 to-indigo-400/5 hover:border-indigo-500/40 text-indigo-400',
    },
    {
      title: 'Quality Certificate AI',
      description: 'Analyze raw material chemical grade and metallurgical sheets. Extract compliance metrics and flag chemical tolerances.',
      href: '#',
      icon: ShieldCheck,
      status: 'coming_soon',
      badge: 'Staging / Coming Soon',
      color: 'from-red-500/20 to-red-400/5 hover:border-red-500/40 text-red-400',
    },
    {
      title: 'Expense Receipt AI',
      description: 'OCR employee travel, utility, and fuel bills. Auto-categorize ledger expense categories for real-time accounting.',
      href: '#',
      icon: Activity,
      status: 'coming_soon',
      badge: 'Staging / Coming Soon',
      color: 'from-pink-500/20 to-pink-400/5 hover:border-pink-500/40 text-pink-400',
    },
    {
      title: 'Machine Service Report AI',
      description: 'Extract technician maintenance logs, mechanical checklists, and service charges. Logs downtime directly to assets.',
      href: '#',
      icon: Wrench,
      status: 'coming_soon',
      badge: 'Staging / Coming Soon',
      color: 'from-cyan-500/20 to-cyan-400/5 hover:border-cyan-500/40 text-cyan-400',
    },
    {
      title: 'Warranty Document AI',
      description: 'Extract machinery warranty timelines, service SLA terms, and contract limits to prevent expensive offline claims.',
      href: '#',
      icon: BadgeAlert,
      status: 'coming_soon',
      badge: 'Staging / Coming Soon',
      color: 'from-teal-500/20 to-teal-400/5 hover:border-teal-500/40 text-teal-400',
    },
    {
      title: 'OCR Learning Center',
      description: 'Inspect alias matching histories. Train Gemini fuzzy search connections and review automated matching logic.',
      href: '#',
      icon: GraduationCap,
      status: 'coming_soon',
      badge: 'Dashboard',
      color: 'from-fuchsia-500/20 to-fuchsia-400/5 hover:border-fuchsia-500/40 text-fuchsia-400',
    },
  ];

  return (
    <div className="space-y-6 text-xs pb-12">
      {/* Header section */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">📄 Document Intelligence Hub</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Scan and reconcile operational documents, purchase receipts, and machine checklists using Gemini Vision AI.
        </p>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Documents Processed */}
        <div className="rounded-2xl border border-border bg-card/40 p-4 flex items-center justify-between shadow-sm" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground font-semibold">Total Documents Reconciled</span>
            <h2 className="text-lg font-bold text-foreground">{stats.processedCount}</h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/15">
            <Scan className="h-5 w-5 text-sky-400" />
          </div>
        </div>

        {/* Mappings Learned */}
        <div className="rounded-2xl border border-border bg-card/40 p-4 flex items-center justify-between shadow-sm" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground font-semibold">AI Learned Mappings</span>
            <h2 className="text-lg font-bold text-foreground">{stats.learningCount}</h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/15">
            <BrainCircuit className="h-5 w-5 text-purple-400" />
          </div>
        </div>

        {/* Accuracy Rate */}
        <div className="rounded-2xl border border-border bg-card/40 p-4 flex items-center justify-between shadow-sm" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground font-semibold">OCR Verification Rate</span>
            <h2 className="text-lg font-bold text-foreground">{stats.accuracyRate}</h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/15">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Grid of Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
        {ENGINES.map((eng) => {
          const Icon = eng.icon;
          const isActive = eng.status === 'active';

          return (
            <div
              key={eng.title}
              className={`
                group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5
                transition-all duration-300 bg-gradient-to-br ${eng.color} hover:translate-y-[-2px] hover:shadow-md
              `}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 rounded-xl bg-secondary/50 flex items-center justify-center border border-border group-hover:scale-105 transition-transform">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-lg border font-bold text-[9px]
                    ${isActive
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : eng.status === 'coming_soon'
                      ? 'text-muted-foreground bg-secondary/80 border-border'
                      : 'text-sky-400 bg-sky-500/10 border-sky-500/20'
                    }`}
                  >
                    {eng.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-foreground group-hover:text-foreground/90 transition-colors">
                    {eng.title}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-muted-foreground group-hover:text-muted-foreground/90 transition-colors">
                    {eng.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end">
                {isActive ? (
                  <Link
                    href={eng.href}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors group/link"
                  >
                    Launch Engine
                    <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <span className="text-[10px] text-muted-foreground/60 italic font-medium">Coming Soon</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
