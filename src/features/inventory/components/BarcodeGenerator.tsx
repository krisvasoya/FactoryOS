'use client';

import React from 'react';
import { QrCode } from 'lucide-react';

export function BarcodeGenerator() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <QrCode className="h-4 w-4 text-sky-400" /> Barcode/QR Tag Generator
      </h3>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Select any database catalog SKU to visualize a high-fidelity scannable asset tag.
      </p>

      <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 flex flex-col items-center justify-center space-y-3 shadow-inner">
        <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
          FactoryOS Asset Tag
        </div>
        {/* Mock Barcode display */}
        <div className="h-10 w-full bg-white flex items-center justify-around px-2 py-1 relative overflow-hidden rounded">
          <div className="flex gap-[2px] items-stretch h-full w-full justify-center">
            {[1, 3, 1, 2, 4, 1, 2, 1, 3, 1, 4, 2, 1, 2, 1, 3, 1, 2, 4, 1, 2, 1].map((w, idx) => (
              <div
                key={idx}
                className="bg-black"
                style={{ width: `${w * 2}px` }}
              />
            ))}
          </div>
        </div>
        <div className="font-mono text-xs text-white tracking-widest">
          *FG-SMT-T1*
        </div>
        <div className="text-[9px] text-slate-500">
          Auto-generated. Attach tag to finished assembly box.
        </div>
      </div>
    </div>
  );
}
