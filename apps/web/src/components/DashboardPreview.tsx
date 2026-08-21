'use client';

import React, { useState } from 'react';
import Gauge from './Gauge';
import { TrendingUp, CheckCircle, ChevronDown, ShieldCheck } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';

export default function DashboardPreview() {
  const [tab1, setTab1] = useState<'overview' | 'pillars'>('overview');
  const [tab3, setTab3] = useState<'subsidy' | 'notice'>('subsidy');
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isHi = locale === 'hi';

  return (
    <div className="px-3 sm:px-4 w-full">
      <div className="bg-[#f5f2ee] rounded-3xl p-4 sm:p-6 w-full max-w-[880px] mx-auto shadow-sm border border-neutral-200/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-left">
          {/* Card 1 — Compliance Health Score */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200/80 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold text-[#ef4d23]">
                  {isHi ? 'स्वास्थ्य स्कोर' : 'Health Score'}
                </span>
                <span className="text-neutral-500 font-medium">
                  {isHi ? 'इस माह' : 'This Month'}
                </span>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[28px] font-semibold text-neutral-900 leading-none font-mono">
                    742
                  </span>
                  <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-[11px] font-semibold font-mono border border-emerald-200/60">
                    <TrendingUp className="w-3 h-3" />
                    <span>+45 pts (AAA)</span>
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 font-medium">
                  {isHi ? 'शीर्ष 5% स्थिति · प्रमुख विश्वास' : 'Top 5% Quartile · Prime Trust'}
                </p>
              </div>

              <div className="pt-2 text-center space-y-1">
                <p className="text-[12px] font-medium text-neutral-700">
                  {isHi ? 'लगातार 12 समय पर दाखिल रिटर्न' : '12 on-time filings in a row'}
                </p>
                <Gauge
                  value={82}
                  color="#ef4d23"
                  showLabels={true}
                  min="300"
                  max="900"
                />
              </div>
            </div>

            {/* Toggle Pill */}
            <div className="bg-neutral-100 rounded-full p-1 flex text-[12px] font-medium">
              <button
                type="button"
                onClick={() => setTab1('overview')}
                className={`flex-1 py-1.5 rounded-full text-center transition-all ${
                  tab1 === 'overview'
                    ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {isHi ? 'अवलोकन' : 'Overview'}
              </button>
              <button
                type="button"
                onClick={() => setTab1('pillars')}
                className={`flex-1 py-1.5 rounded-full text-center transition-all ${
                  tab1 === 'pillars'
                    ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {isHi ? '5 स्तंभ' : '5 Pillars'}
              </button>
            </div>
          </div>

          {/* Card 2 — Statutory Filing Obligations */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200/80 flex flex-col justify-between gap-3">
            <div className="space-y-3">
              {/* Dropdown 1 */}
              <div className="space-y-1">
                <label className="text-[12px] font-medium text-neutral-700 block">
                  {isHi ? 'सक्रिय क्षेत्राधिकार' : 'Active Jurisdiction'}
                </label>
                <button
                  type="button"
                  className="w-full flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-2 text-[13px] text-neutral-800 bg-white hover:bg-neutral-50 transition-colors"
                >
                  <span className="truncate">
                    {isHi ? 'उत्तर प्रदेश (केंद्रीय + राज्य)' : 'Uttar Pradesh (Central + State)'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500 shrink-0 ml-1" />
                </button>
              </div>

              {/* Dropdown 2 */}
              <div className="space-y-1">
                <label className="text-[12px] font-medium text-neutral-700 block">
                  {isHi ? 'आगामी समय-सीमा' : 'Next Filing Deadline'}
                </label>
                <div className="w-full flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-2 text-[13px] text-neutral-800 bg-neutral-50">
                  <span className="font-mono font-semibold text-neutral-900">
                    {isHi ? 'GSTR-3B (4 दिन शेष)' : 'GSTR-3B (Due in 4 Days)'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                    {isHi ? 'अति आवश्यक' : 'Urgent'}
                  </span>
                </div>
              </div>

              {/* Stat Rows */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200/60">
                  <span className="text-[10px] text-neutral-400 block font-medium">
                    {isHi ? 'समय पर रिटर्न' : 'On-Time Returns'}
                  </span>
                  <span className="text-[13px] font-mono font-bold text-neutral-900">
                    {isHi ? '12 / 12 दाखिल' : '12 / 12 Filed'}
                  </span>
                </div>
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200/60">
                  <span className="text-[10px] text-neutral-400 block font-medium">
                    {isHi ? 'बचत लेट फीस' : 'Late Fees Saved'}
                  </span>
                  <span className="text-[13px] font-mono font-bold text-emerald-700">₹48,500</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
              <Link
                href="/compliance"
                className="bg-[#ef4d23] hover:bg-[#df4118] text-white text-[13px] font-semibold rounded-lg px-4 py-2 transition-colors shadow-sm"
              >
                {isHi ? 'रिटर्न दाखिल करें' : 'File Return'}
              </Link>
              <Link
                href="/notices"
                className="text-[13px] text-neutral-600 underline hover:text-neutral-900 font-medium"
              >
                {isHi ? 'दस्तावेज़ जांचें' : 'Verify Docs'}
              </Link>
              <span className="ml-auto text-emerald-600" title="All systems verified">
                <ShieldCheck className="w-5 h-5" />
              </span>
            </div>
          </div>

          {/* Card 3 — UP MSME Subsidy & Notice Defense */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200/80 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold text-[#ef4d23]">
                  {isHi ? 'UP MSME सब्सिडी' : 'UP MSME Subsidy'}
                </span>
                <span className="text-neutral-500 font-medium">
                  {isHi ? 'स्वतः मिलान' : 'Auto-Matched'}
                </span>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[28px] font-semibold text-neutral-900 leading-none font-mono">
                    {isHi ? '₹25 लाख' : '₹25 Lakh'}
                  </span>
                  <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-[11px] font-semibold font-mono border border-emerald-200/60">
                    <CheckCircle className="w-3 h-3" />
                    <span>{isHi ? '25% अनुदान' : '25% Grant'}</span>
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 font-medium">
                  {isHi ? 'UP MSME पूंजी निवेश नीति' : 'UP MSME Capital Investment Policy'}
                </p>
              </div>

              <div className="pt-2 text-center space-y-1">
                <p className="text-[12px] font-medium text-neutral-700">
                  {isHi ? 'आवेदन तैयारी' : 'Application Readiness'}
                </p>
                <Gauge
                  value={68}
                  color="#9ca3af"
                  showLabels={true}
                  min="0%"
                  max="100%"
                />
              </div>
            </div>

            {/* Toggle Pill */}
            <div className="bg-neutral-100 rounded-full p-1 flex text-[12px] font-medium">
              <button
                type="button"
                onClick={() => setTab3('subsidy')}
                className={`flex-1 py-1.5 rounded-full text-center transition-all ${
                  tab3 === 'subsidy'
                    ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {isHi ? 'सब्सिडी मिलान' : 'Subsidy Match'}
              </button>
              <button
                type="button"
                onClick={() => setTab3('notice')}
                className={`flex-1 py-1.5 rounded-full text-center transition-all ${
                  tab3 === 'notice'
                    ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {isHi ? 'नोटिस OCR' : 'Notice OCR'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
