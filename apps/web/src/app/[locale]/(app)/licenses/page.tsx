'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  ExternalLink,
  Loader2,
  Globe,
  Sparkles,
  Zap,
  Filter,
  Check,
  Copy,
  X,
  FileCheck2,
  UploadCloud,
  ChevronRight,
  HelpCircle,
  Scale,
  Award,
} from 'lucide-react';
import {
  AmbientOrbs,
  ArchitecturalGrid,
  SpecularHorizonBeam,
} from '@/components/ui/ambient-background';

export default function LicenseMonitoringPage() {
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const params = useParams();

  const locale = (params.locale as string) || 'en';
  const isHi = locale === 'hi';
  const otherLocale = isHi ? 'en' : 'hi';

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // NSWS AI Assistant Modal State
  const [selectedLicenseForAssistant, setSelectedLicenseForAssistant] = useState<any | null>(null);
  const [copiedAutofill, setCopiedAutofill] = useState(false);

  // Status Update Modal State
  const [selectedLicenseForUpdate, setSelectedLicenseForUpdate] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<string>('applied');
  const [licenseNumberInput, setLicenseNumberInput] = useState('');
  const [expiryDateInput, setExpiryDateInput] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/licenses');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to load license monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLicenseForUpdate) return;

    try {
      setUpdatingStatus(true);
      const res = await fetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseCode: selectedLicenseForUpdate.code,
          status: newStatus,
          licenseNumber: licenseNumberInput,
          expiryDate: expiryDateInput,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedLicenseForUpdate(null);
        setLicenseNumberInput('');
        setExpiryDateInput('');
        await fetchLicenses();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredLicenses = data?.licenses?.filter((lic: any) => {
    if (filterCategory !== 'ALL' && lic.category !== filterCategory) return false;
    if (filterStatus === 'ACTION_REQUIRED' && lic.currentStatus !== 'not_applied' && lic.currentStatus !== 'expired') return false;
    if (filterStatus === 'ACTIVE' && lic.currentStatus !== 'approved') return false;
    if (filterStatus === 'RENEWAL_DUE' && lic.currentStatus !== 'renewal_due') return false;
    return true;
  });

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
              href="/licenses"
              className="px-3 py-1.5 rounded-md text-body-sm font-bold text-brand-navy bg-brand-blue-light/50 transition-colors"
            >
              {isHi ? 'लाइसेंस ट्रैकर' : 'Licenses & NSWS'}
            </Link>
            <Link
              href="/notices"
              className="px-3 py-1.5 rounded-md text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('notices')}
            </Link>
            <Link
              href="/copilot"
              className="px-3 py-1.5 rounded-md text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('copilot')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/licenses"
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
        {/* Personalized Enterprise Header Banner */}
        <div className="bg-gradient-to-r from-[#0b0f1a] to-[#14233c] text-white rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden shadow-xl">
          <SpecularHorizonBeam color="#ef4d23" className="top-0" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#ef4d23]/20 text-[#ef4d23] text-caption font-bold border border-[#ef4d23]/40 uppercase tracking-wider">
                  {data?.enterpriseProfile?.turnoverBand?.toUpperCase()} MSME TIER
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-neutral-300 text-caption font-semibold border border-white/10">
                  {data?.enterpriseProfile?.sector}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-neutral-300 text-caption font-semibold border border-white/10">
                  Zone: {data?.enterpriseProfile?.state}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {isHi
                  ? 'व्यक्तिगत वैधानिक लाइसेंस एवं NSWS निगरानी'
                  : 'Personalized Statutory Licenses & NSWS Assistant'}
              </h1>
              <p className="text-caption sm:text-body-sm text-neutral-300 leading-relaxed">
                {isHi
                  ? 'आपके सूक्ष्म/लघु/मध्यम उद्योग के आधार पर सभी आवश्यक लाइसेंसों की स्वचालित सूची। 1-क्लिक NSWS ऑटो-फिल एवं AI सहायता से सीधे सरकारी पोर्टल पर आवेदन करें।'
                  : 'Tailored regulatory matrix based on your MSME turnover, sector, and employee size. 1-click National Single Window System (NSWS) AI assistant with auto-fill payloads.'}
              </p>
            </div>

            {/* Health Rating Dial */}
            {data?.summary && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex items-center gap-5 shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-[#ef4d23]/20 border border-[#ef4d23]/40 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-extrabold text-[#ef4d23] leading-none">
                    {data.summary.complianceRate}%
                  </span>
                  <span className="text-[9px] text-neutral-300 uppercase font-semibold mt-1">Score</span>
                </div>
                <div className="space-y-1">
                  <span className="text-caption font-bold text-white block">
                    {data.summary.activeLicenses} of {data.summary.totalApplicable} Licenses Active
                  </span>
                  <p className="text-[12px] text-neutral-300">
                    {data.summary.actionRequiredLicenses} requiring immediate filing
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metric Quick-Pills */}
        {data?.summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                {isHi ? 'कुल लागू लाइसेंस' : 'Total Required'}
              </span>
              <span className="text-2xl font-extrabold text-neutral-900">{data.summary.totalApplicable}</span>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
                {isHi ? 'सक्रिय एवं स्वीकृत' : 'Active & Approved'}
              </span>
              <span className="text-2xl font-extrabold text-emerald-600">{data.summary.activeLicenses}</span>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
                {isHi ? 'नवीनीकरण देय' : 'Renewal Due'}
              </span>
              <span className="text-2xl font-extrabold text-amber-600">{data.summary.renewalDueLicenses}</span>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider block">
                {isHi ? 'तत्काल आवश्यक' : 'Action Required'}
              </span>
              <span className="text-2xl font-extrabold text-red-600">{data.summary.actionRequiredLicenses}</span>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-4">
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: isHi ? 'सभी लाइसेंस' : 'All Licenses' },
              { id: 'ACTION_REQUIRED', label: isHi ? 'तत्काल आवेदन' : 'Action Required' },
              { id: 'ACTIVE', label: isHi ? 'सक्रिय' : 'Active' },
              { id: 'RENEWAL_DUE', label: isHi ? 'नवीनीकरण देय' : 'Renewal Due' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id)}
                className={`px-3.5 py-1.5 rounded-xl text-caption font-bold transition-all ${
                  filterStatus === st.id
                    ? 'bg-[#123A73] text-white shadow-sm'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-caption font-semibold text-neutral-800 focus:outline-none"
            >
              <option value="ALL">{isHi ? 'सभी श्रेणियां' : 'All Categories'}</option>
              <option value="universal">{isHi ? 'सार्वभौमिक (Universal)' : 'Universal'}</option>
              <option value="labor">{isHi ? 'श्रम एवं रोजगार (Labour)' : 'Labour & ESIC/EPF'}</option>
              <option value="environmental">{isHi ? 'पर्यावरण एवं अग्नि (Pollution/Fire)' : 'Environmental & Fire'}</option>
              <option value="industry_specific">{isHi ? 'उद्योग विशिष्ट (FSSAI/BIS)' : 'Industry Specific'}</option>
              <option value="corporate">{isHi ? 'कॉर्पोरेट / व्यापार (DGFT)' : 'Corporate / Trade'}</option>
            </select>
          </div>
        </div>

        {/* License Grid Cards */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200/80 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#ef4d23] mx-auto" />
            <p className="text-caption text-neutral-500">{tCommon('loading')}</p>
          </div>
        ) : filteredLicenses?.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200/80 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-body font-bold text-neutral-900">
              {isHi ? 'इस फ़िल्टर में कोई लाइसेंस नहीं' : 'No licenses match selected filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredLicenses?.map((lic: any) => (
              <div
                key={lic.code}
                className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative overflow-hidden group"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-700 text-[11px] font-bold uppercase tracking-wider">
                      {lic.category}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-bold ${
                        lic.currentStatus === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : lic.currentStatus === 'renewal_due'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          : lic.currentStatus === 'applied'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          lic.currentStatus === 'approved'
                            ? 'bg-emerald-500'
                            : lic.currentStatus === 'renewal_due'
                            ? 'bg-amber-500'
                            : lic.currentStatus === 'applied'
                            ? 'bg-blue-500'
                            : 'bg-red-500'
                        }`}
                      />
                      <span>
                        {lic.currentStatus === 'approved'
                          ? isHi ? 'सक्रिय / स्वीकृत' : 'Active & Approved'
                          : lic.currentStatus === 'renewal_due'
                          ? isHi ? 'नवीनीकरण देय' : 'Renewal Due'
                          : lic.currentStatus === 'applied'
                          ? isHi ? 'सत्यापन प्रक्रियाधीन' : 'Applied / In Review'
                          : isHi ? 'आवेदन आवश्यक' : 'Not Applied'}
                      </span>
                    </span>
                  </div>

                  {/* Title & Act */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-neutral-900 leading-snug">
                      {isHi ? lic.titleHi : lic.titleEn}
                    </h3>
                    <p className="text-caption font-medium text-neutral-500">
                      {lic.authority} • <span className="font-semibold text-neutral-700">{lic.actName}</span>
                    </p>
                  </div>

                  {/* License Number (if active) */}
                  {lic.licenseNumber && (
                    <div className="bg-[#fbfaf8] border border-neutral-200 rounded-xl p-3 flex items-center justify-between text-caption">
                      <span className="text-neutral-500 font-medium">{isHi ? 'लाइसेंस संख्या:' : 'Reg / License No:'}</span>
                      <span className="font-mono font-bold text-neutral-900">{lic.licenseNumber}</span>
                    </div>
                  )}

                  {/* Penal Consequence Notice */}
                  <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200/60 text-red-800 text-[12px] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>{isHi ? 'गैर-अनुपालन विधिक जोखिम:' : 'Non-Compliance Legal Risk:'}</span>
                    </div>
                    <p className="leading-relaxed">
                      {isHi ? lic.penaltyDetailsHi : lic.penaltyDetailsEn}
                    </p>
                  </div>

                  {/* Required Documents Pill List */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                      {isHi ? 'आवश्यक दस्तावेज:' : 'Required Document Checklist:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(isHi ? lic.requiredDocumentsHi : lic.requiredDocumentsEn)?.map((doc: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-[11px] font-medium"
                        >
                          ✓ {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 border-t border-neutral-100 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedLicenseForAssistant(lic)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#ef4d23] hover:bg-[#d83f17] text-white font-bold text-caption transition-all shadow-md shadow-[#ef4d23]/20 active:scale-[0.98]"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>{isHi ? '1-क्लिक NSWS AI सहायक' : '1-Click NSWS AI Assistant'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedLicenseForUpdate(lic);
                      setNewStatus(lic.currentStatus === 'not_applied' ? 'applied' : lic.currentStatus);
                      setLicenseNumberInput(lic.licenseNumber || '');
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold text-caption transition-all"
                  >
                    {isHi ? 'स्थिति बदलें' : 'Update Status'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 1-Click NSWS AI Assistant Modal */}
      {selectedLicenseForAssistant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col relative">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#ef4d23] flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5 fill-[#ef4d23]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">
                    {isHi ? 'NSWS / सरकारी पोर्टल AI सहायक' : 'NSWS Official Portal Auto-Fill Assistant'}
                  </h3>
                  <p className="text-caption text-neutral-500">
                    {isHi ? selectedLicenseForAssistant.titleHi : selectedLicenseForAssistant.titleEn}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedLicenseForAssistant(null);
                  setCopiedAutofill(false);
                }}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1">
              {/* Portal Info Box */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-blue-900 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-caption font-bold uppercase tracking-wider text-blue-700">
                    {isHi ? 'आधिकारिक सरकारी पोर्टल:' : 'Official Government Gateway:'}
                  </span>
                  <span className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded border border-blue-200">
                    {selectedLicenseForAssistant.portalName}
                  </span>
                </div>
                <p className="text-caption leading-relaxed">
                  {isHi
                    ? 'नीचे दिए गए पूर्व-भरे डेटा (Pre-filled JSON) को कॉपी करें और सीधे सरकारी पोर्टल पर पेस्ट करें।'
                    : 'Your enterprise profile data has been structured for instant copy-paste into the national registry.'}
                </p>
              </div>

              {/* Pre-filled Data Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-caption font-bold text-neutral-800">
                    {isHi ? 'पूर्व-भरी आवेदन जानकारी (Auto-Fill Payload):' : 'Pre-Filled Application Payload:'}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        JSON.stringify(selectedLicenseForAssistant.nswsAutofillData, null, 2)
                      );
                      setCopiedAutofill(true);
                      setTimeout(() => setCopiedAutofill(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-[11px] transition-all"
                  >
                    {copiedAutofill ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-600" />
                        <span>Copy Profile JSON</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-[#0b0f1a] text-emerald-400 font-mono text-[12px] overflow-x-auto border border-neutral-800 leading-relaxed">
                  {JSON.stringify(selectedLicenseForAssistant.nswsAutofillData, null, 2)}
                </pre>
              </div>

              {/* 3 Step Walkthrough */}
              <div className="space-y-2">
                <span className="text-caption font-bold text-neutral-800 block">
                  {isHi ? 'आवेदन के 3 सरल चरण:' : '3-Step Application Walkthrough:'}
                </span>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-caption">
                    <span className="w-6 h-6 rounded-full bg-[#123A73] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-neutral-900 block font-semibold">
                        {isHi ? 'सरकारी पोर्टल खोलें' : 'Launch Official Single Window'}
                      </strong>
                      <span className="text-neutral-600">
                        {isHi
                          ? `नीचे दिए गए बटन पर क्लिक करके ${selectedLicenseForAssistant.portalName} पर जाएं।`
                          : `Click Open Portal to navigate to ${selectedLicenseForAssistant.portalName}.`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-caption">
                    <span className="w-6 h-6 rounded-full bg-[#123A73] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-neutral-900 block font-semibold">
                        {isHi ? 'दस्तावेज अपलोड करें' : 'Upload Required Documents'}
                      </strong>
                      <span className="text-neutral-600">
                        {isHi
                          ? 'चेकलिस्ट के अनुसार अपने आधार, पैन, और परिसर प्रमाण पत्र संलग्न करें।'
                          : 'Attach mandatory checklist documents (Aadhaar, PAN, premises agreement).'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-caption">
                    <span className="w-6 h-6 rounded-full bg-[#123A73] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-neutral-900 block font-semibold">
                        {isHi ? 'आवेदन संदर्भ संख्या यहाँ दर्ज करें' : 'Save Application Reference Number'}
                      </strong>
                      <span className="text-neutral-600">
                        {isHi
                          ? 'आवेदन के बाद प्राप्त पावती संख्या सारथी में दर्ज करें ताकि AI स्थिति ट्रैक कर सके।'
                          : 'Enter acknowledgment reference number in Saarthi for automated status tracking.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-100">
              <button
                onClick={() => setSelectedLicenseForAssistant(null)}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-bold text-caption hover:bg-neutral-50 transition-all"
              >
                {tCommon('cancel')}
              </button>

              <a
                href={selectedLicenseForAssistant.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ef4d23] hover:bg-[#d83f17] text-white font-bold text-caption transition-all shadow-md shadow-[#ef4d23]/20 active:scale-[0.98]"
              >
                <span>{isHi ? 'आधिकारिक पोर्टल खोलें' : 'Open Government Portal'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Update License Status Modal */}
      {selectedLicenseForUpdate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xl max-w-md w-full p-6 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">
                {isHi ? 'लाइसेंस स्थिति अपडेट करें' : 'Update License Tracking Status'}
              </h3>
              <button
                onClick={() => setSelectedLicenseForUpdate(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="text-caption font-semibold text-neutral-700 block mb-1">
                  {isHi ? 'वर्तमान स्थिति' : 'Current Filing Status'}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-caption font-semibold text-neutral-800 focus:border-[#ef4d23] focus:outline-none"
                >
                  <option value="not_applied">{isHi ? 'आवेदन नहीं किया (Not Applied)' : 'Not Applied'}</option>
                  <option value="applied">{isHi ? 'आवेदन जमा किया (Applied / In Review)' : 'Applied / In Review'}</option>
                  <option value="approved">{isHi ? 'स्वीकृत / सक्रिय (Active & Approved)' : 'Active & Approved'}</option>
                  <option value="renewal_due">{isHi ? 'नवीनीकरण देय (Renewal Due)' : 'Renewal Due'}</option>
                  <option value="expired">{isHi ? 'समाप्त (Expired)' : 'Expired'}</option>
                </select>
              </div>

              <div>
                <label className="text-caption font-semibold text-neutral-700 block mb-1">
                  {isHi ? 'लाइसेंस / पावती संख्या' : 'License / Acknowledgment Number'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. FSSAI-2026-09812"
                  value={licenseNumberInput}
                  onChange={(e) => setLicenseNumberInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-caption font-mono focus:border-[#ef4d23] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-caption font-semibold text-neutral-700 block mb-1">
                  {isHi ? 'वैधता समाप्ति दिनांक (वैकल्पिक)' : 'License Expiry Date (Optional)'}
                </label>
                <input
                  type="date"
                  value={expiryDateInput}
                  onChange={(e) => setExpiryDateInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-caption font-medium focus:border-[#ef4d23] focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#ef4d23] hover:bg-[#d83f17] text-white font-bold text-caption transition-all shadow-md active:scale-[0.98] disabled:opacity-60"
                >
                  {updatingStatus ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{tCommon('loading')}</span>
                    </>
                  ) : (
                    <span>{isHi ? 'स्थिति सहेजें' : 'Save License Status'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
