'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, Loader2, Globe, ChevronRight } from 'lucide-react';
import {
  AmbientOrbs,
  ArchitecturalGrid,
  SpecularHorizonBeam,
} from '@/components/ui/ambient-background';

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

export default function VendorSignUpPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();

  const locale = (params.locale as string) || 'en';
  const otherLocale = locale === 'en' ? 'hi' : 'en';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [productCategory, setProductCategory] = useState('packaging');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup/vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, businessName, gstin, productCategory, locale }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push('/marketplace/suppliers');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/api/auth/callback?next=/${locale}/marketplace/suppliers`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Google OAuth failed to initialize');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f4f0] font-['Inter',sans-serif] selection:bg-[#ef4d23]/20 selection:text-[#ef4d23] p-3 sm:p-4 relative overflow-hidden">
      <AmbientOrbs theme="warm" intensity="subtle" />
      <ArchitecturalGrid gridSize={32} />
      <div className="pointer-events-none absolute inset-0 ambient-dot-grid opacity-50" aria-hidden="true" />

      <div className="w-full max-w-5xl mx-auto my-auto bg-white/95 backdrop-blur-md rounded-3xl border border-neutral-200/80 shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-[640px] relative z-10">
        <div className="lg:w-1/2 bg-[#0b0f1a] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden border-r border-white/10">
          <SpecularHorizonBeam color="#ef4d23" className="top-0" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[radial-gradient(circle,rgba(239,77,35,0.25)_0%,transparent_70%)] blur-3xl pointer-events-none" />
          <div className="space-y-6 relative z-10">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <SaarthiLogo className="w-8 h-8" />
              <span className="text-[17px] font-bold text-white tracking-tight">Saarthi</span>
            </Link>

            <div className="space-y-3 pt-6">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
                Become a{' '}
                <span
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontStyle: 'italic',
                    fontWeight: 400,
                  }}
                >
                  Verified Supplier
                </span>
              </h2>
              <p className="text-[14px] text-neutral-400 leading-relaxed max-w-sm">
                Join our marketplace to connect with growing businesses across India.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 p-8 sm:p-12 flex flex-col justify-between overflow-y-auto max-h-screen lg:max-h-[800px]">
          <div className="flex justify-end">
            <Link
              href="/vendor/signup"
              locale={otherLocale}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f2ee] text-[12px] font-semibold text-neutral-700 hover:text-neutral-900 border border-neutral-200/60 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#ef4d23]" />
              <span>{otherLocale === 'hi' ? 'हिंदी' : 'English'}</span>
            </Link>
          </div>

          <div className="w-full max-w-sm mx-auto space-y-5 my-auto py-8">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-neutral-900">{t('vendorSignUpTitle')}</h1>
              <p className="text-[13px] text-neutral-500">{t('vendorSignUpSubtitle')}</p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-start gap-2.5 text-[13px]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-semibold text-[13px] transition-all shadow-2xs active:scale-[0.98] disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
              ) : (
                <GoogleIcon />
              )}
              <span>{locale === 'hi' ? 'Google के साथ जारी रखें' : 'Continue with Google'}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-neutral-200" />
              <span className="absolute bg-white px-3 text-[11px] font-mono uppercase text-neutral-400">
                {locale === 'hi' ? 'या ईमेल द्वारा' : 'or email'}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-neutral-700 block" htmlFor="fullName">
                  {t('fullNameLabel')}
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 text-[14px] focus:outline-none focus:border-[#ef4d23] focus:ring-1 focus:ring-[#ef4d23]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-neutral-700 block" htmlFor="email">
                  {t('emailLabel')}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 text-[14px] focus:outline-none focus:border-[#ef4d23] focus:ring-1 focus:ring-[#ef4d23]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-neutral-700 block" htmlFor="password">
                  {t('passwordLabel')}
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 text-[14px] focus:outline-none focus:border-[#ef4d23] focus:ring-1 focus:ring-[#ef4d23]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-neutral-700 block" htmlFor="businessName">
                  {t('businessNameLabel')}
                </label>
                <input
                  id="businessName"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 text-[14px] focus:outline-none focus:border-[#ef4d23] focus:ring-1 focus:ring-[#ef4d23]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-neutral-700 block" htmlFor="gstin">
                  {t('gstinLabel')}
                </label>
                <input
                  id="gstin"
                  type="text"
                  required
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 text-[14px] focus:outline-none focus:border-[#ef4d23] focus:ring-1 focus:ring-[#ef4d23]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-neutral-700 block" htmlFor="productCategory">
                  {t('productCategoryLabel')}
                </label>
                <select
                  id="productCategory"
                  required
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-900 text-[14px] focus:outline-none focus:border-[#ef4d23] focus:ring-1 focus:ring-[#ef4d23]"
                >
                  <option value="packaging">{t('catPackaging')}</option>
                  <option value="raw_ingredients">{t('catRawIngredients')}</option>
                  <option value="machinery">{t('catMachinery')}</option>
                  <option value="chemicals">{t('catChemicals')}</option>
                  <option value="safety_gear">{t('catSafetyGear')}</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#0b0f1a] hover:bg-[#182238] active:scale-[0.98] text-white font-semibold text-[14px] disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{t('vendorSignUpButton')}</span>
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <ChevronRight className="w-3.5 h-3.5 text-white" />
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
