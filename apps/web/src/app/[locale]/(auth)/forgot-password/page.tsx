'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import AnimatedGradientBackground from '@/components/ui/animated-gradient-background';
import { ArrowRight, AlertCircle, CheckCircle2, Loader2, Globe, ArrowLeft, Shield, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const params = useParams();

  const locale = (params.locale as string) || 'en';
  const otherLocale = locale === 'en' ? 'hi' : 'en';

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* ─── Left Panel: Animated Brand Showcase ─── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative overflow-hidden bg-surface-dark">
        <AnimatedGradientBackground
          breathing={true}
          startingGap={130}
          breathingRange={6}
          animationSpeed={0.012}
          gradientColors={['#14181F', '#123A73', '#2C6FE0', '#1E8A5F', '#0F2847', '#14181F', '#0A0D12']}
          gradientStops={[20, 38, 52, 64, 78, 90, 100]}
          topOffset={10}
        />

        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-status-success flex items-center justify-center text-white font-bold text-base shadow-lg shadow-brand-blue/20 group-hover:scale-105 transition-transform">
              सा
            </div>
            <div>
              <span className="text-lg text-white font-bold tracking-tight block leading-none">{tCommon('appName')}</span>
              <span className="text-[10px] text-white/30 font-medium">MSME Compliance OS</span>
            </div>
          </Link>

          <div className="space-y-6 max-w-md">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-amber-400">
              <KeyRound className="w-6 h-6" />
            </div>

            <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Secure Account
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                Recovery.
              </span>
            </h2>
            <p className="text-body-lg text-white/40 leading-relaxed">
              We send encrypted one-time password recovery links to protect your business records, tax filings, and compliance audit trail.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-white/20">
            <Shield className="w-3.5 h-3.5" />
            <span>End-to-end encrypted authentication · Supabase Auth</span>
          </div>
        </div>
      </div>

      {/* ─── Right Panel: Recovery Form ─── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px] flex items-center justify-between mb-8 lg:mb-10">
          <Link href="/" className="flex items-center gap-2.5 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-status-success to-brand-blue flex items-center justify-center text-white font-bold text-sm">
              सा
            </div>
            <span className="text-title-sm text-ink font-bold">{tCommon('appName')}</span>
          </Link>
          <div className="lg:hidden" />

          <Link
            href="/forgot-password"
            locale={otherLocale}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-soft text-caption font-semibold text-neutral-500 hover:text-ink hover:bg-surface-faint transition-all border border-hairline"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{otherLocale === 'hi' ? 'हिंदी' : 'English'}</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[420px] space-y-7"
        >
          <div className="space-y-1.5">
            <h1 className="text-title-lg font-bold text-ink">{t('forgotPasswordTitle')}</h1>
            <p className="text-body text-neutral-500">{t('forgotPasswordSubtitle')}</p>
          </div>

          {/* Success Alert */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-status-success-bg border border-status-success/20 flex items-start gap-2.5 text-body-sm text-status-success"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{t('resetLinkSent')}</span>
            </motion.div>
          )}

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-status-danger-bg border border-status-danger/20 flex items-start gap-2.5 text-body-sm text-status-danger"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-body-sm font-semibold text-ink" htmlFor="email">
                  {t('emailLabel')}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="w-full px-4 py-3 rounded-xl bg-surface-white border border-hairline text-ink placeholder:text-neutral-300 text-body focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-light/50 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-ink text-on-dark font-bold text-button hover:bg-ink-pressed active:scale-[0.98] disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all shadow-[0_2px_8px_rgba(18,21,26,0.15)]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{tCommon('loading')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('sendResetLinkButton')}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-5 border-t border-hairline text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-body-sm font-bold text-brand-navy hover:text-brand-blue transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{tCommon('back')} to {t('signInButton')}</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
