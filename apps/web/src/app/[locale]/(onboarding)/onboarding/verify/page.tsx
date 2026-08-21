'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import type { VerificationCheck, VerificationStatus } from '@saarthi/shared-types';

export default function VerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas">
          <Loader2 className="w-8 h-8 animate-spin text-brand-navy" />
        </div>
      }
    >
      <VerificationContent />
    </Suspense>
  );
}

function VerificationContent() {
  const t = useTranslations('verification');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();
  const router = useRouter();

  const businessId = searchParams.get('businessId') || '';

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<VerificationStatus>('unverified');
  const [checks, setChecks] = useState<VerificationCheck[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleStartVerification = async () => {
    if (!businessId) {
      setError('Missing business ID for verification.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/business/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Verification process failed.');
        setLoading(false);
        return;
      }

      setStatus(json.data.result.status);
      setChecks(json.data.result.checks);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during verification.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Main Verification Card */}
        <div className="w-full bg-surface-white rounded-xl shadow-soft-raised border border-hairline p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            {/* MANDATORY Sandbox Tag per DESIGN.md §9 */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-sandbox-bg text-sandbox text-caption font-semibold border border-sandbox/20">
              <span className="w-2 h-2 rounded-pill bg-sandbox" />
              <span>{t('sandboxBadge')}</span>
            </div>

            <h1 className="text-title-md font-semibold text-ink">{t('title')}</h1>
            <p className="text-body-sm text-neutral-500">{t('subtitle')}</p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3.5 rounded-md bg-status-danger-bg border border-status-danger/20 flex items-start gap-2.5 text-body-sm text-status-danger">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Initial State / Start Verification Button */}
          {status === 'unverified' && !loading && (
            <div className="p-6 rounded-lg bg-surface-soft border border-hairline text-center space-y-4">
              <ShieldCheck className="w-12 h-12 text-brand-navy mx-auto" />
              <p className="text-body text-neutral-700 max-w-md mx-auto">
                Trigger automated checks against simulated MCA, GSTN, Udyam, and FSSAI registries to establish your business trust badge.
              </p>
              <button
                type="button"
                onClick={handleStartVerification}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-ink text-on-dark font-semibold text-button hover:bg-ink-pressed transition-colors"
              >
                <span>{t('startVerification')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="p-8 rounded-lg bg-surface-soft border border-hairline text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-brand-navy mx-auto" />
              <p className="text-body font-medium text-ink">{t('verifying')}</p>
            </div>
          )}

          {/* Completed State Check Breakdown */}
          {status === 'verified' && (
            <div className="space-y-4">
              {/* Moment #3: Verified Badge / Dark Band Moment per DESIGN.md §8.5 & §2.1 */}
              <div className="p-6 rounded-xl bg-surface-dark text-on-dark border border-hairline-on-dark shadow-dark-band-raised space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-status-success/20 text-status-success text-caption font-semibold border border-status-success/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>VERIFIED BUSINESS</span>
                  </div>
                  <span className="text-caption text-on-dark-muted font-mono">
                    ID: {businessId.slice(0, 8)}...
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-title-sm font-semibold text-on-dark">
                    {t('verifiedSuccessTitle')}
                  </h3>
                  <p className="text-body-sm text-on-dark-muted">
                    {t('verifiedSuccessSubtitle')}
                  </p>
                </div>
              </div>

              {/* Individual Registry Checks */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-caption uppercase tracking-wider text-neutral-500 font-semibold">
                  Registry Verification Results
                </h4>

                {checks.map((check, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-surface-soft border border-hairline flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-body-sm text-ink uppercase font-mono">
                          {check.type}
                        </span>
                        <span className="text-caption text-neutral-500 font-mono">
                          ({check.identifier})
                        </span>
                      </div>
                      <p className="text-caption text-neutral-700">{check.message}</p>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-status-success-bg text-status-success text-caption font-semibold shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Proceed to Dashboard CTA */}
              <div className="pt-4 border-t border-hairline">
                <Link
                  href="/dashboard"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-ink text-on-dark font-semibold text-button hover:bg-ink-pressed transition-colors"
                >
                  <span>{t('proceedToDashboard')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
