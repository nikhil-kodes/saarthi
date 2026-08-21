'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import {
  PackageCheck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Globe,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function MarketplaceOrdersPage() {
  const t = useTranslations('marketplace');
  const tStatus = useTranslations('status');
  const tCommon = useTranslations('common');
  const params = useParams();

  const locale = (params.locale as string) || 'en';
  const otherLocale = locale === 'en' ? 'hi' : 'en';

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/marketplace/orders');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface-white border-b border-hairline px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-soft-flat">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <SaarthiLogo className="w-8 h-8" />
            <span className="text-title-sm text-ink font-semibold">{tCommon('appName')}</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/marketplace/suppliers"
              className="px-3 py-1.5 rounded-md text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {t('catalogTab')}
            </Link>
            <Link
              href="/marketplace/rfqs"
              className="px-3 py-1.5 rounded-md text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {t('rfqsTab')}
            </Link>
            <Link
              href="/marketplace/orders"
              className="px-3 py-1.5 rounded-md text-body-sm font-semibold text-brand-navy bg-brand-blue-light/50 transition-colors"
            >
              {t('ordersTab')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/marketplace/orders"
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
        {/* Dark-Band Moment #2 per DESIGN.md §8.5 */}
        <div className="rounded-2xl bg-ink text-on-dark p-6 sm:p-8 shadow-soft-raised relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-pill bg-status-success-bg text-status-success font-semibold text-caption">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('escrowBadge')}</span>
              </div>
              <h2 className="text-title-lg font-bold text-on-dark">
                {t('escrowSettlementBannerTitle')}
              </h2>
              <p className="text-body-sm text-neutral-300 max-w-xl">
                {t('escrowSettlementBannerSubtitle')}
              </p>
            </div>

            {/* Purple Sandbox Badge per DESIGN.md §9 */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-sandbox-bg text-sandbox font-semibold text-caption border border-sandbox/20 self-start sm:self-auto">
              <Lock className="w-3.5 h-3.5" />
              <span>Sandbox data · not a live government/bank connection</span>
            </div>
          </div>
        </div>

        {/* Orders Ledger */}
        <div className="bg-surface-white rounded-xl border border-hairline shadow-soft-flat overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-hairline flex items-center justify-between">
            <h2 className="text-body font-semibold text-ink">{t('ordersTab')}</h2>
            <span className="px-2.5 py-1 rounded-pill bg-surface-soft text-neutral-600 font-mono text-caption font-semibold">
              {orders.length} Active Escrow Orders
            </span>
          </div>

          {loading && (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-brand-navy mx-auto" />
              <p className="text-body-sm text-neutral-500">{tCommon('loading')}</p>
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="p-12 text-center text-body-sm text-neutral-500">
              No orders placed yet. Accept bids on the RFQ tab to trigger escrow settlements.
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="divide-y divide-hairline">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 hover:bg-surface-faint transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-pill bg-status-success-bg text-status-success font-semibold text-caption">
                        {tStatus(order.escrowStatus)}
                      </span>
                      <span className="font-mono text-caption text-neutral-400">
                        Order #{order.id.slice(0, 8)}
                      </span>
                    </div>
                    <p className="text-body font-semibold text-ink">
                      Escrow Settlement for RFQ #{order.rfqId?.slice(0, 8)}
                    </p>
                    <p className="text-caption text-neutral-400 font-mono">
                      Locked at: {order.createdAt?.slice(0, 19).replace('T', ' ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-title-sm font-mono font-bold text-ink">
                      ₹{Number(order.amount).toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-surface-soft hover:bg-surface-faint text-neutral-700 font-semibold text-caption border border-hairline transition-colors"
                    >
                      View Escrow Proof
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
