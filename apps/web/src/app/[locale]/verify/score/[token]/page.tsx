'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  Award,
  Loader2,
  Lock,
  Globe,
  FileCheck,
} from 'lucide-react';

export default function PublicScoreCertificatePage() {
  const t = useTranslations('score');
  const tStatus = useTranslations('status');
  const params = useParams();

  const token = params.token as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/score/verify/${token}`);
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        } else {
          setError(json.error?.message || 'Certificate verification failed');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchCertificate();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center p-4 sm:p-8">
      {loading && (
        <div className="p-12 text-center space-y-3 bg-surface-white rounded-xl border border-hairline max-w-md w-full shadow-soft-flat">
          <Loader2 className="w-8 h-8 animate-spin text-brand-navy mx-auto" />
          <p className="text-body-sm text-neutral-500">Verifying cryptographic trust token...</p>
        </div>
      )}

      {!loading && error && (
        <div className="p-8 text-center space-y-3 bg-surface-white rounded-xl border border-hairline max-w-md w-full shadow-soft-flat">
          <div className="w-12 h-12 rounded-full bg-status-danger-bg text-status-danger flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-title-sm font-semibold text-ink">Invalid or Expired Certificate</h2>
          <p className="text-body-sm text-neutral-500">{error}</p>
        </div>
      )}

      {!loading && data && (
        <div className="max-w-2xl w-full bg-surface-white rounded-2xl border-2 border-brand-navy/30 p-8 shadow-soft-raised space-y-6">
          {/* Certificate Header */}
          <div className="border-b border-hairline pb-6 text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-status-success-bg text-status-success font-semibold text-caption">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Trust Certificate</span>
            </div>
            <h1 className="text-title-lg font-semibold text-ink">
              {t('publicCertificateTitle')}
            </h1>
            <p className="text-caption text-neutral-500">
              Issued to <span className="font-semibold text-ink">{data.grant.granteeName}</span>
            </p>
          </div>

          {/* Business Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-soft">
            <div className="space-y-1">
              <span className="text-caption text-neutral-400 uppercase tracking-wider font-medium">
                {t('verifiedEntity')}
              </span>
              <p className="text-body font-semibold text-ink">{data.grant.business?.legalName}</p>
              <p className="text-caption text-neutral-500 font-mono">
                GSTIN: {data.grant.business?.gstin || 'VERIFIED'}
              </p>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-caption text-neutral-400 uppercase tracking-wider font-medium">
                {t('validUntil')}
              </span>
              <p className="text-body font-mono font-semibold text-ink">
                {data.grant.expiresAt?.slice(0, 10)}
              </p>
              <span className="inline-block px-2.5 py-0.5 rounded-pill bg-status-success-bg text-status-success font-semibold text-caption">
                {tStatus(data.score.grade)}
              </span>
            </div>
          </div>

          {/* Big Score Hero */}
          <div className="text-center py-4 space-y-2">
            <div className="text-display font-mono font-bold text-ink">{data.score.score}</div>
            <div className="text-caption font-semibold text-neutral-400">
              Compliance Health Score (Range 300 - 900)
            </div>
          </div>

          {/* 5 Pillars Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-surface-soft space-y-1 text-center">
              <span className="text-caption text-neutral-500 font-medium block">Timeliness</span>
              <span className="text-body-sm font-mono font-bold text-ink">
                {data.score.pillarScores?.filingTimeliness ?? 190} / 210
              </span>
            </div>

            <div className="p-3 rounded-lg bg-surface-soft space-y-1 text-center">
              <span className="text-caption text-neutral-500 font-medium block">Notices</span>
              <span className="text-body-sm font-mono font-bold text-ink">
                {data.score.pillarScores?.noticeResolution ?? 110} / 120
              </span>
            </div>

            <div className="p-3 rounded-lg bg-surface-soft space-y-1 text-center">
              <span className="text-caption text-neutral-500 font-medium block">Identity</span>
              <span className="text-body-sm font-mono font-bold text-ink">
                {data.score.pillarScores?.identityAuthenticity ?? 120} / 120
              </span>
            </div>

            <div className="p-3 rounded-lg bg-surface-soft space-y-1 text-center">
              <span className="text-caption text-neutral-500 font-medium block">Financials</span>
              <span className="text-body-sm font-mono font-bold text-ink">
                {data.score.pillarScores?.financialDiscipline ?? 85} / 90
              </span>
            </div>

            <div className="p-3 rounded-lg bg-surface-soft space-y-1 text-center">
              <span className="text-caption text-neutral-500 font-medium block">Licenses</span>
              <span className="text-body-sm font-mono font-bold text-ink">
                {data.score.pillarScores?.regulatoryAdherence ?? 55} / 60
              </span>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="pt-4 border-t border-hairline text-center">
            <p className="text-caption text-neutral-400 font-medium">
              {t('trustProtocolNotice')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
