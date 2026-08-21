'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { FileQuestion, Home, ArrowRight, ShieldCheck, Compass } from 'lucide-react';
import { DotMatrix, GridCross } from '@/components/ui/grid-pattern';
import { SaarthiLogo } from '@/components/Navbar';

export default function LocalizedNotFoundPage() {
  return (
    <div className="min-h-screen bg-[#ededed] font-['Inter',sans-serif] selection:bg-[#ef4d23]/20 selection:text-[#ef4d23] flex items-center justify-center p-4 relative overflow-hidden">
      <DotMatrix color="rgba(0, 0, 0, 0.05)" spacing={24} dotSize={1.2} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-neutral-300 p-8 sm:p-12 shadow-lg text-center space-y-6 overflow-hidden">
        <GridCross className="top-0 left-0" />
        <GridCross className="top-0 right-0" />
        <GridCross className="bottom-0 left-0" />
        <GridCross className="bottom-0 right-0" />

        {/* Header Branding */}
        <div className="flex items-center justify-center gap-2.5">
          <SaarthiLogo className="w-9 h-9" />
          <span className="text-[19px] font-extrabold text-neutral-900 tracking-tight">Saarthi</span>
        </div>

        <div className="space-y-2">
          <div className="text-[64px] sm:text-[72px] font-mono font-extrabold text-neutral-900 leading-none tracking-tighter">
            404
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Page{' '}
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              Not Found
            </span>
          </h1>
          <p className="text-[14px] text-neutral-600 leading-relaxed max-w-sm mx-auto">
            The compliance module, statutory notice document, or verification token does not exist or has expired.
          </p>
        </div>

        {/* Quick Nav Links */}
        <div className="grid grid-cols-2 gap-2 text-left text-[12px] font-medium pt-2">
          <Link
            href="/dashboard"
            className="p-3 bg-[#f5f2ee] rounded-xl border border-neutral-200/80 hover:border-[#ef4d23] text-neutral-800 transition-colors flex items-center justify-between"
          >
            <span>Dashboard Hub</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#ef4d23]" />
          </Link>
          <Link
            href="/compliance"
            className="p-3 bg-[#f5f2ee] rounded-xl border border-neutral-200/80 hover:border-[#ef4d23] text-neutral-800 transition-colors flex items-center justify-between"
          >
            <span>Calendar</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#ef4d23]" />
          </Link>
          <Link
            href="/notices"
            className="p-3 bg-[#f5f2ee] rounded-xl border border-neutral-200/80 hover:border-[#ef4d23] text-neutral-800 transition-colors flex items-center justify-between"
          >
            <span>Notice OCR</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#ef4d23]" />
          </Link>
          <Link
            href="/score"
            className="p-3 bg-[#f5f2ee] rounded-xl border border-neutral-200/80 hover:border-[#ef4d23] text-neutral-800 transition-colors flex items-center justify-between"
          >
            <span>Health Score</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#ef4d23]" />
          </Link>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-[#0b0f1a] hover:bg-[#182238] active:scale-[0.98] text-white rounded-full px-7 py-3 text-[14px] font-semibold transition-all shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
