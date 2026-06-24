'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, Circle, Loader2, XCircle, Bot } from 'lucide-react';
import { ProcessingStep } from '../hooks/useDocumentIntelligence';

interface ProcessingAnimationProps {
  step: ProcessingStep;
  message: string;
}

const STEPS = [
  { id: 'uploading', label: 'File received & validated', subLabel: 'Checking format and size' },
  { id: 'extracting', label: 'Gemini Vision AI reading invoice', subLabel: 'Extracting supplier, items & financials' },
  { id: 'matching', label: 'Searching inventory database', subLabel: 'Running AI fuzzy product matching' },
  { id: 'done', label: 'Analysis complete', subLabel: 'Ready for review' },
] as const;

type StepId = typeof STEPS[number]['id'];

const stepOrder: StepId[] = ['uploading', 'extracting', 'matching', 'done'];

function getStepStatus(stepId: StepId, currentStep: ProcessingStep): 'done' | 'active' | 'pending' | 'error' {
  if (currentStep === 'error') return 'error';
  const stepIdx = stepOrder.indexOf(stepId);
  const currentIdx = stepOrder.indexOf(currentStep as StepId);
  if (currentIdx === -1) return 'pending';
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

export function ProcessingAnimation({ step, message }: ProcessingAnimationProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (step === 'done' || step === 'error') return;
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);
    return () => clearInterval(interval);
  }, [step]);

  return (
    <div className="w-full max-w-md mx-auto space-y-8 py-6">
      {/* AI Brain animation */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(139,92,246,0.2))',
              boxShadow: step !== 'done' && step !== 'error' ? '0 0 40px rgba(56,189,248,0.3)' : 'none',
              animation: step !== 'done' && step !== 'error' ? 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' : 'none',
            }}
          >
            {step === 'error' ? (
              <XCircle className="h-10 w-10 text-red-400" />
            ) : step === 'done' ? (
              <CheckCircle className="h-10 w-10 text-emerald-400" />
            ) : (
              <Bot className="h-10 w-10 text-sky-400" />
            )}
          </div>
          {step !== 'done' && step !== 'error' && (
            <div className="absolute inset-0 rounded-2xl"
              style={{
                background: 'radial-gradient(circle, rgba(56,189,248,0.4), transparent)',
                animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
                opacity: 0.4,
              }}
            />
          )}
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-foreground">
            {step === 'done' ? '✅ Analysis Complete' : step === 'error' ? '❌ Processing Failed' : `AI Processing${dots}`}
          </p>
          <p className="text-xs text-muted-foreground">{message}</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="space-y-3">
        {STEPS.map((s) => {
          const status = getStepStatus(s.id, step);
          return (
            <div key={s.id} className={`flex items-start gap-3 rounded-xl px-4 py-3 transition-all duration-500
              ${status === 'active' ? 'bg-sky-500/10 border border-sky-500/20' : 'bg-card/40 border border-transparent'}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {status === 'done' ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : status === 'active' ? (
                  <Loader2 className="h-4 w-4 text-sky-400 animate-spin" />
                ) : status === 'error' ? (
                  <XCircle className="h-4 w-4 text-red-400" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/40" />
                )}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-semibold transition-colors duration-300
                  ${status === 'done' ? 'text-emerald-400' : status === 'active' ? 'text-sky-400' : 'text-muted-foreground/50'}`}>
                  {s.label}
                </p>
                <p className={`text-[10px] transition-colors duration-300
                  ${status === 'active' ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
                  {s.subLabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom note */}
      {step !== 'done' && step !== 'error' && (
        <p className="text-center text-[10px] text-muted-foreground/50">
          Powered by Gemini 2.0 Flash Vision · Please wait
        </p>
      )}
    </div>
  );
}
