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

  const isUrgent = notice.severity === 'critical' || notice.severity === 'urgent';
  const displaySummary =
    locale === 'hi' && notice.plainSummaryHi ? notice.plainSummaryHi : notice.plainSummaryEn;

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface-white border-b border-hairline px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-soft-flat">
        <div className="flex items-center gap-4">
          <Link
            href="/notices"
            className="p-1.5 rounded-md hover:bg-surface-faint text-neutral-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-title-sm text-ink font-semibold">
            Notice: {notice.noticeNumber || 'Statutory Notice'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/notices/${noticeId}`}
            locale={otherLocale}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-surface-white text-caption font-medium text-ink hover:bg-surface-faint transition-colors border border-hairline"
          >
            <Globe className="w-3.5 h-3.5 text-brand-navy" />
            <span>{otherLocale === 'hi' ? 'हिंदी' : 'English'}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Emergency Timeline Dark-Band Banner (DESIGN.md §8.5 Moment #1) */}
        {isUrgent && (
          <div className="bg-ink rounded-xl p-5 sm:p-6 text-on-dark space-y-3 shadow-soft-raised border border-ink-pressed">
            <div className="flex items-center gap-2.5 text-status-warning">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <h2 className="text-title-sm font-bold tracking-tight">{t('emergencyBannerTitle')}</h2>
            </div>
            <p className="text-body-sm text-neutral-300 leading-relaxed">
              {t('emergencyBannerSubtitle')}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-caption font-mono text-neutral-300">
              <span>Deadline: <strong className="text-status-warning text-body font-bold">{notice.responseDeadline}</strong></span>
              <span>Demand: <strong className="text-on-dark text-body font-bold">₹{Number(notice.demandAmount).toLocaleString('en-IN')}</strong></span>
            </div>
          </div>
        )}

        {/* Notice Metadata Card */}
        <div className="bg-surface-white rounded-xl border border-hairline p-6 shadow-soft-flat space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4">
            <div>
              <span className="text-caption text-neutral-400 uppercase tracking-wider block font-semibold">
                {t('authority')}
              </span>
              <h1 className="text-title font-semibold text-ink">{notice.authority}</h1>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-caption text-neutral-400 uppercase tracking-wider block font-semibold">
                {t('demandAmount')}
              </span>
              <span className="text-title-lg font-mono font-bold text-ink">
                ₹{Number(notice.demandAmount).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-caption">
            <div>
              <span className="text-neutral-400 block font-medium">Notice Number</span>
              <span className="font-mono font-semibold text-ink">{notice.noticeNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-neutral-400 block font-medium">Issue Date</span>
              <span className="font-mono font-semibold text-ink">{notice.issueDate || 'N/A'}</span>
            </div>
            <div>
              <span className="text-neutral-400 block font-medium">Penalty Risk</span>
              <span className="font-mono font-semibold text-status-danger">
                ₹{Number(notice.penaltyAmount).toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block font-medium">Status</span>
              <span className="font-semibold text-brand-navy uppercase">{notice.status}</span>
            </div>
          </div>
        </div>

        {/* 3-Part Plain-Language Explainer (PRD.md §9) */}
        <div className="bg-surface-white rounded-xl border border-hairline p-6 shadow-soft-flat space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-navy" />
            <h2 className="text-title-sm font-semibold text-ink">{t('plainLanguageTitle')}</h2>
          </div>

          <div className="p-4 rounded-lg bg-surface-soft border border-hairline text-body text-ink leading-relaxed whitespace-pre-wrap">
            {displaySummary}
          </div>
        </div>

        {/* Formal Reply Draft Generator */}
        <div className="bg-surface-white rounded-xl border border-hairline p-6 shadow-soft-flat space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-navy" />
              <h2 className="text-title-sm font-semibold text-ink">{t('formalReplyTitle')}</h2>
            </div>

            {notice.replyDraftEn && (
              <button
                type="button"
                onClick={handleCopyReply}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-white border border-hairline text-caption font-semibold text-ink hover:bg-surface-faint transition-colors shadow-soft-flat"
              >
                {copied ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t('replyCopied') : t('copyReply')}</span>
              </button>
            )}
          </div>

          {notice.replyDraftEn ? (
            <div className="p-4 rounded-lg bg-canvas border border-hairline font-mono text-caption text-ink leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
              {notice.replyDraftEn}
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={customGrounds}
                onChange={(e) => setCustomGrounds(e.target.value)}
                placeholder="Enter specific factual grounds or reconciliation notes..."
                rows={3}
                className="w-full p-3 rounded-lg border border-hairline text-caption text-ink focus:outline-none focus:border-brand-blue"
              />
              <button
                type="button"
                onClick={handleGenerateCustomReply}
                disabled={generatingReply}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ink text-on-dark font-semibold text-button hover:bg-ink-pressed disabled:bg-neutral-300 transition-colors"
              >
                {generatingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{t('generateReply')}</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
