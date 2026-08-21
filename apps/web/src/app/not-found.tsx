'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Compass, ArrowRight, ShieldCheck } from 'lucide-react';
import '@/styles/fonts.css';

export function SaarthiLogo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-xl bg-transparent flex items-center justify-center ${className}`}>
      <img
        src="/logo.png"
        alt="Saarthi Logo"
        className="w-full h-full object-contain drop-shadow-xs"
      />
    </div>
  );
}

export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#ededed] font-['Inter',sans-serif] selection:bg-[#ef4d23]/20 selection:text-[#ef4d23] flex items-center justify-center p-4 antialiased">
        <div className="relative w-full max-w-lg bg-white rounded-3xl border border-neutral-300 p-8 sm:p-12 shadow-lg text-center space-y-6 overflow-hidden">
          {/* Header Icon */}
          <div className="flex items-center justify-center gap-3">
            <SaarthiLogo className="w-10 h-10" />
            <span className="text-[20px] font-extrabold text-neutral-900 tracking-tight">Saarthi</span>
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
              The compliance route, statutory filing, or token link you are attempting to reach does not exist or has been relocated.
            </p>
          </div>

          {/* Quick Nav Links */}
          <div className="grid grid-cols-2 gap-2 text-left text-[12px] font-medium pt-2">
            <Link
              href="/en/compliance"
              className="p-3 bg-[#f5f2ee] rounded-xl border border-neutral-200/80 hover:border-[#ef4d23] text-neutral-800 transition-colors flex items-center justify-between"
            >
              <span>Compliance Calendar</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#ef4d23]" />
            </Link>
            <Link
              href="/en/notices"
              className="p-3 bg-[#f5f2ee] rounded-xl border border-neutral-200/80 hover:border-[#ef4d23] text-neutral-800 transition-colors flex items-center justify-between"
            >
              <span>Notice OCR</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#ef4d23]" />
            </Link>
            <Link
              href="/en/score"
              className="p-3 bg-[#f5f2ee] rounded-xl border border-neutral-200/80 hover:border-[#ef4d23] text-neutral-800 transition-colors flex items-center justify-between"
            >
              <span>Health Score</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#ef4d23]" />
            </Link>
            <Link
              href="/en/schemes"
              className="p-3 bg-[#f5f2ee] rounded-xl border border-neutral-200/80 hover:border-[#ef4d23] text-neutral-800 transition-colors flex items-center justify-between"
            >
              <span>MSME Subsidies</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#ef4d23]" />
            </Link>
          </div>

          {/* Primary Home Action */}
          <div className="pt-2">
            <Link
              href="/en"
              className="inline-flex items-center gap-2 bg-[#0b0f1a] hover:bg-[#182238] active:scale-[0.98] text-white rounded-full px-7 py-3 text-[14px] font-semibold transition-all shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
