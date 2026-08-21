'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import {
  Building2,
  FileCheck2,
  Users2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Globe,
  Info,
  CheckCircle2,
} from 'lucide-react';

const SECTORS = [
  { value: 'Food Processing & Confectionery', labelEn: 'Food Processing & Confectionery', labelHi: 'खाद्य प्रसंस्करण एवं मिष्ठान उद्योग' },
  { value: 'Textiles & Apparel', labelEn: 'Textiles & Apparel', labelHi: 'वस्त्र एवं परिधान निर्माण' },
  { value: 'Leather & Footwear', labelEn: 'Leather & Footwear', labelHi: 'चमड़ा एवं फुटवियर उद्योग' },
  { value: 'Automotive & Engineering Components', labelEn: 'Automotive & Engineering Components', labelHi: 'ऑटोमोटिव एवं इंजीनियरिंग कलपुर्जे' },
  { value: 'Chemicals & Pharmaceuticals', labelEn: 'Chemicals & Pharmaceuticals', labelHi: 'रसायन एवं फार्मास्यूटिकल्स' },
  { value: 'Retail Trade & Wholesale', labelEn: 'Retail Trade & Wholesale', labelHi: 'खुदरा एवं थोक व्यापार' },
  { value: 'Information Technology & Services', labelEn: 'Information Technology & Services', labelHi: 'सूचना प्रौद्योगिकी एवं डिजिटल सेवाएं' },
  { value: 'Handicrafts & Carpet Manufacturing', labelEn: 'Handicrafts & Carpet Manufacturing', labelHi: 'हस्तशिल्प एवं कालीन निर्माण (ODOP)' },
  { value: 'Agriculture & Allied Activities', labelEn: 'Agriculture & Allied Activities', labelHi: 'कृषि एवं संबद्ध गतिविधियां' },
  { value: 'Other Manufacturing / Services', labelEn: 'Other Manufacturing / Services', labelHi: 'अन्य विनिर्माण एवं सेवाएं' },
];

