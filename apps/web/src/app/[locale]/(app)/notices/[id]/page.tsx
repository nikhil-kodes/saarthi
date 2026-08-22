'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import {
  FileWarning,
  Clock,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Globe,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function NoticeDetailPage() {
  const t = useTranslations('notices');
  const tStatus = useTranslations('status');
  const tCommon = useTranslations('common');
  const params = useParams();

  const locale = (params.locale as string) || 'en';
  const otherLocale = locale === 'en' ? 'hi' : 'en';
  const noticeId = params.id as string;

  const [notice, setNotice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generatingReply, setGeneratingReply] = useState(false);
  const [customGrounds, setCustomGrounds] = useState('');

  const fetchNotice = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notices/${noticeId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setNotice(json.data);
      }
    } catch (err) {
      console.error('Failed to load notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (noticeId) {
      fetchNotice();
    }
  }, [noticeId]);

  const handleCopyReply = () => {
    if (!notice?.replyDraftEn) return;
    navigator.clipboard.writeText(notice.replyDraftEn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleGenerateCustomReply = async () => {
    try {
      setGeneratingReply(true);
      const res = await fetch(`/api/notices/${noticeId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grounds:
            customGrounds ||
            '1. All Input Tax Credit claimed is supported by tax invoices and compliant with Section 16(2).\n2. Supplier filing delays have been rectified.',
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setNotice(json.data.notice);
      }
    } catch (err) {
      console.error('Failed to generate reply:', err);
    } finally {
      setGeneratingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-navy" />
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="min-h-screen bg-canvas p-8 text-center space-y-4">
        <h1 className="text-title font-semibold text-ink">Notice not found</h1>
        <Link href="/notices" className="text-brand-navy hover:underline">
          Return to Notices Hub
        </Link>
      </div>
    );
  }

  const isHi = locale === 'hi';
  const isUrgent = (notice.severity === 'critical' || notice.severity === 'urgent');
  const displaySummary =
    isHi
      ? (notice.plainSummaryHi || notice.plain_summary_hi || notice.plainSummaryEn || notice.plain_summary_en)
      : (notice.plainSummaryEn || notice.plain_summary_en);


  const noticeNumber = notice.noticeNumber || notice.notice_number || 'NOT-2026-9812';
  const issueDate = notice.issueDate || notice.issue_date || '2026-02-15';
  const responseDeadline = notice.responseDeadline || notice.response_deadline || '2026-03-02';
  const demandAmount = Number(notice.demandAmount ?? notice.demand_amount ?? 0);
  const penaltyAmount = Number(notice.penaltyAmount ?? notice.penalty_amount ?? 0);
  const replyDraft = notice.replyDraftEn || notice.reply_draft_en;

  return (
    <div className="min-h-screen bg-[#f5f4f0] font-['Inter',sans-serif] selection:bg-[#ef4d23]/20 selection:text-[#ef4d23]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/notices"
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-body-sm font-bold text-ink block">
              {notice.authority}
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              Ref: {noticeNumber}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/notices/${noticeId}`}
            locale={otherLocale}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-caption font-semibold text-ink hover:bg-neutral-50 transition-colors border border-neutral-200"
          >
            <Globe className="w-3.5 h-3.5 text-[#ef4d23]" />
            <span>{otherLocale === 'hi' ? 'हिंदी' : 'English'}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
        {/* Emergency Timeline Banner */}
        {isUrgent && (
          <div className="bg-[#0b0f1a] text-white rounded-3xl p-6 shadow-xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#ef4d23]">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
                <h2 className="text-title-sm font-bold tracking-tight text-white">{t('emergencyBannerTitle')}</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-bold text-caption border border-red-500/40 uppercase">
                {notice.severity || 'CRITICAL'}
              </span>
            </div>
            <p className="text-caption sm:text-body-sm text-neutral-300 leading-relaxed">
              {t('emergencyBannerSubtitle')}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-6 text-caption font-mono text-neutral-300">
              <div>
                <span className="text-neutral-400 text-[11px] block uppercase font-sans">Statutory Deadline</span>
                <strong className="text-[#ef4d23] text-body-sm font-bold">{responseDeadline}</strong>
              </div>
              <div>
                <span className="text-neutral-400 text-[11px] block uppercase font-sans">Financial Demand</span>
                <strong className="text-white text-body-sm font-bold">₹{demandAmount.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span className="text-neutral-400 text-[11px] block uppercase font-sans">Penalty Risk</span>
                <strong className="text-red-400 text-body-sm font-bold">₹{penaltyAmount.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Notice Metadata Card */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
            <div>
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider block font-bold">
                {t('authority')}
              </span>
              <h1 className="text-title font-bold text-ink">{notice.authority}</h1>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider block font-bold">
                {t('demandAmount')}
              </span>
              <span className="text-2xl font-mono font-extrabold text-status-danger">
                ₹{demandAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-caption">
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/60">
              <span className="text-neutral-400 block font-medium">Notice Number</span>
              <span className="font-mono font-bold text-ink">{noticeNumber}</span>
            </div>
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/60">
              <span className="text-neutral-400 block font-medium">Issue Date</span>
              <span className="font-mono font-bold text-ink">{issueDate}</span>
            </div>
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/60">
              <span className="text-neutral-400 block font-medium">Penalty Risk</span>
              <span className="font-mono font-bold text-status-danger">
                ₹{penaltyAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/60">
              <span className="text-neutral-400 block font-medium">Filing Status</span>
              <span className="font-bold text-[#123A73] uppercase">{notice.status || 'Action Required'}</span>
            </div>
          </div>
        </div>

        {/* 3-Part Plain-Language Explainer */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#ef4d23]" />
            <h2 className="text-title-sm font-bold text-ink">{t('plainLanguageTitle')}</h2>
          </div>

          <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-200/60 text-body-sm text-ink leading-relaxed whitespace-pre-wrap">
            {displaySummary}
          </div>
        </div>

        {/* Formal Reply Draft Generator */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#123A73]" />
              <h2 className="text-title-sm font-bold text-ink">{t('formalReplyTitle')}</h2>
            </div>

            {replyDraft && (
              <button
                type="button"
                onClick={handleCopyReply}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-neutral-200 text-caption font-bold text-ink hover:bg-neutral-50 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t('replyCopied') : t('copyReply')}</span>
              </button>
            )}
          </div>

          {replyDraft && (
            <div className="p-5 rounded-2xl bg-[#0b0f1a] text-neutral-200 border border-neutral-800 font-mono text-caption leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
              {replyDraft}
            </div>
          )}

          {/* Regenerate / Customize Reply Form */}
          <div className="space-y-3 pt-2">
            <label className="text-caption font-bold text-neutral-700 block">
              {isHi ? 'विशिष्ट कानूनी आधार / स्पष्टीकरण बिंदु जोड़ें:' : 'Add specific legal grounds / factual explanation:'}
            </label>
            <textarea
              value={customGrounds}
              onChange={(e) => setCustomGrounds(e.target.value)}
              placeholder="e.g. All Input Tax Credit claimed is supported by supplier tax invoices and reported in subsequent return cycles."
              rows={3}
              className="w-full p-3.5 rounded-xl border border-neutral-300 text-caption font-medium text-ink focus:outline-none focus:border-[#ef4d23]"
            />
            <button
              type="button"
              onClick={handleGenerateCustomReply}
              disabled={generatingReply}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ef4d23] hover:bg-[#d83f17] text-white font-bold text-button disabled:opacity-60 transition-all shadow-sm"
            >
              {generatingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isHi ? 'कानूनी जवाब पत्र तैयार करें' : 'Generate Formal Legal Reply'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

