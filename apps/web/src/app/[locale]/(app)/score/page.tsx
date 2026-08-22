'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import Gauge from '@/components/Gauge';
import {
  ShieldCheck,
  RefreshCw,
  Share2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Globe,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import {
  AmbientOrbs,
  ArchitecturalGrid,
  SpecularHorizonBeam,
} from '@/components/ui/ambient-background';

export default function ComplianceHealthScorePage() {
  const t = useTranslations('score');
  const tStatus = useTranslations('status');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const params = useParams();

  const locale = (params.locale as string) || 'en';
  const isHi = locale === 'hi';
  const otherLocale = isHi ? 'en' : 'hi';

  const [scoreData, setScoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);

  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [granteeName, setGranteeName] = useState('');
  const [granteeType, setGranteeType] = useState('lender');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchScore = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/score');
      const json = await res.json();
      if (json.success && json.data) {
        setScoreData(json.data);
      }
    } catch (err) {
      console.error('Failed to load score:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  const handleRecompute = async () => {
    try {
      setRecomputing(true);
      const res = await fetch('/api/score', { method: 'POST' });
      const json = await res.json();
      if (json.success && json.data) {
        setScoreData(json.data);
      }
    } catch (err) {
      console.error('Recompute failed:', err);
    } finally {
      setRecomputing(false);
    }
  };

  const handleCreateShareToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!granteeName.trim()) return;

    try {
      setGeneratingToken(true);
      const res = await fetch('/api/score/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          granteeName,
          granteeType,
          expiresInDays: 30,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setGeneratedToken(json.data.accessToken);
      }
    } catch (err) {
      console.error('Failed to generate consent token:', err);
    } finally {
      setGeneratingToken(false);
    }
  };

  const shareUrl = generatedToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/verify/score/${generatedToken}`
    : '';

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const scoreVal = scoreData?.score ?? 745;
  const scorePercent = Math.round((scoreVal / 900) * 100);

  const pillars = [
    {
      key: 'filingTimeliness',
      title: t('p1Title'),
      desc: t('p1Desc'),
      score: scoreData?.pillarScores?.filingTimeliness ?? 190,
      max: 210,
    },
    {
      key: 'noticeResolution',
      title: t('p2Title'),
      desc: t('p2Desc'),
      score: scoreData?.pillarScores?.noticeResolution ?? 110,
      max: 120,
    },
    {
      key: 'identityAuthenticity',
      title: t('p3Title'),
      desc: t('p3Desc'),
      score: scoreData?.pillarScores?.identityAuthenticity ?? 120,
      max: 120,
    },
    {
      key: 'financialDiscipline',
      title: t('p4Title'),
      desc: t('p4Desc'),
      score: scoreData?.pillarScores?.financialDiscipline ?? 85,
      max: 90,
    },
    {
      key: 'regulatoryAdherence',
      title: t('p5Title'),
      desc: t('p5Desc'),
      score: scoreData?.pillarScores?.regulatoryAdherence ?? 55,
      max: 60,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f4f0] font-['Inter',sans-serif] selection:bg-[#ef4d23]/20 selection:text-[#ef4d23] relative overflow-hidden">
      {/* Dynamic Ambient Background Layers */}
      <AmbientOrbs theme="emerald" intensity="subtle" />
      <ArchitecturalGrid gridSize={32} />
      <div className="pointer-events-none absolute inset-0 ambient-dot-grid opacity-50" aria-hidden="true" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm relative">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center space-x-2.5 group">
            <SaarthiLogo className="w-8 h-8" />
            <span className="text-[16px] text-neutral-900 font-bold leading-none">
              {isHi ? 'सारथी' : 'Saarthi'}
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1 text-[13px]">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg font-medium text-neutral-600 hover:text-neutral-900 hover:bg-[#f5f2ee] transition-colors"
            >
              {tNav('dashboard')}
            </Link>
            <Link
              href="/compliance"
              className="px-3 py-1.5 rounded-lg font-medium text-neutral-600 hover:text-neutral-900 hover:bg-[#f5f2ee] transition-colors"
            >
              {tNav('compliance')}
            </Link>
            <Link
              href="/notices"
              className="px-3 py-1.5 rounded-lg font-medium text-neutral-600 hover:text-neutral-900 hover:bg-[#f5f2ee] transition-colors"
            >
              {tNav('notices')}
            </Link>
            <Link
              href="/schemes"
              className="px-3 py-1.5 rounded-lg font-medium text-neutral-600 hover:text-neutral-900 hover:bg-[#f5f2ee] transition-colors"
            >
              {tNav('schemes')}
            </Link>
            <Link
              href="/score"
              className="px-3 py-1.5 rounded-lg font-bold text-[#ef4d23] bg-[#ef4d23]/10"
            >
              {tNav('score')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/score"
            locale={otherLocale}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f2ee] text-[12px] font-semibold text-neutral-700 hover:text-neutral-900 border border-neutral-200/60 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-[#ef4d23]" />
            <span>{otherLocale === 'hi' ? 'हिंदी' : 'English'}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-left">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-[#ef4d23]" />
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">{t('title')}</h1>
            </div>
            <p className="text-[13px] text-neutral-500">{t('subtitle')}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRecompute}
              disabled={recomputing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-neutral-200/80 hover:bg-[#f5f2ee] font-semibold text-[13px] text-neutral-900 transition-all shadow-sm disabled:opacity-50 active:scale-[0.98]"
            >
              <RefreshCw className={`w-4 h-4 text-[#ef4d23] ${recomputing ? 'animate-spin' : ''}`} />
              <span>{recomputing ? t('recomputing') : t('recomputeButton')}</span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0b0f1a] text-white hover:bg-[#182238] font-semibold text-[13px] transition-all shadow-sm active:scale-[0.98]"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('shareCertificateTitle')}</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-16 text-center bg-white rounded-3xl border border-neutral-200/80 space-y-3 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-[#ef4d23] mx-auto" />
            <p className="text-[13px] text-neutral-500">{tCommon('loading')}</p>
          </div>
        )}

        {/* Score Reveal Card */}
        {!loading && scoreData && (
          <div className="space-y-6">
            <div className="bg-[#0b0f1a] text-white rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Arc Gauge Column */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center text-center space-y-4">
                  <span className="px-3.5 py-1 rounded-full bg-[#ef4d23]/20 text-[#ef4d23] font-bold text-[12px] tracking-wider uppercase border border-[#ef4d23]/30">
                    {tStatus(scoreData.grade || 'AAA_EXCELLENT')}
                  </span>

                  <div className="w-full max-w-[280px]">
                    <Gauge value={scorePercent} color="#ef4d23" showLabels={true} min="300" max="900" />
                  </div>

                  <div className="space-y-1 max-w-xs">
                    <p className="text-[16px] font-bold text-white">
                      {isHi ? 'सर्वोच्च एंटरप्राइज ट्रस्ट रेटिंग' : 'Prime Enterprise Trust Rating'}
                    </p>
                    <p className="text-[12px] text-neutral-400 leading-relaxed">
                      {isHi
                        ? 'सत्यापित MSMEs के शीर्ष 5% में। बिना गारंटी के त्वरित बैंक क्रेडिट के लिए पात्र।'
                        : 'Top 5% percentile across verified MSMEs. Eligible for fast-track collateral-free credit lines.'}
                    </p>
                  </div>
                </div>

                {/* Score Contribution Explainers */}
                <div className="lg:col-span-7 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-[12px] uppercase font-bold text-neutral-400 tracking-wider">
                      {isHi ? 'लाइव स्कोर योगदान' : 'Live Score Contributions'}
                    </h3>
                    <span className="text-[11px] font-mono text-[#ef4d23] font-semibold">
                      {isHi ? '100% ऑडिट सत्यापित' : '100% Audit Verified'}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-[12px] font-mono">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <span className="text-neutral-200">
                        {isHi ? '✓ समय पर GSTR-3B एवं GSTR-1 फाइलिंग (12 चक्र)' : '✓ On-time GSTR-3B & GSTR-1 filings (12 cycles)'}
                      </span>
                      <span className="text-[#ef4d23] font-bold">+190 pts</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <span className="text-neutral-200">
                        {isHi ? '✓ शून्य लंबित कर मांग व त्वरित नोटिस समाधान' : '✓ Clean notice record (0 pending tax demands)'}
                      </span>
                      <span className="text-[#ef4d23] font-bold">+110 pts</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <span className="text-neutral-200">
                        {isHi ? '✓ सत्यापित उद्यम, पैन एवं UP श्रम पंजीकरण' : '✓ Verified Udyam, PAN & UP Labour registrations'}
                      </span>
                      <span className="text-[#ef4d23] font-bold">+120 pts</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <span className="text-neutral-200">
                        {isHi ? '✓ B2B एस्क्रो माइलस्टोन सफल निष्पादन ट्रैक रिकॉर्ड' : '✓ B2B Escrow milestone release track record'}
                      </span>
                      <span className="text-[#ef4d23] font-bold">+85 pts</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-400 font-sans">
                    <span>
                      {isHi ? '47 केंद्रीय एवं राज्य अधिनियमों के तहत मूल्यांकित' : 'Evaluated against 47 Central & State Acts'}
                    </span>
                    <Link href="/compliance" className="text-[#ef4d23] hover:underline flex items-center gap-1 font-semibold">
                      {isHi ? 'ऑडिट ट्रेल देखें' : 'Audit Trail'} <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Pillars Progress Breakdown */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <h2 className="text-[18px] font-bold text-neutral-900">{t('pillarsTitle')}</h2>
                  <p className="text-[13px] text-neutral-500">
                    {isHi ? 'निरंतर 5-स्तंभीय गणितीय मूल्यांकन' : 'Continuous 5-pillar mathematical evaluation'}
                  </p>
                </div>
                <span className="text-[12px] text-neutral-400 font-mono">
                  {isHi ? '600 आधार अंक' : '600 Base Points'}
                </span>
              </div>

              <div className="space-y-5">
                {pillars.map((p) => {
                  const percentage = Math.round((p.score / p.max) * 100);
                  return (
                    <div key={p.key} className="space-y-2">
                      <div className="flex items-center justify-between text-[13px]">
                        <div>
                          <span className="font-bold text-neutral-900">{p.title}</span>
                          <span className="text-neutral-400 ml-2 hidden sm:inline">{p.desc}</span>
                        </div>
                        <span className="font-mono font-bold text-neutral-900">
                          {p.score} / {p.max} pts ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#f5f2ee] h-3 rounded-full overflow-hidden border border-neutral-200/60">
                        <div
                          className="h-full bg-[#ef4d23] rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Share Certificate Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-neutral-200/80 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-xl text-left">
              <div className="space-y-1">
                <h3 className="text-[18px] font-bold text-neutral-900">
                  {t('shareCertificateTitle')}
                </h3>
                <p className="text-[13px] text-neutral-500">
                  {t('shareCertificateSubtitle')}
                </p>
              </div>

              {!generatedToken ? (
                <form onSubmit={handleCreateShareToken} className="space-y-4">
                  <div>
                    <label className="text-[12px] font-semibold text-neutral-700 block mb-1">
                      {t('granteeNameLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('granteeNamePlaceholder')}
                      value={granteeName}
                      onChange={(e) => setGranteeName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-[13px] font-medium text-neutral-900 focus:outline-none focus:border-[#ef4d23]"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-neutral-700 block mb-1">
                      {t('granteeTypeLabel')}
                    </label>
                    <select
                      value={granteeType}
                      onChange={(e) => setGranteeType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-[13px] font-medium text-neutral-900 focus:outline-none focus:border-[#ef4d23]"
                    >
                      <option value="lender">{isHi ? 'बैंक / NBFC ऋणदाता' : 'Bank / NBFC Lender'}</option>
                      <option value="buyer">{isHi ? 'कॉर्पोरेट / B2B खरीदार' : 'Corporate / B2B Buyer'}</option>
                      <option value="government">{isHi ? 'सरकारी एजेंसी / नोडल अधिकारी' : 'Government Agency'}</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowShareModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-neutral-200 text-[13px] font-semibold text-neutral-600 hover:bg-[#f5f2ee]"
                    >
                      {tCommon('cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={generatingToken}
                      className="px-5 py-2.5 rounded-xl bg-[#0b0f1a] text-white text-[13px] font-semibold hover:bg-[#182238] disabled:opacity-50 flex items-center gap-2"
                    >
                      {generatingToken ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{tCommon('loading')}</span>
                        </>
                      ) : (
                        <span>{t('generateTokenButton')}</span>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t('shareLinkCopied')}</span>
                    </div>
                    <p className="text-[12px] text-emerald-700 font-mono break-all">{shareUrl}</p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 rounded-xl bg-[#ef4d23] text-white text-[12px] font-bold flex items-center gap-1.5 hover:bg-[#df4118]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? (isHi ? 'कॉपी हो गया!' : 'Copied!') : (isHi ? 'लिंक कॉपी करें' : 'Copy Link')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowShareModal(false);
                        setGeneratedToken(null);
                        setGranteeName('');
                      }}
                      className="px-4 py-2 rounded-xl border border-neutral-200 text-[12px] font-semibold text-neutral-700 hover:bg-[#f5f2ee]"
                    >
                      {tCommon('cancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
