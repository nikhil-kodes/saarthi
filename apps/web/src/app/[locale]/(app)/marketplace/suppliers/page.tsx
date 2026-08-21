'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import {
  Store,
  Package,
  PlusCircle,
  CheckCircle2,
  Filter,
  Search,
  Globe,
  Loader2,
  Building2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Send,
} from 'lucide-react';

export default function SupplierMarketplacePage() {
  const t = useTranslations('marketplace');
  const tCommon = useTranslations('common');
  const params = useParams();

  const locale = (params.locale as string) || 'en';
  const otherLocale = locale === 'en' ? 'hi' : 'en';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // RFQ Modal State
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [rfqTitle, setRfqTitle] = useState('');
  const [rfqCategory, setRfqCategory] = useState('packaging');
  const [rfqDesc, setRfqDesc] = useState('');
  const [rfqQty, setRfqQty] = useState(500);
  const [rfqUnit, setRfqUnit] = useState('box');
  const [rfqBudget, setRfqBudget] = useState(25000);
  const [rfqScoreGate, setRfqScoreGate] = useState(700);
  const [submittingRfq, setSubmittingRfq] = useState(false);
  const [rfqSuccess, setRfqSuccess] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url =
        selectedCategory === 'ALL'
          ? '/api/marketplace/products'
          : `/api/marketplace/products?category=${selectedCategory}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleCreateRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingRfq(true);
      const res = await fetch('/api/marketplace/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: rfqTitle,
          category: rfqCategory,
          description: rfqDesc,
          requiredQuantity: rfqQty,
          unit: rfqUnit,
          targetBudget: rfqBudget,
          deliveryPincode: '201301',
          minComplianceScore: rfqScoreGate,
          expiresInDays: 14,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setRfqSuccess(true);
        setTimeout(() => {
          setRfqSuccess(false);
          setShowRfqModal(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to post RFQ:', err);
    } finally {
      setSubmittingRfq(false);
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
              className="px-3 py-1.5 rounded-md text-body-sm font-semibold text-brand-navy bg-brand-blue-light/50 transition-colors"
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
              className="px-3 py-1.5 rounded-md text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {t('ordersTab')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/marketplace/suppliers"
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
        {/* Title & Create RFQ CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Store className="w-6 h-6 text-brand-navy" />
              <h1 className="text-title-lg font-semibold text-ink">{t('title')}</h1>
            </div>
            <p className="text-body-sm text-neutral-500">{t('subtitle')}</p>
          </div>

          <button
            onClick={() => setShowRfqModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-ink text-on-dark hover:bg-ink-pressed font-semibold text-button transition-colors shadow-soft-flat self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('createRfq')}</span>
          </button>
        </div>

        {/* Category Filters */}
        <div className="bg-surface-white rounded-xl border border-hairline p-4 flex items-center gap-2 shadow-soft-flat overflow-x-auto text-caption">
          {['ALL', 'packaging', 'raw_ingredients', 'machinery', 'safety_gear'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-pill font-medium transition-colors uppercase ${
                selectedCategory === cat
                  ? 'bg-brand-navy text-on-dark font-semibold'
                  : 'bg-surface-soft text-neutral-600 hover:bg-surface-faint'
              }`}
            >
              {cat === 'ALL'
                ? 'All Categories'
                : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading && (
          <div className="p-12 text-center bg-surface-white rounded-xl border border-hairline space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-navy mx-auto" />
            <p className="text-body-sm text-neutral-500">{tCommon('loading')}</p>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const displayTitle =
                locale === 'hi' && product.titleHi ? product.titleHi : product.title;

              return (
                <div
                  key={product.id}
                  className="bg-surface-white rounded-xl border border-hairline p-5 shadow-soft-flat hover:shadow-soft-raised transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-pill bg-brand-blue-light text-brand-navy font-semibold text-caption uppercase">
                        {product.category.replace('_', ' ')}
                      </span>
                      <span className="inline-flex items-center gap-1 text-caption text-status-success font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>GST & Udyam Verified</span>
                      </span>
                    </div>

                    <h3 className="text-body font-semibold text-ink line-clamp-2">
                      {displayTitle}
                    </h3>
                    <p className="text-caption text-neutral-500 line-clamp-3">
                      {product.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-hairline">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-caption text-neutral-400 block font-medium">
                          Unit Price
                        </span>
                        <span className="text-title-sm font-mono font-bold text-ink">
                          ₹{Number(product.unitPrice).toLocaleString('en-IN')}
                          <span className="text-caption text-neutral-400 font-normal">
                            {' '}
                            / {product.unit}
                          </span>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-caption text-neutral-400 block font-medium">
                          MOQ · Lead Time
                        </span>
                        <span className="text-caption font-mono font-semibold text-ink">
                          {product.minOrderQuantity} {product.unit} · {product.leadTimeDays}d
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setRfqTitle(`Inquiry for ${displayTitle}`);
                        setRfqCategory(product.category);
                        setRfqUnit(product.unit);
                        setShowRfqModal(true);
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surface-soft hover:bg-surface-faint font-semibold text-caption text-brand-navy border border-hairline transition-colors"
                    >
                      <span>Request Custom Quotation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create RFQ Modal */}
        {showRfqModal && (
          <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-white rounded-xl border border-hairline max-w-lg w-full p-6 space-y-4 shadow-soft-raised">
              <div className="space-y-1">
                <h3 className="text-title-sm font-semibold text-ink">
                  {t('postRfqTitle')}
                </h3>
                <p className="text-caption text-neutral-500">
                  {t('postRfqSubtitle')}
                </p>
              </div>

              {rfqSuccess ? (
                <div className="p-6 text-center space-y-2 bg-status-success-bg text-status-success rounded-lg">
                  <CheckCircle2 className="w-8 h-8 mx-auto" />
                  <p className="font-semibold text-body-sm">RFQ Published to Verified Suppliers!</p>
                </div>
              ) : (
                <form onSubmit={handleCreateRFQ} className="space-y-3.5">
                  <div>
                    <label className="text-caption font-medium text-neutral-600 block mb-1">
                      {t('rfqTitleLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('rfqTitlePlaceholder')}
                      value={rfqTitle}
                      onChange={(e) => setRfqTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-hairline text-caption font-medium text-ink focus:outline-none focus:border-brand-blue"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-caption font-medium text-neutral-600 block mb-1">
                        {t('quantityLabel')}
                      </label>
                      <input
                        type="number"
                        required
                        value={rfqQty}
                        onChange={(e) => setRfqQty(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-lg border border-hairline text-caption font-mono font-bold text-ink"
                      />
                    </div>
                    <div>
                      <label className="text-caption font-medium text-neutral-600 block mb-1">
                        {t('targetBudgetLabel')}
                      </label>
                      <input
                        type="number"
                        value={rfqBudget}
                        onChange={(e) => setRfqBudget(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-lg border border-hairline text-caption font-mono font-bold text-ink"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-caption font-medium text-neutral-600 block mb-1">
                      {t('minScoreGateLabel')}
                    </label>
                    <select
                      value={rfqScoreGate}
                      onChange={(e) => setRfqScoreGate(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-lg border border-hairline text-caption font-medium text-ink"
                    >
                      <option value="600">600+ (Standard Cash/Advance Terms)</option>
                      <option value="700">700+ (AA Trust Gate · 30-Day Credit Eligible)</option>
                      <option value="800">800+ (AAA Prime Gate · 60-Day Credit Eligible)</option>
                    </select>
                    <p className="text-caption text-neutral-400 mt-1">{t('minScoreGateHint')}</p>
                  </div>

                  <div>
                    <label className="text-caption font-medium text-neutral-600 block mb-1">
                      Specifications & Delivery Requirements
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Specify material grades, GSM, test certifications, or packaging requirements..."
                      value={rfqDesc}
                      onChange={(e) => setRfqDesc(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-hairline text-caption font-medium text-ink"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRfqModal(false)}
                      className="px-4 py-2 rounded-lg border border-hairline font-semibold text-caption text-neutral-600 hover:bg-surface-faint"
                    >
                      {tCommon('cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={submittingRfq}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ink text-on-dark font-semibold text-caption hover:bg-ink-pressed disabled:bg-neutral-300"
                    >
                      {submittingRfq ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Post RFQ</span>
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
