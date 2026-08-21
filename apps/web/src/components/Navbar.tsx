'use client';

import React, { useState } from 'react';
import { ChevronRight, Globe, Menu, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';

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

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isHi = locale === 'hi';
  const otherLocale = isHi ? 'en' : 'hi';

  return (
    <header className="flex justify-center pt-4 sm:pt-6 px-3 sm:px-6 relative z-30 w-full">
      <nav className="bg-white/95 backdrop-blur-md rounded-full shadow-sm border border-neutral-200/90 px-4 sm:px-6 py-2.5 w-full max-w-[1080px] relative flex items-center justify-between transition-all">
        {/* Left: Saarthi Logo & Wordmark */}
        <Link href="/" className="flex items-center gap-3 group">
          <SaarthiLogo className="w-8 h-8 sm:w-9 sm:h-9 group-hover:scale-105 transition-transform" />
          <div className="flex flex-col text-left">
            <span className="text-[16px] font-extrabold text-neutral-900 leading-none tracking-tight">
              {isHi ? 'सारथी' : 'Saarthi'}
            </span>
            <span className="text-[10px] text-neutral-400 font-medium tracking-wide">
              {isHi ? 'अनुपालन OS' : 'Compliance OS'}
            </span>
          </div>
        </Link>

        {/* Center: Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-7 xl:gap-8 text-[14px] font-medium text-neutral-600">
          <a href="#features" className="hover:text-[#ef4d23] transition-colors py-1">
            {isHi ? 'अनुपालन कैलेंडर' : 'Compliance'}
          </a>
          <a href="#notice-demo" className="hover:text-[#ef4d23] transition-colors py-1">
            {isHi ? 'नोटिस OCR' : 'Notice OCR'}
          </a>
          <a href="#score-simulator" className="hover:text-[#ef4d23] transition-colors py-1">
            {isHi ? 'स्वास्थ्य स्कोर' : 'Health Score'}
          </a>
          <a href="#schemes" className="hover:text-[#ef4d23] transition-colors py-1">
            {isHi ? 'सब्सिडी व योजनाएं' : 'Subsidies'}
          </a>
          <a href="#pricing" className="hover:text-[#ef4d23] transition-colors py-1">
            {isHi ? 'मूल्य निर्धारण' : 'Pricing'}
          </a>
        </div>

        {/* Right Cluster */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Language Switcher */}
          <Link
            href="/"
            locale={otherLocale}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f2ee] text-[12px] font-semibold text-neutral-700 hover:text-neutral-900 border border-neutral-200/60 hover:border-neutral-300 transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-[#ef4d23]" />
            <span>{isHi ? 'English' : 'हिंदी'}</span>
          </Link>

          {/* Sign In Link */}
          <Link
            href="/login"
            className="hidden sm:inline-flex text-[14px] font-semibold text-neutral-700 hover:text-neutral-900 px-3 py-1.5 transition-colors"
          >
            {isHi ? 'साइन इन' : 'Sign In'}
          </Link>

          {/* Primary Action Button */}
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-[#ef4d23] hover:bg-[#df4118] active:scale-[0.98] text-white rounded-full pl-5 pr-2 py-2 sm:pl-6 sm:pr-2.5 sm:py-2 text-[13px] sm:text-[14px] font-semibold transition-all shadow-sm"
          >
            <span className="hidden sm:inline">{isHi ? 'निःशुल्क शुरू करें' : 'Start Free Trial'}</span>
            <span className="sm:hidden">{isHi ? 'शुरू करें' : 'Start Free'}</span>
            <span className="w-6 h-6 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <ChevronRight className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            </span>
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label="Toggle Navigation"
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown panel */}
        {open && (
          <div className="absolute top-full left-2 right-2 mt-2 bg-white rounded-2xl shadow-xl border border-neutral-200 p-4 z-50 flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
            <a
              href="#features"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-xl text-[14px] font-medium text-neutral-800 hover:bg-neutral-50"
            >
              {isHi ? 'अनुपालन कैलेंडर' : 'Compliance Calendar'}
            </a>
            <a
              href="#notice-demo"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-xl text-[14px] font-medium text-neutral-800 hover:bg-neutral-50"
            >
              {isHi ? 'नोटिस OCR सुरक्षा' : 'Notice OCR Defense'}
            </a>
            <a
              href="#score-simulator"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-xl text-[14px] font-medium text-neutral-800 hover:bg-neutral-50"
            >
              {isHi ? 'स्वास्थ्य स्कोर सिम्युलेटर' : 'Health Score Simulator'}
            </a>
            <a
              href="#schemes"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-xl text-[14px] font-medium text-neutral-800 hover:bg-neutral-50"
            >
              {isHi ? 'सरकारी योजनाएं एवं सब्सिडी' : 'Government Subsidies'}
            </a>
            <a
              href="#pricing"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-xl text-[14px] font-medium text-neutral-800 hover:bg-neutral-50"
            >
              {isHi ? 'मूल्य निर्धारण योजनाएं' : 'Pricing Plans'}
            </a>

            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
              <Link
                href="/"
                locale={otherLocale}
                className="px-3 py-1.5 rounded-lg bg-neutral-50 text-[12px] font-semibold text-neutral-700"
              >
                {isHi ? 'Switch to English' : 'हिंदी में बदलें'}
              </Link>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-[13px] font-semibold text-neutral-900 hover:underline"
              >
                {isHi ? 'साइन इन' : 'Sign In'}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
