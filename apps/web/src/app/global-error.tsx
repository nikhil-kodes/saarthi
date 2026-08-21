'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, RefreshCw, Home, ShieldAlert } from 'lucide-react';
import '@/styles/fonts.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Critical Global Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#ededed] font-['Inter',sans-serif] selection:bg-[#ef4d23]/20 selection:text-[#ef4d23] flex items-center justify-center p-4 antialiased">
        <div className="relative w-full max-w-lg bg-white rounded-3xl border border-neutral-300 p-8 sm:p-10 shadow-lg text-center space-y-6 overflow-hidden">
          {/* Top Decorative Banner */}
          <div className="flex items-center justify-center gap-2.5 mx-auto">
            <div className="w-12 h-12 relative overflow-hidden rounded-2xl bg-transparent flex items-center justify-center">
              <img src="/logo.png" alt="Saarthi Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-[20px] font-extrabold text-neutral-900 tracking-tight">Saarthi</span>
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 font-mono text-[11px] font-bold uppercase tracking-wider border border-red-200 inline-block">
              // CRITICAL_SYSTEM_EXCEPTION
            </span>
            <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">
              Application{' '}
              <span
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: 'italic',
                  fontWeight: 400,
                }}
              >
                Interrupted
              </span>
            </h1>
            <p className="text-[14px] text-neutral-600 leading-relaxed max-w-sm mx-auto">
              An unexpected runtime error halted the interface. Statutory telemetry has captured this incident.
            </p>
          </div>

          {/* Incident Digest */}
          <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 font-mono text-[11px] text-neutral-500 space-y-1 text-left">
            <div className="flex items-center justify-between text-neutral-700 font-semibold">
              <span>Telemetry Code:</span>
              <span className="text-[#ef4d23]">{error.digest || 'ERR_INTERNAL_500'}</span>
            </div>
            <p className="truncate text-neutral-400">
              {error.message || 'Unknown execution failure.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#0b0f1a] hover:bg-[#182238] active:scale-[0.98] text-white text-[13px] font-semibold transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Interface</span>
            </button>

            <a
              href="/en"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#f5f2ee] hover:bg-neutral-200 text-neutral-800 text-[13px] font-semibold border border-neutral-300/80 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
