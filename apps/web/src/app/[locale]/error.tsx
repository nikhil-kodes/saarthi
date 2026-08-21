'use client';

import React, { useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { AlertOctagon, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { DotMatrix, GridCross } from '@/components/ui/grid-pattern';

export default function LocalizedErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Handled Page Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#ededed] font-['Inter',sans-serif] selection:bg-[#ef4d23]/20 selection:text-[#ef4d23] flex items-center justify-center p-4 relative overflow-hidden">
      <DotMatrix color="rgba(0, 0, 0, 0.05)" spacing={24} dotSize={1.2} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-neutral-300 p-8 sm:p-10 shadow-lg text-center space-y-6 overflow-hidden">
        <GridCross className="top-0 left-0" />
        <GridCross className="top-0 right-0" />
        <GridCross className="bottom-0 left-0" />
        <GridCross className="bottom-0 right-0" />

        <div className="w-14 h-14 rounded-2xl bg-[#f5f2ee] text-[#ef4d23] border border-neutral-200 flex items-center justify-center mx-auto shadow-sm">
          <AlertOctagon className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-[#ef4d23]/10 text-[#ef4d23] font-mono text-[11px] font-bold uppercase tracking-wider inline-block">
            // RUNTIME_EXCEPTION
          </span>
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">
            Something went{' '}
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              wrong
            </span>
          </h1>
          <p className="text-[14px] text-neutral-600 leading-relaxed max-w-sm mx-auto">
            An unexpected error occurred while executing this compliance procedure. Our automated audit logs have recorded this state.
          </p>
        </div>

        {error.digest && (
          <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 font-mono text-[11px] text-neutral-500 flex items-center justify-between">
            <span className="font-semibold text-neutral-700">Digest Hash:</span>
            <span className="text-[#ef4d23]">{error.digest}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#0b0f1a] hover:bg-[#182238] active:scale-[0.98] text-white text-[13px] font-semibold transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#f5f2ee] hover:bg-neutral-200 text-neutral-800 text-[13px] font-semibold border border-neutral-300/80 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
