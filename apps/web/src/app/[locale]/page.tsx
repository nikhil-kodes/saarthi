'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import DashboardPreview from '@/components/DashboardPreview';
import Gauge from '@/components/Gauge';
import { DotMatrix, GridCross, GhostGridSection } from '@/components/ui/grid-pattern';
import { GsapTiltCard, GsapCounter } from '@/components/ui/gsap-motion';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import {
  ChevronRight,
  FileText,
  Activity,
  Landmark,
  Store,
  Video,
  ShieldCheck,
  Calendar,
  Check,
} from 'lucide-react';

export default function LandingPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isHi = locale === 'hi';

  // Interactive Simulator State
  const [onTimeFiling, setOnTimeFiling] = useState(true);
  const [cleanNotices, setCleanNotices] = useState(true);
  const [gstinVerified, setGstinVerified] = useState(true);
  const [vendorEscrow, setVendorEscrow] = useState(true);

  const simulatedScore =
    300 +
    (onTimeFiling ? 280 : 80) +
    (cleanNotices ? 160 : 40) +
    (gstinVerified ? 90 : 20) +
    (vendorEscrow ? 90 : 20);

  const simulatedPercentage = Math.round((simulatedScore / 900) * 100);

  return (
    <div className="min-h-screen w-full bg-[#ededed] font-['Inter',sans-serif] selection:bg-[#ef4d23]/20 selection:text-[#ef4d23] overflow-x-hidden relative">
      {/* Global Background Dot Matrix Pattern */}
      <DotMatrix color="rgba(0, 0, 0, 0.05)" spacing={24} dotSize={1.15} />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO SECTION (Full-Viewport with Background Video)             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="p-2.5 sm:p-4">
        <section className="relative w-full min-h-[calc(100vh-20px)] sm:min-h-[calc(100vh-32px)] overflow-hidden bg-[#d9d9d9] rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-sm border border-neutral-300/80">
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disableRemotePlayback
            // @ts-ignore
            webkit-playsinline="true"
            x5-playsinline="true"
            poster="https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=60"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4"
              type="video/mp4"
            />
          </video>

          {/* Above the video: white overlay */}
          <div className="absolute inset-0 bg-white/10 pointer-events-none" />

          {/* Foreground content wrapper */}
          <div className="relative z-10 flex flex-col h-full justify-between">
            {/* Floating Pill Navbar */}
            <Navbar />

            {/* Hero Content (centered) */}
            <div className="flex flex-col items-center px-4 pt-6 sm:pt-10 pb-6 text-center max-w-5xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-full px-4 py-1.5 shadow-sm text-[13px] font-medium text-neutral-800 border border-neutral-200/90">
                <span className="w-2 h-2 rounded-full bg-[#ef4d23]" />
                <span className="font-mono text-[12px] font-semibold text-neutral-700">
                  {isHi
                    ? 'सारथी ट्रस्ट प्रोटोकॉल · केंद्रीय व UP राज्य अधिनियम'
                    : 'Saarthi Trust Protocol · Central & UP Acts'}
                </span>
              </div>

              {/* Headline */}
              <h1
                className="mt-4 sm:mt-5 text-neutral-900"
                style={{
                  fontSize: 'clamp(34px, 7.5vw, 68px)',
                  lineHeight: 1.1,
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                }}
              >
                {isHi ? (
                  <>
                    अनुपालन,{' '}
                    <span
                      style={{
                        fontFamily: "'Instrument Serif', serif",
                        fontStyle: 'italic',
                        fontWeight: 400,
                      }}
                    >
                      अब आसान।
                    </span>
                    <br />
                    व्यापार में विश्वास, अब पक्का।
                  </>
                ) : (
                  <>
                    Compliance,{' '}
                    <span
                      style={{
                        fontFamily: "'Instrument Serif', serif",
                        fontStyle: 'italic',
                        fontWeight: 400,
                      }}
                    >
                      handled.
                    </span>
                    <br />
                    Trust, unlocked.
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p
                className="mt-3 sm:mt-4 text-neutral-700 px-2 max-w-2xl text-center"
                style={{
                  fontSize: 'clamp(13px, 3.5vw, 16px)',
                }}
              >
                {isHi
                  ? 'भारतीय MSME के लिए ऑल-इन-वन AI अनुपालन, नोटिस सुरक्षा और व्यापार विकास ऑपरेटिंग सिस्टम।'
                  : 'The All-In-One AI Compliance, Notice Defense & Business Enablement Operating System for Indian MSMEs.'}
              </p>

              {/* CTA Buttons */}
              <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-3 bg-[#0b0f1a] hover:bg-[#182238] active:scale-[0.98] text-white rounded-full pl-6 sm:pl-7 pr-2 py-2 sm:py-2.5 text-[14px] font-semibold transition-all shadow-md group"
                >
                  <span>{isHi ? 'निःशुल्क शुरू करें' : 'Start Free Trial'}</span>
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                    <ChevronRight className="w-4 h-4 text-white stroke-[2.5]" />
                  </span>
                </Link>

                <a
                  href="#notice-demo"
                  className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-neutral-800 rounded-full px-5 py-2 sm:py-2.5 text-[13px] font-semibold border border-neutral-200/80 shadow-sm transition-all"
                >
                  <FileText className="w-4 h-4 text-[#ef4d23]" />
                  <span>{isHi ? 'नोटिस OCR डेमो देखें' : 'Notice OCR Demo'}</span>
                </a>
              </div>
            </div>

            {/* Dashboard Preview Tray (bleeding off the bottom edge) */}
            <div className="pt-2 sm:pt-4">
              <DashboardPreview />
            </div>
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 2. END-TO-END GHOST GRID SECTION: STATUTORY METRICS STRIP        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <GhostGridSection
        id="metrics"
        label={isHi ? 'वैधानिक टेलीमेट्री' : 'Statutory Telemetry'}
        tag="GRID.01_METRICS"
      >
        <div className="text-center mb-8 space-y-2">
          <p className="text-[12px] font-bold uppercase tracking-widest text-[#ef4d23] font-mono">
            {isHi ? '// संस्थागत विश्वास व ऑडिट रिकॉर्ड' : '// STATUTORY SCALE & AUDIT TRAIL'}
          </p>
          <h2 className="text-2xl sm:text-4xl font-semibold text-neutral-900 tracking-tight">
            {isHi
              ? 'भारतीय MSMEs के लिए संस्थागत विश्वास प्रोटोकॉल'
              : 'Institutional Trust Protocol for Indian MSMEs'}
          </h2>
        </div>

        {/* Ghost Grid Partition Box with Dotted Dividers */}
        <div className="relative border border-dashed border-neutral-300 bg-white rounded-2xl overflow-hidden shadow-sm">
          <GridCross className="top-0 left-0" />
          <GridCross className="top-0 right-0" />
          <GridCross className="bottom-0 left-0" />
          <GridCross className="bottom-0 right-0" />

          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-dashed divide-neutral-300">
            {[
              {
                num: 63,
                suffix: 'M+',
                label: isHi ? 'संबोधित भारतीय MSMEs' : 'Indian MSMEs Addressable',
                change: isHi ? 'केंद्रीय व राज्य दायरा' : 'Central & State Scope',
              },
              {
                num: 47,
                suffix: '+',
                label: isHi ? 'सक्रिय वैधानिक अधिनियम' : 'Statutory Acts Covered',
                change: isHi ? 'GST, आयकर, श्रम, FSSAI' : 'GST, Income Tax, Labour, FSSAI',
              },
              {
                num: 742,
                suffix: ' pts',
                label: isHi ? 'औसत विश्वास रेटिंग' : 'Average Trust Rating',
                change: isHi ? 'AAA प्राइम ग्रेड' : 'AAA Prime Grade',
              },
              {
                num: 25,
                suffix: '%',
                label: isHi ? 'पूंजीगत सब्सिडी मिलान' : 'Capital Subsidy Match',
                change: isHi ? 'UP MSME नीति 2026' : 'UP MSME Policy 2026',
              },
            ].map((stat, i) => (
              <div key={i} className="p-6 sm:p-8 text-left space-y-1 relative group hover:bg-[#f5f2ee]/50 transition-colors">
                <span className="text-[28px] sm:text-[38px] font-bold text-neutral-900 font-mono tracking-tight block">
                  <GsapCounter value={stat.num} suffix={stat.suffix} />
                </span>
                <p className="text-[13px] font-semibold text-neutral-800">{stat.label}</p>
                <p className="text-[11px] font-mono text-[#ef4d23] font-medium">{stat.change}</p>
              </div>
            ))}
          </div>
        </div>
      </GhostGridSection>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 3. END-TO-END GHOST GRID SECTION: BENTO FEATURE GRID              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <GhostGridSection
        id="features"
        label={isHi ? 'मंच वास्तुकला' : 'Platform Architecture'}
        tag="GRID.02_MODULES"
      >
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-10">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#ef4d23]/10 text-[#ef4d23] font-bold text-[12px] uppercase tracking-wider font-mono">
            {isHi ? 'एकीकृत अनुपालन वास्तुकला' : 'Unified Compliance Architecture'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-semibold text-neutral-900 tracking-tight">
            {isHi
              ? 'आपके व्यापार को सुरक्षित व सफल बनाने के सभी साधन'
              : 'Every capability your enterprise needs to thrive'}
          </h2>
          <p className="text-[15px] text-neutral-600 max-w-xl mx-auto">
            {isHi
              ? 'स्वचालित नियामक कैलेंडर और नोटिस OCR से लेकर एस्क्रो-सुरक्षित B2B मार्केटप्लेस तक।'
              : 'From automated regulatory calendars and statutory notice OCR to escrow-protected marketplaces.'}
          </p>
        </div>

        {/* Bento Grid with Intersecting Ghost Lines */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Calendar,
              idx: '01',
              title: isHi ? 'स्वचालित वैधानिक कैलेंडर' : 'Automated Statutory Calendar',
              desc: isHi
                ? 'कॉर्पोरेट टैक्स, श्रम निरीक्षक और राज्य रिटर्न की कोई समय-सीमा न चूकें। स्वचालित जुर्माना गणना व चालान रसीद प्रबंधन।'
                : 'Never miss a filing deadline across corporate tax, labour inspectorate, and state returns with automatic penalty accrual tracking.',
              badge: isHi ? '47 अधिनियम' : '47 Acts Tracked',
            },
            {
              icon: FileText,
              idx: '02',
              title: isHi ? 'वैधानिक नोटिस OCR एवं सुरक्षा' : 'Statutory Notice OCR & Defense',
              desc: isHi
                ? 'GST DRC-01A, धारा 148A नोटिस अपलोड करें। 3-चरणीय सरल विवरण और तुरंत औपचारिक कानूनी उत्तर पत्र पाएं।'
                : 'Upload complex legal notices (DRC-01A, Sec 148A, SCN). Receive instant 3-part plain explanations and pre-filled formal reply letters.',
              badge: isHi ? '30s कानूनी सुरक्षा' : '30s Defense',
            },
            {
              icon: Activity,
              idx: '03',
              title: isHi ? '5-स्तंभीय स्वास्थ्य स्कोर' : '5-Pillar Health Score',
              desc: isHi
                ? '300–900 का निष्पक्ष विश्वास स्कोर जो आपके रिटर्न इतिहास, सत्यापन और वित्तीय अनुशासन का मूल्यांकन करता है।'
                : 'Objective 300–900 trust rating evaluating on-time filings, clean notice history, verified registrations, and financial discipline.',
              badge: isHi ? '300-900 पैमाना' : '300-900 Scale',
            },
            {
              icon: Landmark,
              idx: '04',
              title: isHi ? 'सरकारी योजनाएं एवं सब्सिडी' : 'Government Schemes & Subsidies',
              desc: isHi
                ? '25% पूंजीगत अनुदान, ब्याज छूट और बिना गारंटी वाले मुद्रा ऋण के लिए अपनी पात्रता 1-क्लिक में जांचें।'
                : 'Match your enterprise against Central & State subsidy policies, 25% capital grants, interest subventions, and collateral-free credit.',
              badge: isHi ? '25% अनुदान मिलान' : '25% Grant Match',
            },
            {
              icon: Store,
              idx: '05',
              title: isHi ? 'B2B सप्लायर मार्केटप्लेस' : 'B2B Supplier Marketplace',
              desc: isHi
                ? 'सत्यापित सप्लायर्स से औद्योगिक पैकेजिंग, कच्चा माल और मशीनरी सीधे खरीदें — एस्क्रो भुगतान सुरक्षा के साथ।'
                : 'Source verified raw materials, industrial packaging, and machinery with compliance-gated RFQs and milestone escrow safety.',
              badge: isHi ? 'एस्क्रो सुरक्षित' : 'Escrow Protected',
            },
            {
              icon: Video,
              idx: '06',
              title: isHi ? 'क्षेत्रीय क्रिएटर मार्केटप्लेस' : 'Vernacular Creator Marketplace',
              desc: isHi
                ? 'भोजपुरी, अवधी व हिंदी में स्थानीय वीडियो क्रिएटर्स से प्रचार करवाएं — अनिवार्य ASCI #Ad अनुपालन के साथ।'
                : 'Hire regional influencers with automated statutory ASCI #Ad disclosure compliance and milestone payment release verification.',
              badge: isHi ? 'ASCI #Ad सत्यापित' : 'ASCI #Ad Verified',
            },
          ].map((card, i) => (
            <GsapTiltCard key={i} maxTilt={6}>
              <div className="relative bg-white rounded-2xl border border-dashed border-neutral-300 p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-[#ef4d23] transition-all flex flex-col justify-between space-y-4 text-left group overflow-hidden h-full">
                <GridCross className="top-0 left-0" />
                <GridCross className="top-0 right-0" />
                <GridCross className="bottom-0 left-0" />
                <GridCross className="bottom-0 right-0" />

                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-[#f5f2ee] flex items-center justify-center text-[#ef4d23] group-hover:bg-[#ef4d23] group-hover:text-white transition-colors">
                      <card.icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-neutral-400">/{card.idx}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#f5f2ee] text-neutral-700 font-semibold text-[11px] border border-neutral-200 font-mono">
                        {card.badge}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-[17px] font-bold text-neutral-900">{card.title}</h3>
                  <p className="text-[13px] text-neutral-600 leading-relaxed">{card.desc}</p>
                </div>

                <div className="pt-2 flex items-center text-[12px] font-semibold text-[#ef4d23] group-hover:translate-x-1 transition-transform relative z-10">
                  <span>{isHi ? 'मॉड्यूल देखें' : 'Explore module'}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </GsapTiltCard>
          ))}
        </div>
      </GhostGridSection>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 4. END-TO-END GHOST GRID SECTION: 5-PILLAR SIMULATOR              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <GhostGridSection
        id="score-simulator"
        label={isHi ? 'इंटरैक्टिव सिमुलेशन' : 'Interactive Simulation'}
        tag="GRID.03_TRUST_SIMULATOR"
      >
        <div className="relative bg-white rounded-3xl border border-dashed border-neutral-300 p-6 sm:p-10 shadow-sm space-y-8 overflow-hidden">
          <GridCross className="top-0 left-0" />
          <GridCross className="top-0 right-0" />
          <GridCross className="bottom-0 left-0" />
          <GridCross className="bottom-0 right-0" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dashed border-neutral-300 pb-6">
            <div className="space-y-1 text-left">
              <span className="px-3 py-1 rounded-full bg-[#ef4d23]/10 text-[#ef4d23] font-bold text-[11px] uppercase tracking-wider inline-block font-mono">
                {isHi ? 'इंटरैक्टिव विश्वास इंजन' : 'Interactive Trust Engine'}
              </span>
              <h2 className="text-2xl font-bold text-neutral-900">
                {isHi ? 'अपना अनुपालन स्वास्थ्य स्कोर सिम्युलेट करें' : 'Simulate Your Compliance Health Score'}
              </h2>
              <p className="text-[13px] text-neutral-500">
                {isHi
                  ? 'वास्तविक समय में स्कोर रेटिंग अपडेट देखने के लिए अनुपालन कारकों को चुनें।'
                  : 'Toggle operational compliance factors to observe real-time rating updates.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[12px] border border-emerald-200 font-mono">
                {isHi ? 'ग्रेड: ' : 'Grade: '}
                {simulatedScore >= 800
                  ? isHi
                    ? 'AAA उत्कृष्ट'
                    : 'AAA Prime'
                  : simulatedScore >= 680
                    ? isHi
                      ? 'AA उत्तम'
                      : 'AA Strong'
                    : isHi
                      ? 'A मध्यम'
                      : 'A Moderate'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Toggles */}
            <div className="lg:col-span-7 space-y-3 text-left">
              {[
                {
                  checked: onTimeFiling,
                  set: setOnTimeFiling,
                  title: isHi
                    ? '100% समय पर रिटर्न (GSTR-3B, GSTR-1, एडवांस टैक्स)'
                    : '100% On-Time Returns (GSTR-3B, GSTR-1, Advance Tax)',
                  desc: isHi
                    ? 'बिना किसी वैधानिक लेट फीस जुर्माने के नियत समय पर दाखिल'
                    : 'Filing before due dates without statutory late fee penalties',
                  pts: '+280 pts',
                },
                {
                  checked: cleanNotices,
                  set: setCleanNotices,
                  title: isHi
                    ? 'शून्य लंबित नोटिस (DRC-01A / SCN)'
                    : 'Zero Unresolved Notices (DRC-01A / SCN)',
                  desc: isHi
                    ? 'वैधानिक अवधि के भीतर औपचारिक व सत्यापित उत्तर पत्र दाखिल'
                    : 'Formal verified reply letters submitted within statutory windows',
                  pts: '+160 pts',
                },
                {
                  checked: gstinVerified,
                  set: setGstinVerified,
                  title: isHi
                    ? 'सत्यापित GSTIN, PAN, उद्यम एवं FSSAI लाइसेंस'
                    : 'Verified GSTIN, PAN, Udyam & FSSAI Licences',
                  desc: isHi
                    ? 'MCA21 एवं GST पोर्टल पर सक्रिय व्यावसायिक स्थिति'
                    : 'Active identity standing on MCA21 & GST Portal',
                  pts: '+90 pts',
                },
                {
                  checked: vendorEscrow,
                  set: setVendorEscrow,
                  title: isHi
                    ? 'B2B एस्क्रो वाणिज्यिक भुगतान इतिहास'
                    : 'B2B Escrow Commercial Settlement History',
                  desc: isHi
                    ? 'MSME विक्रेताओं को समय पर माइलस्टोन भुगतान रिलीज'
                    : 'Timely milestone payment releases to MSME vendors',
                  pts: '+90 pts',
                },
              ].map((item, i) => (
                <label
                  key={i}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                    item.checked
                      ? 'bg-[#f5f2ee] border-neutral-300'
                      : 'bg-neutral-50/50 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.set(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#ef4d23] accent-[#ef4d23] focus:ring-[#ef4d23]"
                  />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-semibold text-neutral-900">{item.title}</span>
                      <span className="text-[12px] font-mono font-bold text-[#ef4d23]">{item.checked ? item.pts : '—'}</span>
                    </div>
                    <p className="text-[12px] text-neutral-500">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Gauge Display */}
            <div className="lg:col-span-5 bg-[#f5f2ee] rounded-2xl p-6 border border-dashed border-neutral-300 text-center space-y-4 shadow-sm relative">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
                {isHi ? 'गणना किया गया विश्वास स्कोर' : 'Calculated Trust Rating'}
              </span>

              <div className="py-2">
                <Gauge
                  value={simulatedPercentage}
                  color="#ef4d23"
                  showLabels={true}
                  min="300"
                  max="900"
                />
              </div>

              <div className="space-y-1">
                <div className="text-[28px] font-mono font-bold text-neutral-900">
                  {simulatedScore} <span className="text-[14px] font-normal text-neutral-500">/ 900</span>
                </div>
                <p className="text-[12px] text-neutral-600 leading-relaxed">
                  {simulatedScore >= 700
                    ? isHi
                      ? '✓ बिना गारंटी वाले बैंक ऋण और ब्याज छूट के लिए पूर्व-योग्य।'
                      : '✓ Pre-qualifies for collateral-free bank credit lines & rate concessions.'
                    : isHi
                      ? '⚠ 700+ स्कोर प्राप्त करने के लिए चिन्हित रिटर्न विसंगतियों को ठीक करें।'
                      : '⚠ Rectify flagged return items to elevate score above 700 points.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </GhostGridSection>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 5. END-TO-END GHOST GRID SECTION: NOTICE OCR DEFENSE DEMO         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <GhostGridSection
        id="notice-demo"
        label={isHi ? 'वैधानिक AI सुरक्षा' : 'Statutory AI Defense'}
        tag="GRID.04_NOTICE_OCR"
      >
        <div className="text-center space-y-2 mb-10">
          <span className="px-3.5 py-1 rounded-full bg-[#ef4d23]/10 text-[#ef4d23] font-bold text-[12px] uppercase tracking-wider inline-block font-mono">
            {isHi ? '30-सेकंड कानूनी सुरक्षा' : '30-Second Legal Defense'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
            {isHi
              ? 'वैधानिक नोटिस विश्लेषण एवं उत्तर पत्र निर्माण'
              : 'Statutory Notice Extraction & Reply Generation'}
          </h2>
          <p className="text-[14px] text-neutral-600 max-w-lg mx-auto">
            {isHi
              ? 'मांग राशि निकालें, कानूनी धाराएं समझें और सेकंडों में औपचारिक कानूनी उत्तर पत्र तैयार करें।'
              : 'Extract demands, cite statutory provisions, and generate formal legal reply letters in seconds.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          {/* Raw Notice Box */}
          <GsapTiltCard maxTilt={5}>
            <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-5 space-y-3 font-mono text-[12px] text-neutral-600 shadow-sm relative overflow-hidden h-full">
              <GridCross className="top-0 left-0" />
              <GridCross className="top-0 right-0" />
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2 text-neutral-900 font-bold font-sans">
                <span>{isHi ? 'मूल नोटिस (GST DRC-01A)' : 'Original Notice (GST DRC-01A)'}</span>
                <span className="text-red-600 text-[11px] px-2 py-0.5 bg-red-50 rounded-md font-mono border border-red-200">
                  {isHi ? 'कर मांग' : 'Tax Demand'}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] leading-relaxed space-y-2 text-neutral-700">
                <p><strong>REF:</strong> ZA0904250012390/UP/GST-ZONE-1</p>
                <p className="italic">
                  &ldquo;Whereas on scrutiny of return filed in Form GSTR-3B vis-à-vis GSTR-1, an unreconciled difference of tax liability has been observed under Section 73(5) read with Rule 142(1A)...&rdquo;
                </p>
                <p className="text-red-600 font-bold font-mono">
                  {isHi ? 'कर मांग: ₹42,500 + धारा 50 ब्याज: ₹7,650' : 'Tax Demand: ₹42,500 + Int. u/s 50: ₹7,650'}
                </p>
              </div>
            </div>
          </GsapTiltCard>

          {/* Plain Breakdown Box */}
          <GsapTiltCard maxTilt={5}>
            <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-5 space-y-3 shadow-sm relative overflow-hidden h-full">
              <GridCross className="top-0 left-0" />
              <GridCross className="top-0 right-0" />
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <span className="font-bold text-neutral-900 text-[14px]">
                  {isHi ? 'सारथी 3-चरणीय सरल विवरण' : 'Saarthi 3-Part Plain Breakdown'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200 font-mono">
                  {isHi ? 'सरल भाषा' : 'Plain Language'}
                </span>
              </div>

              <div className="space-y-2.5 text-[12px]">
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                  <span className="font-bold text-neutral-900 block mb-0.5">
                    {isHi ? '1. क्या हुआ' : '1. What Happened'}
                  </span>
                  <p className="text-neutral-600">
                    {isHi
                      ? 'Q3 FY25 के GSTR-1 आउटवर्ड सप्लाई और GSTR-3B टैक्स भुगतान में विसंगति पाई गई।'
                      : 'Discrepancy detected between GSTR-1 outward supply and GSTR-3B tax payment for Q3 FY25.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-red-50/60 border border-red-200">
                  <span className="font-bold text-red-600 block mb-0.5">
                    {isHi ? '2. देय राशि' : '2. What You Owe'}
                  </span>
                  <p className="text-neutral-700 font-mono font-semibold">
                    {isHi
                      ? '₹42,500 कर मांग + धारा 50 के तहत ₹7,650 ब्याज।'
                      : '₹42,500 tax demand + ₹7,650 interest under Section 50.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
                  <span className="font-bold text-blue-900 block mb-0.5">
                    {isHi ? '3. आवश्यक कार्रवाई' : '3. Action Required'}
                  </span>
                  <p className="text-neutral-700">
                    {isHi
                      ? '7 दिनों के भीतर समाधान विवरण जमा करें या GST DRC-03 के माध्यम से भुगतान करें।'
                      : 'Submit reconciliation table or pay via Form GST DRC-03 within 7 days.'}
                  </p>
                </div>
              </div>
            </div>
          </GsapTiltCard>
        </div>
      </GhostGridSection>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 6. END-TO-END GHOST GRID SECTION: TRANSPARENT PRICING             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <GhostGridSection
        id="pricing"
        label={isHi ? 'सदस्यता योजनाएं' : 'Subscription Tiers'}
        tag="GRID.05_PRICING"
      >
        <div className="text-center space-y-2 mb-10">
          <span className="px-3.5 py-1 rounded-full bg-[#f5f2ee] text-neutral-700 font-bold text-[12px] uppercase tracking-wider inline-block font-mono">
            {isHi ? 'स्पष्ट मूल्य निर्धारण' : 'Transparent Pricing'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-semibold text-neutral-900">
            {isHi ? 'बढ़ते उद्यमों के लिए सरल योजनाएं' : 'Simple plans for growing enterprises'}
          </h2>
          <p className="text-[14px] text-neutral-600">
            {isHi
              ? 'कोई छिपा हुआ कानूनी परामर्श शुल्क नहीं। कभी भी शुरू या अपग्रेड करें।'
              : 'Zero hidden legal retainer charges. Cancel or upgrade anytime.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          {/* Starter */}
          <div className="relative bg-white rounded-3xl border border-dashed border-neutral-300 p-7 space-y-6 flex flex-col justify-between shadow-sm overflow-hidden">
            <GridCross className="top-0 left-0" />
            <GridCross className="top-0 right-0" />
            <GridCross className="bottom-0 left-0" />
            <GridCross className="bottom-0 right-0" />

            <div className="space-y-4">
              <div>
                <h3 className="text-[18px] font-bold text-neutral-900">
                  {isHi ? 'स्टार्टर' : 'Starter'}
                </h3>
                <p className="text-[12px] text-neutral-500">
                  {isHi ? 'सूक्ष्म व्यवसायों एवं दुकानों के लिए' : 'For micro enterprises & shops'}
                </p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[36px] font-mono font-extrabold text-neutral-900">₹0</span>
                <span className="text-[12px] text-neutral-400">{isHi ? '/ सदैव निःशुल्क' : '/ forever'}</span>
              </div>
              <ul className="space-y-2.5 text-[13px] text-neutral-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#ef4d23]" />
                  {isHi ? 'केंद्रीय व राज्य अनुपालन कैलेंडर' : 'Central & State Calendars'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#ef4d23]" />
                  {isHi ? 'WhatsApp रिटर्न रिमाइंडर' : 'WhatsApp Return Reminders'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#ef4d23]" />
                  {isHi ? '5-स्तंभीय हेल्थ स्कोर गेज' : '5-Pillar Health Score Gauge'}
                </li>
              </ul>
            </div>
            <Link
              href="/signup"
              className="w-full text-center py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold text-[13px] transition-colors"
            >
              {isHi ? 'निःशुल्क शुरुआत करें' : 'Get Started Free'}
            </Link>
          </div>

          {/* Pro (Featured) */}
          <div className="bg-[#0b0f1a] text-white rounded-3xl border-2 border-[#ef4d23] p-7 space-y-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#ef4d23] text-white font-bold text-[10px] uppercase tracking-wider font-mono">
              {isHi ? 'सर्वाधिक लोकप्रिय' : 'Most Popular'}
            </span>
            <div className="space-y-4">
              <div>
                <h3 className="text-[18px] font-bold text-white">
                  {isHi ? 'प्रो ऑपरेशन्स' : 'Pro Operations'}
                </h3>
                <p className="text-[12px] text-neutral-400">
                  {isHi ? 'बढ़ते MSMEs एवं विनिर्माताओं के लिए' : 'For growing MSMEs & manufacturers'}
                </p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[36px] font-mono font-extrabold text-white">₹999</span>
                <span className="text-[12px] text-neutral-400">{isHi ? '/ प्रति माह' : '/ month'}</span>
              </div>
              <ul className="space-y-2.5 text-[13px] text-neutral-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#ef4d23]" />
                  {isHi ? 'असीमित नोटिस OCR व उत्तर पत्र' : 'Unlimited Notice OCR & Reply Letters'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#ef4d23]" />
                  {isHi ? 'AI अनुपालन विधिक सहायक' : 'Grounded Compliance AI Copilot'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#ef4d23]" />
                  {isHi ? '25% पूंजीगत सब्सिडी मैचिंग' : '25% Capital Subsidy Matching'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#ef4d23]" />
                  {isHi ? 'B2B सप्लायर मार्केटप्लेस एस्क्रो' : 'B2B Supplier Marketplace Escrow'}
                </li>
              </ul>
            </div>
            <Link
              href="/signup"
              className="w-full text-center py-2.5 rounded-xl bg-[#ef4d23] hover:bg-[#df4118] text-white font-bold text-[13px] transition-colors shadow-sm"
            >
              {isHi ? '14 दिन का ट्रायल शुरू करें' : 'Start 14-Day Free Trial'}
            </Link>
          </div>

          {/* Enterprise */}
          <div className="relative bg-white rounded-3xl border border-dashed border-neutral-300 p-7 space-y-6 flex flex-col justify-between shadow-sm overflow-hidden">
            <GridCross className="top-0 left-0" />
            <GridCross className="top-0 right-0" />
            <GridCross className="bottom-0 left-0" />
            <GridCross className="bottom-0 right-0" />

            <div className="space-y-4">
              <div>
                <h3 className="text-[18px] font-bold text-neutral-900">
                  {isHi ? 'CA एवं एंटरप्राइज' : 'CA & Enterprise'}
                </h3>
                <p className="text-[12px] text-neutral-500">
                  {isHi ? 'CA फर्मों एवं कॉर्पोरेट समूहों के लिए' : 'For CA Firms & Corporate Groups'}
                </p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[36px] font-mono font-extrabold text-neutral-900">₹2,999</span>
                <span className="text-[12px] text-neutral-400">{isHi ? '/ प्रति माह' : '/ month'}</span>
              </div>
              <ul className="space-y-2.5 text-[13px] text-neutral-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#ef4d23]" />
                  {isHi ? 'मल्टी-क्लाइंट CA पोर्टल' : 'Multi-Tenant CA Client Portal'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#ef4d23]" />
                  {isHi ? '1-क्लिक बैंक अनुपालन डॉसियर' : '1-Click Bank Compliance Dossier'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#ef4d23]" />
                  {isHi ? 'क्षेत्रीय क्रिएटर प्रचार अभियान' : 'Vernacular Creator Campaigns'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#ef4d23]" />
                  {isHi ? 'समर्पित अनुपालन अधिकारी' : 'Dedicated Compliance Officer'}
                </li>
              </ul>
            </div>
            <Link
              href="/signup"
              className="w-full text-center py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold text-[13px] transition-colors"
            >
              {isHi ? 'एंटरप्राइज संपर्क करें' : 'Contact Enterprise'}
            </Link>
          </div>
        </div>
      </GhostGridSection>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 7. BOTTOM CTA BANNER (Framed in Ghost Rails)                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 border-x border-dashed border-neutral-300 py-12 sm:py-16 relative">
        <GridCross className="top-0 left-0" />
        <GridCross className="top-0 right-0" />
        <GridCross className="bottom-0 left-0" />
        <GridCross className="bottom-0 right-0" />

        <div className="bg-[#0b0f1a] text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-xl relative overflow-hidden border border-neutral-800">
          <div className="space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight max-w-xl mx-auto">
              {isHi
                ? 'क्या आप अपने व्यापारिक अनुपालन को स्वचालित करने के लिए तैयार हैं?'
                : 'Ready to automate your enterprise compliance?'}
            </h2>
            <p className="text-[14px] text-neutral-400 max-w-md mx-auto">
              {isHi
                ? 'हजारों भारतीय MSMEs से जुड़ें जो विश्वसनीयता बढ़ा रहे हैं, जुर्माने से बच रहे हैं और सरकारी सब्सिडी का लाभ ले रहे हैं।'
                : 'Join thousands of Indian MSMEs building verified trust, avoiding statutory penalties, and unlocking bank credit.'}
            </p>
          </div>
          <div className="pt-2 relative z-10">
            <Link
              href="/signup"
              className="inline-flex items-center gap-3 bg-[#ef4d23] hover:bg-[#df4118] active:scale-[0.98] text-white rounded-full pl-7 pr-2.5 py-2.5 text-[14px] font-semibold transition-all shadow-md group"
            >
              <span>{isHi ? 'निःशुल्क शुरुआत करें' : 'Get Started Free'}</span>
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <ChevronRight className="w-4 h-4 text-white stroke-[2.5]" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 8. FOOTER (Full-Bleed Top Border & Vertical Rails)                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <footer className="w-full border-t border-dashed border-neutral-300 relative bg-[#ededed]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 border-x border-dashed border-neutral-300 pt-12 pb-8 text-left text-[12px] text-neutral-500 space-y-8 relative">
          <GridCross className="top-0 left-0" />
          <GridCross className="top-0 right-0" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="space-y-2">
              <span className="font-bold text-neutral-900 block text-[13px]">
                {isHi ? 'अनुपालन हब' : 'Compliance Hubs'}
              </span>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/compliance" className="hover:text-[#ef4d23] transition-colors">
                    {isHi ? 'GST व कर कैलेंडर' : 'GST & Tax Calendar'}
                  </Link>
                </li>
                <li>
                  <Link href="/notices" className="hover:text-[#ef4d23] transition-colors">
                    {isHi ? 'नोटिस OCR सुरक्षा' : 'Notice OCR Defense'}
                  </Link>
                </li>
                <li>
                  <Link href="/copilot" className="hover:text-[#ef4d23] transition-colors">
                    {isHi ? 'AI विधिक सहायक' : 'AI Legal Copilot'}
                  </Link>
                </li>
                <li>
                  <Link href="/score" className="hover:text-[#ef4d23] transition-colors">
                    {isHi ? 'स्वास्थ्य स्कोर रेटिंग' : 'Health Score Rating'}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-neutral-900 block text-[13px]">
                {isHi ? 'विकास एवं मार्केटप्लेस' : 'Growth & Market'}
              </span>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/schemes" className="hover:text-[#ef4d23] transition-colors">
                    {isHi ? 'UP MSME पूंजीगत सब्सिडी' : 'UP MSME Capital Subsidies'}
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace/suppliers" className="hover:text-[#ef4d23] transition-colors">
                    {isHi ? 'सप्लायर डायरेक्टरी' : 'Supplier Directory'}
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace/creators" className="hover:text-[#ef4d23] transition-colors">
                    {isHi ? 'क्षेत्रीय क्रिएटर्स' : 'Vernacular Creators'}
                  </Link>
                </li>
                <li>
                  <Link href="/payments" className="hover:text-[#ef4d23] transition-colors">
                    {isHi ? 'एस्क्रो भुगतान' : 'Escrow Payments'}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-neutral-900 block text-[13px]">
                {isHi ? 'एंटरप्राइज व पार्टनर्स' : 'Enterprise & Partner'}
              </span>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/ca/clients" className="hover:text-[#ef4d23] transition-colors">
                    {isHi ? 'सीए पार्टनर पोर्टल' : 'CA Client Portal'}
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-[#ef4d23] transition-colors">
                    {isHi ? 'सुरक्षा व ऑडिट लॉग' : 'Security & Audit'}
                  </Link>
                </li>
                <li>
                  <Link href="/onboarding" className="hover:text-[#ef4d23] transition-colors">
                    {isHi ? 'व्यापारिक ऑनबोर्डिंग' : 'Business Onboarding'}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-neutral-900 block text-[13px]">
                {isHi ? 'सुरक्षा व पहचान' : 'Security & Identity'}
              </span>
              <p className="text-[11px] leading-relaxed text-neutral-400">
                {isHi
                  ? 'SOC 2 टाइप II प्रमाणित, Supabase रो-लेवल सुरक्षा (RLS), AES-256 एन्क्रिप्टेड।'
                  : 'SOC 2 Type II Certified, Supabase Row-Level Security, AES-256 Encrypted.'}
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isHi ? 'सत्यापित संस्थागत विश्वास' : 'Verified Institutional Trust'}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-dashed border-neutral-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400">
            <p>
              {isHi
                ? '© 2026 सारथी टेक्नोलॉजीज इंडिया प्राइवेट लिमिटेड। सर्वाधिकार सुरक्षित।'
                : '© 2026 Saarthi Technologies India Pvt Ltd. All rights reserved.'}
            </p>
            <div className="flex items-center gap-4 font-mono text-[10px]">
              <span>{isHi ? 'गोपनीयता नीति' : 'Privacy Policy'}</span>
              <span>{isHi ? 'सेवा की शर्तें' : 'Terms of Service'}</span>
              <span>{isHi ? 'सिस्टम स्थिति' : 'Security Status'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
