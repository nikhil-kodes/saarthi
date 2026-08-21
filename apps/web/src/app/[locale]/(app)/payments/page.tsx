'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldCheck,
  Globe,
  Loader2,
  ArrowRight,
  Lock,
} from 'lucide-react';

export default function PaymentsBillingPage() {
  const t = useTranslations('payments');
  const tStatus = useTranslations('status');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const params = useParams();

  const locale = (params.locale as string) || 'en';
  const isHi = locale === 'hi';
  const otherLocale = isHi ? 'en' : 'hi';

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [refundingId, setRefundingId] = useState<string | null>(null);

  const [selectedPurpose, setSelectedPurpose] = useState('Compliance Monthly Filing Fee');
  const [amount, setAmount] = useState<number>(1499);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payments/transactions');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTransactions(json.data);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPaying(true);
      const orderRes = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount * 100,
          currency: 'INR',
          purpose: selectedPurpose,
        }),
      });
      const orderJson = await orderRes.json();
      if (!orderJson.success) throw new Error(orderJson.error?.message || 'Order creation failed');

      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderJson.data.orderId,
          paymentId: `pay_sim_${Date.now()}`,
          signature: 'simulated_valid_sha256_sig',
          purpose: selectedPurpose,
          amount: amount * 100,
        }),
      });
      const verifyJson = await verifyRes.json();
      if (verifyJson.success) {
        await fetchTransactions();
      }
    } catch (err) {
      console.error('Payment checkout failed:', err);
    } finally {
      setPaying(false);
    }
  };

  const handleRefund = async (paymentId: string, refundAmount: number) => {
    try {
      setRefundingId(paymentId);
      const res = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          amount: refundAmount,
          reason: 'Customer Escrow Refund Requested',
        }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchTransactions();
      }
    } catch (err) {
      console.error('Refund failed:', err);
    } finally {
      setRefundingId(null);
    }
  };

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
              href="/schemes"
              className="px-3 py-1.5 rounded-md text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('schemes')}
            </Link>
            <Link
              href="/payments"
              className="px-3 py-1.5 rounded-md text-body-sm font-semibold text-brand-navy bg-brand-blue-light/50 transition-colors"
            >
              {tNav('payments')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/payments"
            locale={otherLocale}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-surface-white text-caption font-medium text-ink hover:bg-surface-faint transition-colors border border-hairline"
          >
            <Globe className="w-3.5 h-3.5 text-brand-navy" />
            <span>{otherLocale === 'hi' ? 'हिंदी' : 'English'}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-6 h-6 text-brand-navy" />
              <h1 className="text-title-lg font-semibold text-ink">{t('title')}</h1>
            </div>
            <p className="text-body-sm text-neutral-500">{t('subtitle')}</p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-sandbox-bg text-sandbox font-semibold text-caption border border-sandbox/20 self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5" />
            <span>{t('sandboxBadge')}</span>
          </div>
        </div>

        {/* Checkout Simulator Form */}
        <div className="bg-surface-white rounded-xl border border-hairline p-6 shadow-soft-flat space-y-4">
          <h2 className="text-body font-semibold text-ink">{t('checkoutTitle')}</h2>
          <p className="text-body-sm text-neutral-500">{t('checkoutSubtitle')}</p>

          <form onSubmit={handleCreatePayment} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-caption font-medium text-neutral-600 block mb-1.5">
                  {t('purposeLabel')}
                </label>
                <select
                  value={selectedPurpose}
                  onChange={(e) => {
                    setSelectedPurpose(e.target.value);
                    if (e.target.value.includes('Filing')) setAmount(1499);
                    else if (e.target.value.includes('CA')) setAmount(2499);
                    else setAmount(4999);
                  }}
                  className="w-full px-3.5 py-2 rounded-lg bg-surface-white border border-hairline text-caption font-medium text-ink focus:outline-none focus:border-brand-blue"
                >
                  <option value="Compliance Monthly Filing Fee">
                    {isHi ? 'मासिक अनुपालन फाइलिंग शुल्क (₹1,499)' : 'Compliance Monthly Filing Fee (₹1,499)'}
                  </option>
                  <option value="CA Expert Legal Consultation">
                    {isHi ? 'सीए विशेषज्ञ विधिक परामर्श (₹2,499)' : 'CA Expert Legal Consultation (₹2,499)'}
                  </option>
                  <option value="Saarthi Pro Annual Platform Subscription">
                    {isHi ? 'सारथी प्रो वार्षिक सदस्यता (₹4,999)' : 'Saarthi Pro Annual Subscription (₹4,999)'}
                  </option>
                </select>
              </div>

              <div>
                <label className="text-caption font-medium text-neutral-600 block mb-1.5">
                  {t('amountLabel')}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-lg bg-surface-white border border-hairline text-caption font-mono font-bold text-ink focus:outline-none focus:border-brand-blue"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={paying}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-ink text-on-dark font-semibold text-button hover:bg-ink-pressed disabled:bg-neutral-300 transition-colors shadow-soft-flat"
            >
              {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>{paying ? t('paying') : `${t('payButton')} · ₹${amount.toLocaleString('en-IN')}`}</span>
            </button>
          </form>
        </div>

        {/* Transactions Table */}
        <div className="bg-surface-white rounded-xl border border-hairline shadow-soft-flat overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-hairline flex items-center justify-between">
            <h2 className="text-body font-semibold text-ink">{t('transactionsTitle')}</h2>
            <span className="px-2.5 py-1 rounded-pill bg-surface-soft text-neutral-600 font-mono text-caption font-semibold">
              {transactions.length} {isHi ? 'रिकॉर्ड' : 'Records'}
            </span>
          </div>

          {loading && (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-brand-navy mx-auto" />
              <p className="text-body-sm text-neutral-500">{tCommon('loading')}</p>
            </div>
          )}

          {!loading && transactions.length === 0 && (
            <div className="p-12 text-center text-body-sm text-neutral-500">
              {isHi
                ? 'अभी तक कोई लेनदेन दर्ज नहीं हुआ है। भुगतान का परीक्षण करने के लिए ऊपर दिए गए फॉर्म का उपयोग करें।'
                : 'No transactions recorded yet. Use the checkout form above to simulate a payment.'}
            </div>
          )}

          {!loading && transactions.length > 0 && (
            <div className="divide-y divide-hairline">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-5 hover:bg-surface-faint transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-pill font-semibold text-caption ${
                          tx.status === 'captured'
                            ? 'bg-status-success-bg text-status-success'
                            : tx.status === 'refunded'
                            ? 'bg-status-warning-bg text-status-warning'
                            : 'bg-surface-soft text-neutral-600'
                        }`}
                      >
                        {tStatus(tx.status)}
                      </span>
                      <span className="font-mono text-caption text-neutral-400">
                        {tx.providerOrderId}
                      </span>
                    </div>
                    <p className="text-body font-medium text-ink">{tx.purpose}</p>
                    <p className="text-caption text-neutral-400 font-mono">
                      {tx.createdAt?.slice(0, 19).replace('T', ' ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-title-sm font-mono font-bold text-ink">
                      ₹{Number(tx.amount).toLocaleString('en-IN')}
                    </span>

                    {tx.status === 'captured' && (
                      <button
                        type="button"
                        onClick={() => handleRefund(tx.id, Number(tx.amount))}
                        disabled={refundingId === tx.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-surface-soft hover:bg-surface-faint text-neutral-700 font-semibold text-caption border border-hairline transition-colors"
                      >
                        {refundingId === tx.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
                        )}
                        <span>{t('refundButton')}</span>
                      </button>
                    )}
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
