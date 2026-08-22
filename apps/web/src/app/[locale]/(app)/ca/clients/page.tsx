'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  Globe,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Send,
} from 'lucide-react';
import {
  AmbientOrbs,
  ArchitecturalGrid,
  SpecularHorizonBeam,
} from '@/components/ui/ambient-background';

export default function CAPartnerClientsPage() {
  const t = useTranslations('ca');
  const tCommon = useTranslations('common');
  const params = useParams();

  const locale = (params.locale as string) || 'en';
  const otherLocale = locale === 'en' ? 'hi' : 'en';

  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Export Dossier State
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [dossierData, setDossierData] = useState<any | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ca/clients');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setClients(json.data);
      }
    } catch (err) {
      console.error('Failed to load CA clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleExportDossier = async (businessId: string) => {
    try {
      setExportingId(businessId);
      const res = await fetch('/api/compliance/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, format: 'json' }),
      });
      const json = await res.json();
      if (json.success) {
        setDossierData(json.data);
      }
    } catch (err) {
      console.error('Failed to export dossier:', err);
    } finally {
      setExportingId(null);
    }
  };

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

          <span className="px-2.5 py-0.5 rounded-pill bg-brand-blue-light text-brand-navy font-semibold text-caption uppercase">
            CA Partner Portal
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/ca/clients"
            locale={otherLocale}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-surface-white text-caption font-medium text-ink hover:bg-surface-faint transition-colors border border-hairline"
          >
            <Globe className="w-3.5 h-3.5 text-brand-navy" />
            <span>{otherLocale === 'hi' ? 'हिंदी' : 'English'}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-brand-navy" />
            <h1 className="text-title-lg font-semibold text-ink">{t('title')}</h1>
          </div>
          <p className="text-body-sm text-neutral-500">{t('subtitle')}</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center bg-surface-white rounded-xl border border-hairline space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-navy mx-auto" />
            <p className="text-body-sm text-neutral-500">{tCommon('loading')}</p>
          </div>
        )}

        {!loading && clients.length === 0 && (
          <div className="p-12 text-center bg-surface-white rounded-xl border border-hairline space-y-2">
            <p className="text-body font-semibold text-ink">No assigned MSME clients found</p>
            <p className="text-caption text-neutral-500">
              Businesses can invite you via email to review and manage their statutory filings.
            </p>
          </div>
        )}

        {/* Clients Portfolio Grid */}
        {!loading && (
          <div className="space-y-4">
            {clients.map((item) => {
              const b = item.business;

              return (
                <div
                  key={b.id}
                  className="bg-surface-white rounded-xl border border-hairline p-6 shadow-soft-flat hover:shadow-soft-raised transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-pill bg-brand-blue-light text-brand-navy font-semibold text-caption uppercase">
                        {b.sector} · {b.jurisdictionState}
                      </span>
                      {b.isVerified && (
                        <span className="inline-flex items-center gap-1 text-caption text-status-success font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified Entity</span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-title-sm font-semibold text-ink">{b.legalName}</h2>
                    {b.gstin && (
                      <p className="text-caption font-mono text-neutral-500">
                        GSTIN: {b.gstin} · Udyam: {b.udyamNumber || 'N/A'}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-caption pt-1 font-mono">
                      <span>
                        Total Filings: <strong>{item.complianceCount}</strong>
                      </span>
                      {item.overdueCount > 0 ? (
                        <span className="text-status-danger font-semibold">
                          Overdue: {item.overdueCount}
                        </span>
                      ) : (
                        <span className="text-status-success font-semibold">0 Overdue</span>
                      )}
                      {item.dueSoonCount > 0 && (
                        <span className="text-status-warning font-semibold">
                          Due Soon: {item.dueSoonCount}
                        </span>
                      )}
                      {item.healthScore && (
                        <span className="text-brand-navy font-semibold">
                          Score: {item.healthScore} / 900
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleExportDossier(b.id)}
                      disabled={exportingId === b.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-soft hover:bg-surface-faint text-brand-navy font-semibold text-caption border border-hairline transition-colors"
                    >
                      {exportingId === b.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileDown className="w-3.5 h-3.5" />
                      )}
                      <span>{t('exportDossierButton')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Exported Dossier Modal */}
        {dossierData && (
          <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-white rounded-xl border border-hairline max-w-2xl w-full p-6 space-y-4 shadow-soft-raised max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-title-sm font-semibold text-ink">
                    Official Statutory Compliance Dossier
                  </h3>
                  <p className="text-caption font-mono text-neutral-400">
                    {dossierData.exportId} · Generated: {dossierData.generatedAt?.slice(0, 19)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDossierData(null)}
                  className="text-neutral-400 hover:text-ink text-caption font-semibold"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3 text-caption font-mono">
                <div className="p-3.5 bg-surface-soft rounded-lg space-y-1">
                  <p className="font-bold text-ink">{dossierData.business?.legal_name}</p>
                  <p className="text-neutral-500">
                    PAN: {dossierData.business?.pan} · GSTIN: {dossierData.business?.gstin}
                  </p>
                  <p className="text-status-success font-semibold">
                    Trust Protocol: Verified 5-Pillar Score:{' '}
                    {dossierData.healthScore?.score || 'N/A'} / 900
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-ink block">Compliance Metrics</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 border border-hairline rounded bg-surface-white">
                      <span className="text-neutral-400 block">Total Requirements</span>
                      <span className="font-bold text-ink">
                        {dossierData.complianceSummary?.totalInstances}
                      </span>
                    </div>
                    <div className="p-2.5 border border-hairline rounded bg-surface-white">
                      <span className="text-status-success block">Compliant</span>
                      <span className="font-bold text-status-success">
                        {dossierData.complianceSummary?.compliantInstances}
                      </span>
                    </div>
                    <div className="p-2.5 border border-hairline rounded bg-surface-white">
                      <span className="text-status-danger block">Overdue</span>
                      <span className="font-bold text-status-danger">
                        {dossierData.complianceSummary?.overdueInstances}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-ink block">
                    Recorded Filing Ack Proofs ({dossierData.filingRecords?.length || 0})
                  </span>
                  <div className="max-h-40 overflow-y-auto divide-y divide-hairline border border-hairline rounded p-2 bg-surface-white">
                    {dossierData.filingRecords?.map((f: any) => (
                      <div key={f.id} className="py-1.5 flex items-center justify-between">
                        <span>Ack: {f.acknowledgement_number || 'N/A'}</span>
                        <span className="text-neutral-400">{f.filed_at?.slice(0, 10)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setDossierData(null)}
                  className="px-4 py-2 rounded-lg bg-ink text-on-dark font-semibold text-caption hover:bg-ink-pressed"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
