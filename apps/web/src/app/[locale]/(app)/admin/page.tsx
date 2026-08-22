'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import {
  ShieldAlert,
  Building2,
  CheckCircle2,
  FileText,
  AlertOctagon,
  ShoppingBag,
  Megaphone,
  Globe,
  Loader2,
  Search,
  Filter,
  Activity,
} from 'lucide-react';
import {
  AmbientOrbs,
  ArchitecturalGrid,
  SpecularHorizonBeam,
} from '@/components/ui/ambient-background';

export default function AdminDashboardPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const params = useParams();

  const locale = (params.locale as string) || 'en';
  const otherLocale = locale === 'en' ? 'hi' : 'en';

  const [stats, setStats] = useState<any | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, logsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch(`/api/admin/audit-logs${actionFilter ? `?action=${actionFilter}` : ''}`),
      ]);

      const statsJson = await statsRes.json();
      const logsJson = await logsRes.json();

      if (statsJson.success) setStats(statsJson.data);
      if (logsJson.success) setLogs(logsJson.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [actionFilter]);

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
            Platform Admin
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            locale={otherLocale}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-surface-white text-caption font-medium text-ink hover:bg-surface-faint transition-colors border border-hairline"
          >
            <Globe className="w-3.5 h-3.5 text-brand-navy" />
            <span>{otherLocale === 'hi' ? 'हिंदी' : 'English'}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-brand-navy" />
            <h1 className="text-title-lg font-semibold text-ink">{t('title')}</h1>
          </div>
          <p className="text-body-sm text-neutral-500">{t('subtitle')}</p>
        </div>

        {/* Global Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-surface-white rounded-xl border border-hairline p-4 shadow-soft-flat space-y-1">
              <span className="text-caption text-neutral-400 font-medium block">Total MSMEs</span>
              <span className="text-title-lg font-mono font-bold text-ink">
                {stats.totalBusinesses}
              </span>
            </div>
            <div className="bg-surface-white rounded-xl border border-hairline p-4 shadow-soft-flat space-y-1">
              <span className="text-caption text-status-success font-medium block">Verified</span>
              <span className="text-title-lg font-mono font-bold text-status-success">
                {stats.verifiedBusinesses}
              </span>
            </div>
            <div className="bg-surface-white rounded-xl border border-hairline p-4 shadow-soft-flat space-y-1">
              <span className="text-caption text-neutral-400 font-medium block">Filings Proofs</span>
              <span className="text-title-lg font-mono font-bold text-ink">
                {stats.totalFilings}
              </span>
            </div>
            <div className="bg-surface-white rounded-xl border border-hairline p-4 shadow-soft-flat space-y-1">
              <span className="text-caption text-status-danger font-medium block">Open Notices</span>
              <span className="text-title-lg font-mono font-bold text-status-danger">
                {stats.openNotices}
              </span>
            </div>
            <div className="bg-surface-white rounded-xl border border-hairline p-4 shadow-soft-flat space-y-1">
              <span className="text-caption text-neutral-400 font-medium block">B2B Orders</span>
              <span className="text-title-lg font-mono font-bold text-ink">
                {stats.totalMarketplaceOrders}
              </span>
            </div>
            <div className="bg-surface-white rounded-xl border border-hairline p-4 shadow-soft-flat space-y-1">
              <span className="text-caption text-purple-700 font-medium block">Campaigns</span>
              <span className="text-title-lg font-mono font-bold text-purple-700">
                {stats.activeCampaigns}
              </span>
            </div>
          </div>
        )}

        {/* Audit Trail Explorer */}
        <div className="bg-surface-white rounded-xl border border-hairline shadow-soft-flat overflow-hidden space-y-4">
          <div className="p-4 sm:p-6 border-b border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-body font-semibold text-ink">{t('auditTrailTitle')}</h2>
              <p className="text-caption text-neutral-500">{t('auditTrailSubtitle')}</p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('filterActionPlaceholder')}
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full pl-8 pr-3.5 py-1.5 rounded-lg border border-hairline text-caption font-medium text-ink focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          {loading && (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-brand-navy mx-auto" />
              <p className="text-body-sm text-neutral-500">{tCommon('loading')}</p>
            </div>
          )}

          {!loading && logs.length === 0 && (
            <div className="p-12 text-center text-body-sm text-neutral-500">
              No audit logs matching query.
            </div>
          )}

          {!loading && logs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-caption">
                <thead className="bg-surface-soft border-y border-hairline text-neutral-500 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-4">{t('timestamp')}</th>
                    <th className="py-2.5 px-4">{t('action')}</th>
                    <th className="py-2.5 px-4">{t('resource')}</th>
                    <th className="py-2.5 px-4">{t('actor')}</th>
                    <th className="py-2.5 px-4">{t('details')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-faint transition-colors font-mono">
                      <td className="py-3 px-4 text-neutral-400 whitespace-nowrap">
                        {log.createdAt?.slice(0, 19).replace('T', ' ')}
                      </td>
                      <td className="py-3 px-4 font-semibold text-brand-navy whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-neutral-600 whitespace-nowrap">
                        {log.resourceType}
                      </td>
                      <td className="py-3 px-4 text-neutral-400 whitespace-nowrap">
                        {log.actorId ? log.actorId.slice(0, 8) : 'System'}
                      </td>
                      <td className="py-3 px-4 text-neutral-500 max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
