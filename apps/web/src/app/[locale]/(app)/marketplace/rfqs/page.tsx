'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  Loader2,
  Globe,
  PlusCircle,
} from 'lucide-react';

export default function MarketplaceRFQsPage() {
  const t = useTranslations('marketplace');
  const tStatus = useTranslations('status');
  const tCommon = useTranslations('common');
  const params = useParams();

  const locale = (params.locale as string) || 'en';
  const otherLocale = locale === 'en' ? 'hi' : 'en';

  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quote Submission State
  const [selectedRfq, setSelectedRfq] = useState<any | null>(null);
  const [quoteUnitPrice, setQuoteUnitPrice] = useState<number>(30);
  const [quoteDeliveryDays, setQuoteDeliveryDays] = useState<number>(7);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/marketplace/rfqs');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRfqs(json.data);
      }
    } catch (err) {
      console.error('Failed to load RFQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq) return;

    try {
      setSubmittingQuote(true);
      const totalAmount = quoteUnitPrice * selectedRfq.requiredQuantity;
      const res = await fetch(`/api/marketplace/rfqs/${selectedRfq.id}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitPrice: quoteUnitPrice,
          totalAmount,
          validityDays: 15,
          deliveryDays: quoteDeliveryDays,
          notes: quoteNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setQuoteSuccess(true);
        setTimeout(() => {
          setQuoteSuccess(false);
          setSelectedRfq(null);
          fetchRFQs();
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to submit quote:', err);
    } finally {
      setSubmittingQuote(false);
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
              href="/marketplace/suppliers"
              className="px-3 py-1.5 rounded-md text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {t('catalogTab')}
            </Link>
            <Link
              href="/marketplace/rfqs"
              className="px-3 py-1.5 rounded-md text-body-sm font-semibold text-brand-navy bg-brand-blue-light/50 transition-colors"
            >
              {t('rfqsTab')}
            </Link>
            <Link
              href="/marketplace/orders"
              className="px-3 py-1.5 rounded-md text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {t('ordersTab')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/marketplace/rfqs"
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
            <FileSpreadsheet className="w-6 h-6 text-brand-navy" />
            <h1 className="text-title-lg font-semibold text-ink">{t('rfqsTab')}</h1>
          </div>
          <p className="text-body-sm text-neutral-500">
            Live procurement requests open for quotation with compliance trust score gates.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center bg-surface-white rounded-xl border border-hairline space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-navy mx-auto" />
            <p className="text-body-sm text-neutral-500">{tCommon('loading')}</p>
          </div>
        )}

        {/* RFQs List */}
        {!loading && (
          <div className="space-y-4">
            {rfqs.map((rfq) => (
              <div
                key={rfq.id}
                className="bg-surface-white rounded-xl border border-hairline p-6 shadow-soft-flat hover:shadow-soft-raised transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-pill bg-brand-blue-light text-brand-navy font-semibold text-caption uppercase">
                      {rfq.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-pill bg-surface-soft text-neutral-600 font-medium text-caption">
                      {tStatus(rfq.status)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-caption text-purple-700 font-mono font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Min Score {rfq.minComplianceScore}+</span>
                    </span>
                  </div>

                  <h3 className="text-title-sm font-semibold text-ink">{rfq.title}</h3>
                  <p className="text-body-sm text-neutral-600 line-clamp-2">{rfq.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-caption text-neutral-500 pt-1 font-mono">
                    <span>
                      Qty: <strong>{rfq.requiredQuantity} {rfq.unit}</strong>
                    </span>
                    {rfq.targetBudget && (
                      <span>
                        Budget: <strong>₹{Number(rfq.targetBudget).toLocaleString('en-IN')}</strong>
                      </span>
                    )}
                    <span>
                      PIN: <strong>{rfq.deliveryPincode}</strong>
                    </span>
                    <span>
                      Quotes: <strong>{rfq.quotesCount || 0}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRfq(rfq);
                      setQuoteUnitPrice(Math.round((rfq.targetBudget || 10000) / rfq.requiredQuantity));
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ink text-on-dark hover:bg-ink-pressed font-semibold text-caption transition-colors shadow-soft-flat"
                  >
                    <span>Submit Bid</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Quote Modal */}
        {selectedRfq && (
          <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-white rounded-xl border border-hairline max-w-lg w-full p-6 space-y-4 shadow-soft-raised">
              <div className="space-y-1">
                <h3 className="text-title-sm font-semibold text-ink">
                  {t('submitQuoteTitle')}
                </h3>
                <p className="text-caption text-neutral-500">
                  {selectedRfq.title} ({selectedRfq.requiredQuantity} {selectedRfq.unit})
                </p>
              </div>

              {quoteSuccess ? (
                <div className="p-6 text-center space-y-2 bg-status-success-bg text-status-success rounded-lg">
                  <CheckCircle2 className="w-8 h-8 mx-auto" />
                  <p className="font-semibold text-body-sm">{t('quoteSubmittedSuccess')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitQuote} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-caption font-medium text-neutral-600 block mb-1">
                        {t('quoteUnitPriceLabel')}
                      </label>
                      <input
                        type="number"
                        required
                        value={quoteUnitPrice}
                        onChange={(e) => setQuoteUnitPrice(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-lg border border-hairline text-caption font-mono font-bold text-ink"
                      />
                    </div>
                    <div>
                      <label className="text-caption font-medium text-neutral-600 block mb-1">
                        {t('leadTimeLabel')}
                      </label>
                      <input
                        type="number"
                        required
                        value={quoteDeliveryDays}
                        onChange={(e) => setQuoteDeliveryDays(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-lg border border-hairline text-caption font-mono font-bold text-ink"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-surface-soft flex items-center justify-between text-caption">
                    <span className="font-medium text-neutral-600">{t('quoteTotalAmountLabel')}</span>
                    <span className="font-mono font-bold text-title-sm text-ink">
                      ₹{(quoteUnitPrice * selectedRfq.requiredQuantity).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <label className="text-caption font-medium text-neutral-600 block mb-1">
                      {t('notesLabel')}
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Include freight terms, tax breakdown, or material guarantee details..."
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-hairline text-caption font-medium text-ink"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRfq(null)}
                      className="px-4 py-2 rounded-lg border border-hairline font-semibold text-caption text-neutral-600 hover:bg-surface-faint"
                    >
                      {tCommon('cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={submittingQuote}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ink text-on-dark font-semibold text-caption hover:bg-ink-pressed disabled:bg-neutral-300"
                    >
                      {submittingQuote ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>{t('submitQuoteButton')}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
