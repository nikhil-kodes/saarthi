'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import {
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Globe,
  Loader2,
  Lock,
  ArrowRight,
  Send,
} from 'lucide-react';

export default function BrandCampaignsPage() {
  const t = useTranslations('creators');
  const tStatus = useTranslations('status');
  const tCommon = useTranslations('common');
  const params = useParams();

  const locale = (params.locale as string) || 'en';
  const otherLocale = locale === 'en' ? 'hi' : 'en';

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Deliverable Submission State
  const [selectedMilestone, setSelectedMilestone] = useState<any | null>(null);
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [captionText, setCaptionText] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingDeliv, setSubmittingDeliv] = useState(false);
  const [delivSuccess, setDelivSuccess] = useState(false);

  // Release Payout State
  const [releasingMilestoneId, setReleasingMilestoneId] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/campaigns');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCampaigns(json.data);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone) return;

    try {
      setSubmittingDeliv(true);
      const res = await fetch(`/api/campaigns/${selectedMilestone.campaignId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: selectedMilestone.id,
          deliverableUrl,
          captionText,
          notes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setDelivSuccess(true);
        setTimeout(() => {
          setDelivSuccess(false);
          setSelectedMilestone(null);
          fetchCampaigns();
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to submit deliverable:', err);
    } finally {
      setSubmittingDeliv(false);
    }
  };

  const handleReleasePayout = async (milestoneId: string) => {
    try {
      setReleasingMilestoneId(milestoneId);
      const res = await fetch(`/api/campaigns/milestones/${milestoneId}/release`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        await fetchCampaigns();
      }
    } catch (err) {
      console.error('Failed to release payout:', err);
    } finally {
      setReleasingMilestoneId(null);
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
              href="/marketplace/creators"
              className="px-3 py-1.5 rounded-md text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {t('creatorsTab')}
            </Link>
            <Link
              href="/marketplace/campaigns"
              className="px-3 py-1.5 rounded-md text-body-sm font-semibold text-brand-navy bg-brand-blue-light/50 transition-colors"
            >
              {t('campaignsTab')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/marketplace/campaigns"
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
            <Megaphone className="w-6 h-6 text-brand-navy" />
            <h1 className="text-title-lg font-semibold text-ink">{t('campaignsTab')}</h1>
          </div>
          <p className="text-body-sm text-neutral-500">
            Contracted creator milestones, automated ASCI statutory disclosure tags, and escrow payouts.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center bg-surface-white rounded-xl border border-hairline space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-navy mx-auto" />
            <p className="text-body-sm text-neutral-500">{tCommon('loading')}</p>
          </div>
        )}

        {!loading && campaigns.length === 0 && (
          <div className="p-12 text-center bg-surface-white rounded-xl border border-hairline space-y-2">
            <p className="text-body font-semibold text-ink">No active creator campaigns</p>
            <p className="text-caption text-neutral-500">
              Browse the Creator Directory to hire verified vernacular influencers.
            </p>
          </div>
        )}

        {/* Campaigns List */}
        {!loading && (
          <div className="space-y-6">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-surface-white rounded-xl border border-hairline p-6 shadow-soft-flat space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-pill bg-brand-blue-light text-brand-navy font-semibold text-caption uppercase">
                        {camp.platform} · {camp.targetLanguage}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-pill bg-surface-soft text-neutral-600 font-medium text-caption">
                        {tStatus(camp.status)}
                      </span>
                    </div>
                    <h2 className="text-title-sm font-semibold text-ink">{camp.title}</h2>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-caption text-neutral-400 block font-medium">
                      Escrow Budget
                    </span>
                    <span className="text-title-sm font-mono font-bold text-ink">
                      ₹{Number(camp.budget).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Milestones Section */}
                <div className="space-y-3">
                  <span className="text-caption text-neutral-400 font-semibold uppercase tracking-wider block">
                    Campaign Deliverables & ASCI Verification
                  </span>

                  {(camp.milestones || []).map((m: any) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-lg bg-surface-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-body-sm text-ink">{m.title}</span>
                          <span className="px-2 py-0.5 rounded-pill bg-surface-white text-neutral-600 font-mono text-caption border border-hairline">
                            {tStatus(m.status)}
                          </span>
                        </div>

                        {m.deliverableUrl && (
                          <a
                            href={m.deliverableUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-caption text-brand-navy font-medium hover:underline"
                          >
                            <span>View Live Deliverable</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {m.asciDisclosureVerified ? (
                          <div className="inline-flex items-center gap-1 text-caption text-status-success font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{t('asciVerified')}</span>
                          </div>
                        ) : m.deliverableUrl ? (
                          <div className="inline-flex items-center gap-1 text-caption text-status-danger font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{t('asciMissing')}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-body text-ink">
                          ₹{Number(m.amount).toLocaleString('en-IN')}
                        </span>

                        {m.status === 'pending_submission' && (
                          <button
                            type="button"
                            onClick={() => setSelectedMilestone({ ...m, campaignId: camp.id })}
                            className="px-3 py-1.5 rounded-md bg-ink text-on-dark hover:bg-ink-pressed font-semibold text-caption transition-colors"
                          >
                            {t('submitDeliverable')}
                          </button>
                        )}

                        {m.status === 'submitted_for_review' && (
                          <button
                            type="button"
                            onClick={() => handleReleasePayout(m.id)}
                            disabled={releasingMilestoneId === m.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-status-success text-on-dark font-semibold text-caption hover:opacity-90 transition-opacity"
                          >
                            {releasingMilestoneId === m.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            <span>{t('releasePayout')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Deliverable Modal */}
        {selectedMilestone && (
          <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-white rounded-xl border border-hairline max-w-lg w-full p-6 space-y-4 shadow-soft-raised">
              <div className="space-y-1">
                <h3 className="text-title-sm font-semibold text-ink">
                  {t('submitDeliverable')}
                </h3>
                <p className="text-caption text-neutral-500">{selectedMilestone.title}</p>
              </div>

              {delivSuccess ? (
                <div className="p-6 text-center space-y-2 bg-status-success-bg text-status-success rounded-lg">
                  <CheckCircle2 className="w-8 h-8 mx-auto" />
                  <p className="font-semibold text-body-sm">Deliverable Submitted for Review!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitDeliverable} className="space-y-4">
                  <div>
                    <label className="text-caption font-medium text-neutral-600 block mb-1">
                      Live Video / Reel URL
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://youtube.com/shorts/... or https://instagram.com/reel/..."
                      value={deliverableUrl}
                      onChange={(e) => setDeliverableUrl(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-hairline text-caption font-medium text-ink focus:outline-none focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="text-caption font-medium text-neutral-600 block mb-1">
                      Post Caption Text (ASCI Verification)
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Paste post description with mandatory #Ad or #PaidPartnership tags..."
                      value={captionText}
                      onChange={(e) => setCaptionText(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-hairline text-caption font-medium text-ink"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMilestone(null)}
                      className="px-4 py-2 rounded-lg border border-hairline font-semibold text-caption text-neutral-600 hover:bg-surface-faint"
                    >
                      {tCommon('cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={submittingDeliv}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ink text-on-dark font-semibold text-caption hover:bg-ink-pressed disabled:bg-neutral-300"
                    >
                      {submittingDeliv ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Submit for Review</span>
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
