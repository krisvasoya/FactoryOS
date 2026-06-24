'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full border border-border bg-card rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto text-lg font-bold">
            ⚠️
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold">Application Error</h2>
            <p className="text-xs text-muted-foreground leading-normal">
              An unexpected error occurred. Details: {error.message || 'System error'}
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="h-9 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition-colors"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
