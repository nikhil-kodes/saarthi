'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import {
  Sparkles,
  ExternalLink,
  Calendar,
  Building2,
  Filter,
  Search,
  Globe,
  Loader2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  AmbientOrbs,
  ArchitecturalGrid,
  SpecularHorizonBeam,
} from '@/components/ui/ambient-background';

export default function RegulatoryIntelligencePage() {
  const t = useTranslations('regulatory');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const params = useParams();

  const locale = (params.locale as string) || 'en';
  const otherLocale = locale === 'en' ? 'hi' : 'en';

  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const url =
        selectedCategory === 'ALL'
          ? '/api/regulatory/updates'
          : `/api/regulatory/updates?category=${selectedCategory}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setUpdates(json.data);
      }
    } catch (err) {
      console.error('Failed to load updates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [selectedCategory]);

  const filteredUpdates = updates.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = (u.title || '').toLowerCase();
    const titleHi = (u.title_hi || u.titleHi || '').toLowerCase();
    const source = (u.source || '').toLowerCase();
    const summaryEn = (u.summary_en || u.summaryEn || '').toLowerCase();
    const summaryHi = (u.summary_hi || u.summaryHi || '').toLowerCase();
    return (
      title.includes(q) ||
      titleHi.includes(q) ||
      source.includes(q) ||
      summaryEn.includes(q) ||
      summaryHi.includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#f5f4f0] font-['Inter',sans-serif] selection:bg-[#ef4d23]/20 selection:text-[#ef4d23] relative overflow-hidden">
      {/* Dynamic Ambient Background Layers */}
      <AmbientOrbs theme="cool" intensity="subtle" />
      <ArchitecturalGrid gridSize={32} />
      <div className="pointer-events-none absolute inset-0 ambient-dot-grid opacity-50" aria-hidden="true" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm relative">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <SaarthiLogo className="w-8 h-8" />
            <span className="text-title-sm text-ink font-semibold">{tCommon('appName')}</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-md text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('dashboard')}
            </Link>
            <Link
              href="/compliance"
              className="px-3 py-1.5 rounded-md text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('compliance')}
            </Link>
            <Link
              href="/regulatory"
              className="px-3 py-1.5 rounded-md text-body-sm font-semibold text-brand-navy bg-brand-blue-light/50 transition-colors"
            >
              {tNav('regulatory')}
            </Link>
            <Link
              href="/copilot"
              className="px-3 py-1.5 rounded-md text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('copilot')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/regulatory"
            locale={otherLocale}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-surface-white text-caption font-medium text-ink hover:bg-surface-faint transition-colors border border-hairline"
          >
            <Globe className="w-3.5 h-3.5 text-brand-navy" />
            <span>{otherLocale === 'hi' ? 'हिंदी' : 'English'}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-brand-navy" />
              <h1 className="text-title-lg font-semibold text-ink">{t('title')}</h1>
            </div>
            <p className="text-body-sm text-neutral-500">{t('subtitle')}</p>
          </div>

          <Link
            href="/copilot"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-ink text-on-dark font-semibold text-button hover:bg-ink-pressed transition-colors shadow-soft-flat"
          >
            <span>Ask Compliance Copilot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-surface-white rounded-xl border border-hairline p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft-flat">
          <div className="flex flex-wrap items-center gap-2 text-caption">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-pill font-medium transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-brand-navy text-on-dark'
                  : 'bg-surface-soft text-neutral-600 hover:bg-surface-faint'
              }`}
            >
              All Updates
            </button>
            <button
              onClick={() => setSelectedCategory('taxation')}
              className={`px-3 py-1.5 rounded-pill font-medium transition-colors ${
                selectedCategory === 'taxation'
                  ? 'bg-brand-navy text-on-dark'
                  : 'bg-surface-soft text-neutral-600 hover:bg-surface-faint'
              }`}
            >
              Taxation & GST
            </button>
            <button
              onClick={() => setSelectedCategory('industry_specific')}
              className={`px-3 py-1.5 rounded-pill font-medium transition-colors ${
                selectedCategory === 'industry_specific'
                  ? 'bg-brand-navy text-on-dark'
                  : 'bg-surface-soft text-neutral-600 hover:bg-surface-faint'
              }`}
            >
              FSSAI & Industry
            </button>
            <button
              onClick={() => setSelectedCategory('corporate_and_msme')}
              className={`px-3 py-1.5 rounded-pill font-medium transition-colors ${
                selectedCategory === 'corporate_and_msme'
                  ? 'bg-brand-navy text-on-dark'
                  : 'bg-surface-soft text-neutral-600 hover:bg-surface-faint'
              }`}
            >
              MSME & State Schemes
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tCommon('search')}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-md bg-surface-white border border-hairline text-caption text-ink placeholder:text-neutral-400 focus:outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center bg-surface-white rounded-xl border border-hairline space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-navy mx-auto" />
            <p className="text-body-sm text-neutral-500">{tCommon('loading')}</p>
          </div>
        )}

        {/* Updates Feed */}
        {!loading && (
          <div className="space-y-4">
            {filteredUpdates.map((item) => {
              const displayTitle =
                locale === 'hi' && item.title_hi ? item.title_hi : item.title;
              const displaySummary =
                locale === 'hi' && item.summary_hi ? item.summary_hi : item.summary_en;

              return (
                <div
                  key={item.id}
                  className="bg-surface-white rounded-xl border border-hairline p-5 shadow-soft-flat hover:shadow-soft-raised transition-all space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 max-w-4xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-pill bg-brand-blue-light text-brand-navy font-semibold text-caption">
                          {item.source}
                        </span>
                        {item.jurisdiction_state && (
                          <span className="px-2 py-0.5 rounded-pill bg-status-info-bg text-brand-navy font-semibold text-caption">
                            {item.jurisdiction_state} State
                          </span>
                        )}
                        <span className="text-caption text-neutral-400 font-mono">
                          {item.published_at?.slice(0, 10)}
                        </span>
                      </div>

                      <h3 className="text-body font-semibold text-ink">{displayTitle}</h3>
                      <p className="text-body-sm text-neutral-700">{displaySummary}</p>
                    </div>

                    {item.effective_date && (
                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-caption text-neutral-400 block uppercase font-medium">
                          {t('effectiveDate')}
                        </span>
                        <span className="text-body-sm font-mono font-bold text-ink">
                          {item.effective_date}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Impacted Sectors & Official Link */}
                  <div className="pt-2 border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-caption">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-ink">{t('impactedSectors')}:</span>
                      {Array.isArray(item.impacted_sectors) &&
                        item.impacted_sectors.map((sec: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-surface-soft text-neutral-700"
                          >
                            {sec}
                          </span>
                        ))}
                    </div>

                    {item.source_url && (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-brand-navy hover:underline font-medium shrink-0"
                      >
                        <span>{t('viewOfficial')}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