export default function OnboardingPage() {
  const t = useTranslations('onboarding');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();

  const locale = (params.locale as string) || 'en';
  const otherLocale = locale === 'en' ? 'hi' : 'en';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [sector, setSector] = useState(SECTORS[0]!.value);
  const [jurisdictionState, setJurisdictionState] = useState('UP');
  const [employeeCountBand, setEmployeeCountBand] = useState<'1-9' | '10-19' | '20-49' | '50-249' | '250+'>('10-19');
  const [turnoverBand, setTurnoverBand] = useState<'micro' | 'small' | 'medium' | 'other'>('micro');

  // Registrations
  const [pan, setPan] = useState('');
  const [gstin, setGstin] = useState('');
  const [udyamNumber, setUdyamNumber] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');

  // Team Invite
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ca_partner' | 'team_member'>('ca_partner');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step < 3) {
      setStep((s) => (s + 1) as any);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create Business
      const res = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legalName,
          tradeName: tradeName || null,
          sector,
          jurisdictionCountry: 'IN',
          jurisdictionState,
          employeeCountBand,
          turnoverBand,
          pan: pan.trim() ? pan.trim().toUpperCase() : null,
          gstin: gstin.trim() ? gstin.trim().toUpperCase() : null,
          udyamNumber: udyamNumber.trim() ? udyamNumber.trim().toUpperCase() : null,
          fssaiNumber: fssaiNumber.trim() || null,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Failed to create business profile.');
        setLoading(false);
        return;
      }

      const businessId = json.data.business.id;

      // 2. Optional: Send Team Invite
      if (inviteEmail.trim()) {
        await fetch('/api/business/team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId,
            email: inviteEmail.trim(),
            roleName: inviteRole,
          }),
        }).catch((err) => console.error('Team invite failed:', err));
      }

      // Redirect to Verification Step
      router.push(`/onboarding/verify?businessId=${businessId}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred during onboarding setup.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Top Navbar Brand & Language Toggle */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center space-x-2.5">
          <SaarthiLogo className="w-8 h-8" />
          <span className="text-title-sm text-ink font-semibold">{tCommon('appName')}</span>
        </Link>

        <Link
          href="/onboarding"
          locale={otherLocale}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-surface-white text-caption font-medium text-ink hover:bg-surface-faint transition-colors border border-hairline"
        >
          <Globe className="w-3.5 h-3.5 text-brand-navy" />
          <span>{otherLocale === 'hi' ? 'हिंदी' : 'English'}</span>
        </Link>
      </div>

      {/* Main Form Container Card */}
      <div className="w-full max-w-2xl bg-surface-white rounded-xl shadow-soft-raised border border-hairline p-6 sm:p-8 space-y-6">
        {/* Wizard Header & Stepper */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-title-md font-semibold text-ink">{t('wizardTitle')}</h1>
            <span className="text-caption font-mono text-neutral-500">
              Step {step} of 3
            </span>
          </div>
          <p className="text-body-sm text-neutral-500">{t('wizardSubtitle')}</p>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div
              className={`h-1.5 rounded-pill transition-colors ${
                step >= 1 ? 'bg-brand-navy' : 'bg-surface-faint'
              }`}
            />
            <div
              className={`h-1.5 rounded-pill transition-colors ${
                step >= 2 ? 'bg-brand-navy' : 'bg-surface-faint'
              }`}
            />
            <div
              className={`h-1.5 rounded-pill transition-colors ${
                step >= 3 ? 'bg-brand-navy' : 'bg-surface-faint'
              }`}
            />
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-3.5 rounded-md bg-status-danger-bg border border-status-danger/20 flex items-start gap-2.5 text-body-sm text-status-danger">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Business Profile */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-hairline text-brand-navy font-semibold text-body">
                <Building2 className="w-4 h-4" />
                <span>{t('step1')}</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">
                  {t('legalNameLabel')} <span className="text-status-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder={t('legalNamePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-md bg-surface-white border border-hairline text-ink text-body placeholder:text-neutral-500 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-light transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">
                  {t('tradeNameLabel')}
                </label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  placeholder={t('tradeNamePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-md bg-surface-white border border-hairline text-ink text-body placeholder:text-neutral-500 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-light transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-body-sm font-medium text-ink">
                    {t('sectorLabel')}
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-md bg-surface-white border border-hairline text-ink text-body focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-light transition-all"
                  >
                    {SECTORS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {locale === 'hi' ? s.labelHi : s.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-body-sm font-medium text-ink">
                    {t('stateLabel')}
                  </label>
                  <select
                    value={jurisdictionState}
                    onChange={(e) => setJurisdictionState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-md bg-surface-white border border-hairline text-ink text-body focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-light transition-all"
                  >
                    <option value="UP">Uttar Pradesh (Active Support)</option>
                    <option value="MH">Maharashtra (Coming Soon)</option>
                    <option value="DL">Delhi NCR (Coming Soon)</option>
                    <option value="KA">Karnataka (Coming Soon)</option>
                    <option value="GJ">Gujarat (Coming Soon)</option>
                    <option value="TN">Tamil Nadu (Coming Soon)</option>
                  </select>
                </div>
              </div>

              {/* State Scope Notice per PRD.md §5 Scope Decision #2 */}
              <div className="p-3 rounded-md bg-status-info-bg border border-status-info/20 flex items-start gap-2 text-caption text-brand-navy">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{t('upSupportedNotice')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-body-sm font-medium text-ink">
                    {t('employeeBandLabel')}
                  </label>
                  <select
                    value={employeeCountBand}
                    onChange={(e) => setEmployeeCountBand(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-md bg-surface-white border border-hairline text-ink text-body focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-light transition-all"
                  >
                    <option value="1-9">1 - 9 Employees</option>
                    <option value="10-19">10 - 19 Employees</option>
                    <option value="20-49">20 - 49 Employees</option>
                    <option value="50-249">50 - 249 Employees</option>
                    <option value="250+">250+ Employees</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-body-sm font-medium text-ink">
                    {t('turnoverBandLabel')}
                  </label>
                  <select
                    value={turnoverBand}
                    onChange={(e) => setTurnoverBand(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-md bg-surface-white border border-hairline text-ink text-body focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-light transition-all"
                  >
                    <option value="micro">{t('turnoverMicro')}</option>
                    <option value="small">{t('turnoverSmall')}</option>
                    <option value="medium">{t('turnoverMedium')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Registrations */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-hairline text-brand-navy font-semibold text-body">
                <FileCheck2 className="w-4 h-4" />
                <span>{t('step2')}</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">
                  {t('panLabel')}
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder={t('panPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-md bg-surface-white border border-hairline text-ink font-mono text-body placeholder:font-sans placeholder:text-neutral-500 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-light transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">
                  {t('gstinLabel')}
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder={t('gstinPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-md bg-surface-white border border-hairline text-ink font-mono text-body placeholder:font-sans placeholder:text-neutral-500 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-light transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">
                  {t('udyamLabel')}
                </label>
                <input
                  type="text"
                  value={udyamNumber}
                  onChange={(e) => setUdyamNumber(e.target.value.toUpperCase())}
                  placeholder={t('udyamPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-md bg-surface-white border border-hairline text-ink font-mono text-body placeholder:font-sans placeholder:text-neutral-500 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-light transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">
                  {t('fssaiLabel')}
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={fssaiNumber}
                  onChange={(e) => setFssaiNumber(e.target.value)}
                  placeholder={t('fssaiPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-md bg-surface-white border border-hairline text-ink font-mono text-body placeholder:font-sans placeholder:text-neutral-500 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-light transition-all"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Team / CA Setup */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-hairline text-brand-navy font-semibold text-body">
                <Users2 className="w-4 h-4" />
                <span>{t('step3')}</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-body font-semibold text-ink">{t('inviteTeamTitle')}</h3>
                <p className="text-body-sm text-neutral-500">{t('inviteTeamSubtitle')}</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">
                  {t('inviteEmailLabel')}
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="ca.partner@firm.in"
                  className="w-full px-3.5 py-2.5 rounded-md bg-surface-white border border-hairline text-ink text-body placeholder:text-neutral-500 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-light transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">
                  {t('inviteRoleLabel')}
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-md bg-surface-white border border-hairline text-ink text-body focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-light transition-all"
                >
                  <option value="ca_partner">{t('roleCaPartner')}</option>
                  <option value="team_member">{t('roleTeamMember')}</option>
                </select>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-hairline">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-surface-soft border border-hairline text-ink text-button hover:bg-surface-faint transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{tCommon('back')}</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-ink text-on-dark font-semibold text-button hover:bg-ink-pressed active:bg-ink-pressed disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{tCommon('loading')}</span>
                </>
              ) : step < 3 ? (
                <>
                  <span>{tCommon('next')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>{tCommon('finish')}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
