'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import {
  Award,
  CheckCircle2,
  ExternalLink,
  Filter,
  Search,
  Globe,
  Loader2,
  Building2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  AmbientOrbs,
  ArchitecturalGrid,
  SpecularHorizonBeam,
} from '@/components/ui/ambient-background';

export default function GovernmentSchemesPage() {
  const t = useTranslations('schemes');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const params = useParams();

  const locale = (params.locale as string) || 'en';
  const otherLocale = locale === 'en' ? 'hi' : 'en';

  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState<'ALL' | 'ELIGIBLE' | 'CENTRAL' | 'UP'>('ALL');
  const [applyingSchemeId, setApplyingSchemeId] = useState<string | null>(null);
  const [appliedSuccessId, setAppliedSuccessId] = useState<string | null>(null);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/schemes');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSchemes(json.data);
      }
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleApply = async (schemeId: string) => {
    try {
      setApplyingSchemeId(schemeId);
      const res = await fetch('/api/schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemeId,
          applicationData: {
            appliedAt: new Date().toISOString(),
            channel: 'saarthi_portal_prefilled',
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAppliedSuccessId(schemeId);
      }
    } catch (err) {
      console.error('Failed to submit application:', err);
    } finally {
      setApplyingSchemeId(null);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredSchemes = schemes.filter((s) => {
    if (filterState === 'ELIGIBLE' && !s.isEligible) return false;
    if (filterState === 'CENTRAL' && (s.jurisdictionState !== null && s.jurisdictionState !== undefined && s.jurisdiction_state !== null)) return false;
    if (filterState === 'UP' && s.jurisdictionState !== 'UP' && s.jurisdiction_state !== 'UP') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (s.title || '').toLowerCase();
      const titleHi = (s.titleHi || s.title_hi || '').toLowerCase();
      const desc = (s.description || '').toLowerCase();
      const ministry = (s.ministry || '').toLowerCase();
      return title.includes(q) || titleHi.includes(q) || desc.includes(q) || ministry.includes(q);
    }
    return true;
  });

  const upCount = schemes.filter((s) => s.jurisdictionState === 'UP' || s.jurisdiction_state === 'UP').length;
  const centralCount = schemes.filter((s) => !s.jurisdictionState && !s.jurisdiction_state).length;
  const eligibleCount = schemes.filter((s) => s.isEligible).length;

  return (
    <div className="min-h-screen bg-[#f5f4f0] font-['Inter',sans-serif] selection:bg-[#ef4d23]/20 selection:text-[#ef4d23] relative overflow-hidden">
      {/* Dynamic Ambient Background Layers */}
      <AmbientOrbs theme="warm" intensity="subtle" />
      <ArchitecturalGrid gridSize={32} />
      <div className="pointer-events-none absolute inset-0 ambient-dot-grid opacity-50" aria-hidden="true" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm relative">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <SaarthiLogo className="w-8 h-8" />
            <span className="text-title-sm text-ink font-bold">{tCommon('appName')}</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('dashboard')}
            </Link>
            <Link
              href="/compliance"
              className="px-3 py-1.5 rounded-lg text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('compliance')}
            </Link>
            <Link
              href="/licenses"
              className="px-3 py-1.5 rounded-lg text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {locale === 'hi' ? 'लाइसेंस एवं NSWS' : 'Licenses & NSWS'}
            </Link>
            <Link
              href="/schemes"
              className="px-3 py-1.5 rounded-lg text-body-sm font-bold text-brand-navy bg-brand-blue-light/50 transition-colors"
            >
              {tNav('schemes')}
            </Link>
            <Link
              href="/notices"
              className="px-3 py-1.5 rounded-lg text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('notices')}
            </Link>
            <Link
              href="/score"
              className="px-3 py-1.5 rounded-lg text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('score')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/schemes"
            locale={otherLocale}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-white text-caption font-semibold text-ink hover:bg-surface-faint transition-colors border border-hairline"
          >
            <Globe className="w-3.5 h-3.5 text-brand-navy" />
            <span>{otherLocale === 'hi' ? 'हिंदी' : 'English'}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6 text-left relative z-10">
        {/* Title Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Award className="w-7 h-7 text-[#ef4d23]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">{t('title')}</h1>
          </div>
          <p className="text-body-sm text-neutral-500">{t('subtitle')}</p>
        </div>

        {/* Quick Summary Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              {locale === 'hi' ? 'कुल उपलब्ध योजनाएं' : 'Total Subsidies'}
            </span>
            <span className="text-2xl font-extrabold text-neutral-900">{schemes.length}</span>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
              {locale === 'hi' ? 'पात्र योजनाएं (100%)' : 'Eligible for You'}
            </span>
            <span className="text-2xl font-extrabold text-emerald-600">{eligibleCount}</span>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-[#123A73] uppercase tracking-wider block">
              {locale === 'hi' ? 'उत्तर प्रदेश राज्य योजनाएं' : 'UP State Schemes'}
            </span>
            <span className="text-2xl font-extrabold text-[#123A73]">{upCount}</span>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
              {locale === 'hi' ? 'केंद्र सरकार योजनाएं' : 'Central Schemes'}
            </span>
            <span className="text-2xl font-extrabold text-amber-600">{centralCount}</span>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm text-caption">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterState('ALL')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                filterState === 'ALL'
                  ? 'bg-[#123A73] text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t('allFilter')} ({schemes.length})
            </button>
            <button
              onClick={() => setFilterState('ELIGIBLE')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                filterState === 'ELIGIBLE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100'
              }`}
            >
              {t('eligibleOnly')} ({eligibleCount})
            </button>
            <button
              onClick={() => setFilterState('UP')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                filterState === 'UP'
                  ? 'bg-[#ef4d23] text-white shadow-sm'
                  : 'bg-orange-50 text-orange-800 border border-orange-200/60 hover:bg-orange-100'
              }`}
            >
              {locale === 'hi' ? 'उत्तर प्रदेश (UP) योजनाएं' : 'UP State Schemes'} ({upCount})
            </button>
            <button
              onClick={() => setFilterState('CENTRAL')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                filterState === 'CENTRAL'
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t('centralFilter')} ({centralCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tCommon('search')}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-caption font-medium text-ink placeholder:text-neutral-400 focus:outline-none focus:border-[#ef4d23] focus:bg-white transition-all"
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

        {/* Scheme Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSchemes.map((scheme) => {
              const displayTitle =
                locale === 'hi' && scheme.titleHi ? scheme.titleHi : scheme.title;
              const displayDesc =
                locale === 'hi' && scheme.descriptionHi ? scheme.descriptionHi : scheme.description;
              const isApplied = appliedSuccessId === scheme.id;

              return (
                <div
                  key={scheme.id}
                  className="bg-surface-white rounded-xl border border-hairline p-6 shadow-soft-flat hover:shadow-soft-raised transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-pill bg-brand-blue-light text-brand-navy font-semibold text-caption">
                        {scheme.jurisdictionState ? `${scheme.jurisdictionState} State Scheme` : 'Central Scheme'}
                      </span>

                      {scheme.isEligible ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill bg-status-success-bg text-status-success font-semibold text-caption">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>100% Eligible</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill bg-surface-soft text-neutral-500 font-medium text-caption">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Action Required</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-title-sm font-semibold text-ink">{displayTitle}</h3>
                    <p className="text-caption text-neutral-400 font-medium">{scheme.ministry}</p>
                    <p className="text-body-sm text-neutral-600 line-clamp-3">{displayDesc}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-hairline">
                    <div className="flex items-center justify-between">
                      <span className="text-caption text-neutral-400 font-medium uppercase tracking-wider">
                        {t('maxBenefit')}
                      </span>
                      <span className="text-title-sm font-mono font-bold text-ink">
                        ₹{Number(scheme.maxBenefitAmount).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {scheme.eligibilityReason && (
                      <div className="p-2.5 rounded-md bg-surface-soft text-caption text-neutral-700 font-medium">
                        {scheme.eligibilityReason}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleApply(scheme.id)}
                        disabled={applyingSchemeId === scheme.id || isApplied}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-button transition-colors ${
                          isApplied
                            ? 'bg-status-success text-on-dark'
                            : 'bg-ink text-on-dark hover:bg-ink-pressed disabled:bg-neutral-300'
                        }`}
                      >
                        {applyingSchemeId === scheme.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isApplied ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Applied</span>
                          </>
                        ) : (
                          <>
                            <span>{t('applyButton')}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>

                      {scheme.applicationUrl && (
                        <a
                          href={scheme.applicationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg border border-hairline hover:bg-surface-faint text-brand-navy transition-colors"
                          title={t('viewPortal')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
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
