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
  AlertTriangle,
  FileText,
  Building2,
  Calculator,
  Plus,
  Scale,
  Send,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  X,
  Copy,
  Check,
} from 'lucide-react';
import {
  AmbientOrbs,
  ArchitecturalGrid,
  SpecularHorizonBeam,
} from '@/components/ui/ambient-background';

export default function PaymentsBillingPage() {
  const t = useTranslations('payments');
  const tStatus = useTranslations('status');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const params = useParams();

  const locale = (params.locale as string) || 'en';
  const isHi = locale === 'hi';
  const otherLocale = isHi ? 'en' : 'hi';

  // Active View Tab: 'claims' (MSMED Delayed Payment Assistant) or 'billing' (Platform checkout & refunds)
  const [activeTab, setActiveTab] = useState<'claims' | 'billing'>('claims');

  // Transactions State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [paying, setPaying] = useState(false);
  const [refundingId, setRefundingId] = useState<string | null>(null);

  // Delayed Claims State
  const [claimsData, setClaimsData] = useState<any | null>(null);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [selectedClaimForNotice, setSelectedClaimForNotice] = useState<any | null>(null);
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // New Claim Form
  const [buyerName, setBuyerName] = useState('');
  const [buyerGstin, setBuyerGstin] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);

  // Checkout State
  const [selectedPurpose, setSelectedPurpose] = useState('Compliance Monthly Filing Fee');
  const [amount, setAmount] = useState<number>(1499);

  const fetchTransactions = async () => {
    try {
      setLoadingTx(true);
      const res = await fetch('/api/payments/transactions');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTransactions(json.data);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoadingTx(false);
    }
  };

  const fetchClaims = async () => {
    try {
      setLoadingClaims(true);
      const res = await fetch('/api/payments/claims');
      const json = await res.json();
      if (json.success) {
        setClaimsData(json.data);
      }
    } catch (err) {
      console.error('Failed to load delayed claims:', err);
    } finally {
      setLoadingClaims(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchClaims();
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

  const handleAddClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !invoiceNumber || !invoiceDate || !dueDate || !invoiceAmount) return;

    try {
      setSubmittingClaim(true);
      const res = await fetch('/api/payments/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName,
          buyerGstin,
          invoiceNumber,
          invoiceDate,
          dueDate,
          invoiceAmount: Number(invoiceAmount),
          notes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowNewClaimModal(false);
        setBuyerName('');
        setBuyerGstin('');
        setInvoiceNumber('');
        setInvoiceDate('');
        setDueDate('');
        setInvoiceAmount('');
        setNotes('');
        await fetchClaims();
      }
    } catch (err) {
      console.error('Failed to add claim:', err);
    } finally {
      setSubmittingClaim(false);
    }
  };

  const generateDemandNoticeText = (claim: any) => {
    return `LEGAL INTIMATION / STATUTORY DEMAND NOTICE UNDER SECTION 15 & 16 OF THE MSMED ACT, 2006

To:
The Finance Director / Managing Director,
${claim.buyer_name}
${claim.buyer_gstin ? `GSTIN: ${claim.buyer_gstin}` : ''}

Date: ${new Date().toLocaleDateString('en-GB')}
Subject: Statutory Demand for Outstanding Payment of INR ${claim.invoice_amount?.toLocaleString('en-IN')} plus Compound Interest under MSMED Act, 2006 against Invoice No: ${claim.invoice_number}

Dear Sir/Madam,

1. We are a registered Micro/Small Enterprise under the Micro, Small and Medium Enterprises Development (MSMED) Act, 2006.

2. That against our Invoice No. ${claim.invoice_number} dated ${claim.invoice_date}, goods/services were supplied to your satisfaction. The statutory credit period of maximum 45 days expired on ${claim.due_date}.

3. As of today, the payment is overdue by ${claim.delay_days} days.

4. In accordance with SECTION 16 of the MSMED Act, 2006, the buyer is statutorily liable to pay compound interest with monthly rests at THREE TIMES THE BANK RATE notified by the Reserve Bank of India (currently 20.25% p.a.).

FINANCIAL SUMMARY OF CLAIM:
- Principal Outstanding: ₹${claim.invoice_amount?.toLocaleString('en-IN')}
- Compounded Penal Interest (${claim.interest_rate}% p.a.): ₹${claim.interest_amount?.toLocaleString('en-IN')}
- TOTAL STATUTORY CLAIM: ₹${((claim.invoice_amount || 0) + (claim.interest_amount || 0)).toLocaleString('en-IN')}

5. You are hereby called upon to release the total payment within SEVEN (7) DAYS of receipt of this notice, failing which we shall file a formal reference before the MSME Facilitation Council under Section 18 of the MSMED Act via the MSME Samadhan Portal without further notice.

Yours faithfully,
Authorized Signatory
(Generated via Saarthi MSME Legal Compliance Platform)`;
  };

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
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-left relative z-10">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Scale className="w-6 h-6 text-[#ef4d23]" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
                {isHi ? 'भुगतान एवं रिफंड विधिक सहायक (MSMED Act)' : 'Payment & Refund Compliance Assistant'}
              </h1>
            </div>
            <p className="text-body-sm text-neutral-500">
              {isHi
                ? 'MSMED अधिनियम 2006 धारा 15-16 के तहत 45-दिवसीय विलंबित भुगतान वसूली, 3× RBI चक्रवृद्धि ब्याज गणना एवं समाधान पोर्टल'
                : 'MSMED Act §15-16 Delayed Payment Recovery Engine, 3x RBI Bank Rate Compound Interest Calculator & Samadhan Portal'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center p-1 bg-neutral-200/80 rounded-xl">
            <button
              onClick={() => setActiveTab('claims')}
              className={`px-4 py-2 rounded-lg text-caption font-bold transition-all ${
                activeTab === 'claims'
                  ? 'bg-white text-[#ef4d23] shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {isHi ? 'विलंबित भुगतान वसूली (MSMED Act)' : 'MSMED Delayed Payments'}
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-2 rounded-lg text-caption font-bold transition-all ${
                activeTab === 'billing'
                  ? 'bg-white text-[#123A73] shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {isHi ? 'प्लेटफ़ॉर्म बिलिंग एवं रिफंड' : 'Billing & Refunds'}
            </button>
          </div>
        </div>

        {activeTab === 'claims' && (
          <div className="space-y-6">
            {/* Statutory Law Notice Banner */}
            <div className="bg-gradient-to-r from-[#0b0f1a] to-[#162035] text-white rounded-2xl p-6 border border-white/10 relative overflow-hidden shadow-lg">
              <SpecularHorizonBeam color="#ef4d23" className="top-0" />
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ef4d23]/20 border border-[#ef4d23]/40 text-[#ef4d23] text-caption font-bold uppercase tracking-wider">
                    <Scale className="w-3.5 h-3.5" />
                    <span>{isHi ? 'MSMED अधिनियम, 2006 (धारा 15 एवं 16)' : 'MSMED Act, 2006 (Section 15 & 16)'}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {isHi
                      ? 'खरीदारों को 45 दिनों में भुगतान करना अनिवार्य है'
                      : 'Buyers Must Pay Within 45 Days by Indian Law'}
                  </h2>
                  <p className="text-caption text-neutral-300 leading-relaxed">
                    {isHi
                      ? '45 दिन से अधिक विलंब होने पर खरीदार को RBI बैंक दर का 3 गुना (20.25% वार्षिक चक्रवृद्धि ब्याज) देना विधिक रूप से अनिवार्य है। समाधान पोर्टल पर सीधे दावा करें।'
                      : 'Failure to pay within 45 days mandates statutory compound interest at 3x the RBI Bank Rate (20.25% p.a.) with monthly rests. Escalate directly to the MSME Facilitation Council.'}
                  </p>
                </div>

                {/* Statutory Numbers Quick-Cards */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center">
                    <span className="text-[11px] text-neutral-400 font-semibold block">
                      {isHi ? 'अधिकतम क्रेडिट अवधि' : 'Max Statutory Credit'}
                    </span>
                    <span className="text-xl font-extrabold text-white">45 Days</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center">
                    <span className="text-[11px] text-neutral-400 font-semibold block">
                      {isHi ? 'विधिक ब्याज दर' : 'Mandatory Interest'}
                    </span>
                    <span className="text-xl font-extrabold text-[#ef4d23]">20.25% p.a.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Metrics Bar */}
            {claimsData && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-neutral-500 text-caption font-semibold">
                    <span>{isHi ? 'कुल विलंबित मूलधन' : 'Total Delayed Principal'}</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-2xl font-extrabold text-neutral-900">
                    ₹{claimsData.summary?.totalDelayedPrincipal?.toLocaleString('en-IN') || '0'}
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-neutral-500 text-caption font-semibold">
                    <span>{isHi ? 'अर्जित 3× RBI चक्रवृद्धि ब्याज' : 'Accrued 3x RBI Interest'}</span>
                    <TrendingUp className="w-4 h-4 text-[#ef4d23]" />
                  </div>
                  <span className="text-2xl font-extrabold text-[#ef4d23]">
                    + ₹{claimsData.summary?.totalStatutoryInterest?.toLocaleString('en-IN') || '0'}
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-neutral-500 text-caption font-semibold">
                    <span>{isHi ? 'कुल विधिक दावा राशि' : 'Total Statutory Claim'}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-extrabold text-neutral-900">
                    ₹{claimsData.summary?.totalRecoverable?.toLocaleString('en-IN') || '0'}
                  </span>
                </div>
              </div>
            )}

            {/* Claims Table Header with Add Button */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  {isHi ? 'विलंबित खरीदार चालान एवं ब्याज ट्रैकर' : 'Delayed Buyer Invoices & Statutory Claims'}
                </h3>
                <p className="text-caption text-neutral-500">
                  {isHi
                    ? 'प्रत्येक चालान पर स्वचालित चक्रवृद्धि ब्याज गणना एवं 1-क्लिक विधिक नोटिस'
                    : 'Real-time daily compound interest calculations with 1-click legal notice generator'}
                </p>
              </div>

              <button
                onClick={() => setShowNewClaimModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ef4d23] hover:bg-[#d83f17] text-white font-bold text-caption transition-all shadow-md shadow-[#ef4d23]/20 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>{isHi ? 'नया चालान दर्ज करें' : 'Track Delayed Invoice'}</span>
              </button>
            </div>

            {/* Claims List Cards */}
            {loadingClaims ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200/80 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#ef4d23] mx-auto" />
                <p className="text-caption text-neutral-500">{tCommon('loading')}</p>
              </div>
            ) : claimsData?.claims?.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200/80 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-body font-bold text-neutral-900">
                  {isHi ? 'कोई विलंबित भुगतान नहीं' : 'No Delayed Invoices Tracked'}
                </p>
                <p className="text-caption text-neutral-500">
                  {isHi
                    ? 'जब भी कोई खरीदार 45 दिन से अधिक विलंब करे, यहाँ चालान दर्ज करें।'
                    : 'Track invoices to automatically calculate statutory 3x RBI interest and issue demand notices.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {claimsData?.claims?.map((claim: any) => (
                  <div
                    key={claim.id}
                    className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-base font-bold text-neutral-900">{claim.buyer_name}</h4>
                          {claim.buyer_gstin && (
                            <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono text-[11px]">
                              {claim.buyer_gstin}
                            </span>
                          )}
                        </div>
                        <p className="text-caption text-neutral-500">
                          Invoice: <span className="font-semibold text-neutral-800">{claim.invoice_number}</span> • Date: {claim.invoice_date} • 45-Day Deadline: {claim.due_date}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-caption font-bold border border-red-200">
                          {claim.delay_days} {isHi ? 'दिन विलंबित' : 'Days Overdue'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-[#fbfaf8] p-4 rounded-xl">
                      <div>
                        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                          {isHi ? 'मूल चालान राशि' : 'Principal Amount'}
                        </span>
                        <span className="text-lg font-bold text-neutral-900">
                          ₹{claim.invoice_amount?.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                          {isHi ? '3× RBI ब्याज दर' : 'MSMED Interest (3x RBI)'}
                        </span>
                        <span className="text-lg font-bold text-[#ef4d23]">
                          {claim.interest_rate}% p.a.
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                          {isHi ? 'अर्जित ब्याज' : 'Interest Accrued'}
                        </span>
                        <span className="text-lg font-bold text-[#ef4d23]">
                          + ₹{claim.interest_amount?.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                          {isHi ? 'कुल वसूली योग्य' : 'Total Claim Value'}
                        </span>
                        <span className="text-lg font-extrabold text-neutral-900">
                          ₹{((claim.invoice_amount || 0) + (claim.interest_amount || 0)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <p className="text-caption text-neutral-500 italic">
                        {claim.notes || (isHi ? 'कोई अतिरिक्त टिप्पणी नहीं' : 'No notes attached')}
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedClaimForNotice(claim)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#123A73] hover:bg-[#0e2d5a] text-white font-bold text-caption transition-all shadow-sm active:scale-[0.98]"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{isHi ? 'विधिक मांग पत्र जनरेट करें' : 'Generate Legal Demand Notice'}</span>
                        </button>

                        <a
                          href="https://samadhaan.msme.gov.in"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-bold text-caption transition-all"
                        >
                          <span>{isHi ? 'MSME समाधान पोर्टल' : 'MSME Samadhan Portal'}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Checkout Simulator Form */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-title-sm font-bold text-ink">{t('checkoutTitle')}</h2>
                  <p className="text-body-sm text-neutral-500">{t('checkoutSubtitle')}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-[#123A73] font-bold text-caption border border-blue-200">
                  Razorpay Sandbox
                </span>
              </div>

              <form onSubmit={handleCreatePayment} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-caption font-semibold text-neutral-700 block mb-1.5">
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-caption font-medium text-ink focus:outline-none focus:border-[#ef4d23]"
                    >
                      <option value="Compliance Monthly Filing Fee">
                        {isHi ? 'मासिक अनुपालन फाइलिंग शुल्क (₹1,499)' : 'Compliance Monthly Filing Fee (₹1,499)'}
                      </option>
                      <option value="CA Expert Legal Consultation">
                        {isHi ? 'CA कानूनी परामर्श (₹2,499)' : 'CA Expert Legal Consultation (₹2,499)'}
                      </option>
                      <option value="Saarthi Enterprise Annual Subscription">
                        {isHi ? 'सारथी एंटरप्राइज वार्षिक प्लान (₹4,999)' : 'Saarthi Enterprise Annual Subscription (₹4,999)'}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-caption font-semibold text-neutral-700 block mb-1.5">
                      {t('amountLabel')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-body-sm">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        min={100}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-caption font-bold text-ink focus:outline-none focus:border-[#ef4d23]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={paying}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#123A73] hover:bg-[#0e2d5a] text-white font-bold text-button active:scale-[0.98] disabled:opacity-60 transition-all shadow-md"
                >
                  {paying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('processing')}</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {t('payButton')} ₹{amount.toLocaleString('en-IN')}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Transactions Ledger */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-title-sm font-bold text-ink">{t('historyTitle')}</h3>
                <span className="text-caption text-neutral-500">
                  {transactions.length} {t('records')}
                </span>
              </div>

              {loadingTx ? (
                <div className="p-8 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#123A73] mx-auto" />
                  <p className="text-caption text-neutral-500">{tCommon('loading')}</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Clock className="w-6 h-6 text-neutral-400 mx-auto" />
                  <p className="text-body-sm text-neutral-500">{t('emptyHistory')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 text-caption font-bold text-neutral-500">
                        <th className="py-2.5 px-3">Order ID</th>
                        <th className="py-2.5 px-3">Purpose</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-caption">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="py-3 px-3 font-mono text-[11px] text-neutral-600">
                            {tx.provider_order_id}
                          </td>
                          <td className="py-3 px-3 font-semibold text-neutral-900">{tx.purpose}</td>
                          <td className="py-3 px-3 text-neutral-500">
                            {new Date(tx.created_at).toLocaleDateString('en-GB')}
                          </td>
                          <td className="py-3 px-3 font-bold text-neutral-900">
                            ₹{(tx.amount / 100).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                tx.status === 'captured'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : tx.status === 'refunded'
                                  ? 'bg-purple-50 text-purple-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {tx.status === 'captured' && (
                              <button
                                onClick={() => handleRefund(tx.provider_payment_id || tx.id, tx.amount)}
                                disabled={refundingId === (tx.provider_payment_id || tx.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ef4d23] hover:underline disabled:opacity-50"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>{t('refundButton')}</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Track New Delayed Invoice Modal */}
      {showNewClaimModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#ef4d23]" />
                <h3 className="text-lg font-bold text-neutral-900">
                  {isHi ? 'विलंबित खरीदार चालान दर्ज करें' : 'Track Delayed Buyer Invoice'}
                </h3>
              </div>
              <button
                onClick={() => setShowNewClaimModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClaim} className="space-y-4">
              <div>
                <label className="text-caption font-semibold text-neutral-700 block mb-1">
                  {isHi ? 'खरीदार कंपनी का नाम' : 'Buyer Enterprise Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Retail India Ltd"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-caption font-medium focus:border-[#ef4d23] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-caption font-semibold text-neutral-700 block mb-1">
                    {isHi ? 'खरीदार GSTIN (वैकल्पिक)' : 'Buyer GSTIN (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="09AAACA1234F1Z5"
                    value={buyerGstin}
                    onChange={(e) => setBuyerGstin(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-caption font-mono uppercase focus:border-[#ef4d23] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-caption font-semibold text-neutral-700 block mb-1">
                    {isHi ? 'चालान संख्या (Invoice No)' : 'Invoice Number'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="INV/2026/001"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-caption font-medium focus:border-[#ef4d23] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-caption font-semibold text-neutral-700 block mb-1">
                    {isHi ? 'चालान दिनांक' : 'Invoice Date'} *
                  </label>
                  <input
                    type="date"
                    required
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-caption font-medium focus:border-[#ef4d23] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-caption font-semibold text-neutral-700 block mb-1">
                    {isHi ? 'देय दिनांक (45 दिन)' : 'Due Date (45d)'} *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-caption font-medium focus:border-[#ef4d23] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-caption font-semibold text-neutral-700 block mb-1">
                    {isHi ? 'राशि (INR)' : 'Amount (₹)'} *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="250000"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-caption font-bold focus:border-[#ef4d23] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-caption font-semibold text-neutral-700 block mb-1">
                  {isHi ? 'सामग्री/सेवा विवरण' : 'Goods / Service Description & Delivery Proof'}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Delivery challan signed on 12-01-2026. Goods received without dispute."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-caption font-medium focus:border-[#ef4d23] focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingClaim}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#ef4d23] hover:bg-[#d83f17] text-white font-bold text-caption transition-all shadow-md active:scale-[0.98] disabled:opacity-60"
                >
                  {submittingClaim ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{tCommon('loading')}</span>
                    </>
                  ) : (
                    <span>{isHi ? 'चालान दर्ज करें एवं ब्याज सक्रिय करें' : 'Start Statutory Interest Tracking'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statutory Legal Demand Notice Modal */}
      {selectedClaimForNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-4 max-h-[90vh] flex flex-col relative">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#123A73]" />
                <h3 className="text-lg font-bold text-neutral-900">
                  {isHi ? 'MSMED अधिनियम धारा 15-16 विधिक मांग पत्र' : 'MSMED Act §15-16 Legal Demand Notice'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedClaimForNotice(null);
                  setCopiedNotice(false);
                }}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-caption text-neutral-500">
              {isHi
                ? 'यह पत्र सीधे खरीदार को ईमेल या पंजीकृत डाक द्वारा भेजा जा सकता है।'
                : 'This formal statutory notice is ready to be emailed or sent via Registered Post AD to the defaulting buyer.'}
            </p>

            <div className="flex-1 overflow-y-auto bg-[#fbfaf8] border border-neutral-200 rounded-xl p-4 font-mono text-[12px] text-neutral-800 whitespace-pre-wrap leading-relaxed">
              {generateDemandNoticeText(selectedClaimForNotice)}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-caption font-semibold text-emerald-700">
                {isHi ? '✓ विधिक प्रारूप तैयार' : '✓ Statutorily Compliant Format'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateDemandNoticeText(selectedClaimForNotice));
                    setCopiedNotice(true);
                    setTimeout(() => setCopiedNotice(false), 2500);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-bold text-caption transition-all shadow-2xs"
                >
                  {copiedNotice ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{isHi ? 'कॉपी हो गया' : 'Copied to Clipboard'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{isHi ? 'नोटिस कॉपी करें' : 'Copy Notice Text'}</span>
                    </>
                  )}
                </button>

                <a
                  href="https://samadhaan.msme.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#ef4d23] hover:bg-[#d83f17] text-white font-bold text-caption transition-all shadow-md"
                >
                  <span>{isHi ? 'समाधान पोर्टल पर फाइल करें' : 'File on Samadhan Portal'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
