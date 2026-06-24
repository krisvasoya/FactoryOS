'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Database,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useDocumentIntelligence } from '@/features/documents/hooks/useDocumentIntelligence';
import { UploadZone } from '@/features/documents/components/UploadZone';
import { ProcessingAnimation } from '@/features/documents/components/ProcessingAnimation';
import { InvoiceReviewPanel } from '@/features/documents/components/InvoiceReviewPanel';

export default function PurchaseInvoiceAIPage() {
  const hookData = useDocumentIntelligence();
  const { phase, processingStep, processingMessage, error, successData, processFile, reset } = hookData;

  return (
    <div className="space-y-6 text-xs max-w-6xl mx-auto pb-12">
      {/* Breadcrumb / Navigation */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/app/documents"
            className="w-8 h-8 rounded-lg border border-border bg-card/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">Purchase Invoice AI</h1>
              <span className="px-2 py-0.5 rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-400 font-bold text-[9px]">
                Active Engine
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Reconcile incoming supplier materials and update stock ledger accounts automatically.
            </p>
          </div>
        </div>

        {/* Gemini Engine status badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-[10px] animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Gemini 2.0 Flash Vision</span>
        </div>
      </div>

      {/* Stepper Header (visible unless in success phase) */}
      {phase !== 'success' && (
        <div className="flex justify-center items-center gap-2 sm:gap-6 py-2 px-4 rounded-xl border border-border bg-card/30 max-w-md mx-auto">
          {[
            { step: 'upload', label: 'Upload' },
            { step: 'processing', label: 'Analyze' },
            { step: 'review', label: 'Reconcile' },
          ].map(({ step, label }, idx) => {
            const isActive = phase === step || (step === 'processing' && phase === 'processing');
            const isCompleted =
              (step === 'upload' && phase !== 'upload') ||
              (step === 'processing' && phase === 'review');

            return (
              <React.Fragment key={step}>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300
                      ${isActive
                        ? 'bg-sky-500 text-white ring-4 ring-sky-500/10'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-secondary text-muted-foreground'
                      }
                    `}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`font-semibold transition-colors duration-300 ${
                      isActive ? 'text-sky-400' : isCompleted ? 'text-emerald-400' : 'text-muted-foreground'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {idx < 2 && <div className="h-px w-6 sm:w-12 bg-border" />}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Phase Views */}
      {phase === 'upload' && (
        <div className="py-8">
          <UploadZone onFileSelected={processFile} error={error} />
        </div>
      )}

      {phase === 'processing' && (
        <div className="py-12 border border-border bg-card/25 rounded-2xl">
          <ProcessingAnimation step={processingStep} message={processingMessage} />
        </div>
      )}

      {phase === 'review' && (
        <InvoiceReviewPanel hookData={hookData} />
      )}

      {phase === 'success' && successData && (
        <div className="max-w-md mx-auto text-center border border-border bg-card rounded-2xl p-8 space-y-6 shadow-2xl animate-scale-up">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/5">
            <CheckCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">Invoice Posted Successfully</h2>
            <p className="text-muted-foreground leading-normal px-4">
              Purchase invoice <span className="font-mono text-foreground font-semibold">"{successData.invoiceNumber}"</span> has been approved and logged. {successData.itemsProcessed} materials have been cataloged and received.
            </p>
          </div>

          {/* Quick info boxes */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-secondary/40 border border-border p-3.5 rounded-xl text-center space-y-1">
              <Database className="h-4 w-4 text-indigo-400 mx-auto" />
              <p className="text-[10px] text-muted-foreground font-semibold">Stock Updated</p>
              <p className="text-[9px] text-muted-foreground/60 leading-tight">Ledger quantities incremented.</p>
            </div>
            <div className="bg-secondary/40 border border-border p-3.5 rounded-xl text-center space-y-1">
              <TrendingUp className="h-4 w-4 text-emerald-400 mx-auto" />
              <p className="text-[10px] text-muted-foreground font-semibold">Expense Logged</p>
              <p className="text-[9px] text-muted-foreground/60 leading-tight">Bookkeeping ledger created.</p>
            </div>
          </div>

          <div className="h-px bg-border/60" />

          {/* Action redirects */}
          <div className="space-y-2.5">
            <button
              onClick={reset}
              className="w-full h-10 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold transition-all shadow-md shadow-sky-500/15 flex items-center justify-center gap-1.5"
            >
              Upload Another Invoice
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/app/inventory"
                className="h-9 rounded-xl border border-border flex items-center justify-center text-foreground hover:bg-secondary/40 transition-colors font-semibold"
              >
                Go to Inventory
              </Link>
              <Link
                href="/app/documents"
                className="h-9 rounded-xl border border-border flex items-center justify-center text-foreground hover:bg-secondary/40 transition-colors font-semibold"
              >
                Intelligence Hub
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
