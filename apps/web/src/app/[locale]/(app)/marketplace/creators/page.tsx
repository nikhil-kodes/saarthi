'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import {
  Video,
  Sparkles,
  CheckCircle2,
  Filter,
  Search,
  Globe,
  Loader2,
  Users,
  ShieldCheck,
  ArrowRight,
  Send,
  PlusCircle,
  PlaySquare,
} from 'lucide-react';
import {
  AmbientOrbs,
  ArchitecturalGrid,
  SpecularHorizonBeam,
} from '@/components/ui/ambient-background';

export default function CreatorDirectoryPage() {
  const t = useTranslations('creators');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const params = useParams();

  const locale = (params.locale as string) || 'en';
  const isHi = locale === 'hi';
  const otherLocale = isHi ? 'en' : 'hi';

  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [selectedNiche, setSelectedNiche] = useState('ALL');

  // Campaign Modal State
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignDesc, setCampaignDesc] = useState('');
  const [deliverableType, setDeliverableType] = useState('video_reel');
  const [budget, setBudget] = useState(15000);
  const [submittingCampaign, setSubmittingCampaign] = useState(false);
  const [campaignSuccess, setCampaignSuccess] = useState(false);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      let url = '/api/creators?';
      if (selectedLanguage !== 'ALL') url += `language=${selectedLanguage}&`;
      if (selectedNiche !== 'ALL') url += `niche=${selectedNiche}&`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCreators(json.data);
      }
    } catch (err) {
      console.error('Failed to load creators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, [selectedLanguage, selectedNiche]);

  const handleLaunchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreator) return;

    try {
      setSubmittingCampaign(true);
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: selectedCreator.id,
          title: campaignTitle,
          description: campaignDesc,
          targetAudienceLanguage: selectedCreator.primaryLanguage || selectedCreator.primary_language || 'hi',
          totalBudget: budget,
          deliverables: [
            {
              type: deliverableType,
              payout: budget,
              dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
            },
          ],
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCampaignSuccess(true);
        setTimeout(() => {
          setCampaignSuccess(false);
          setShowCampaignModal(false);
          setSelectedCreator(null);
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to launch campaign:', err);
    } finally {
      setSubmittingCampaign(false);
    }
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
              href="/marketplace/creators"
              className="px-3 py-1.5 rounded-md text-body-sm font-semibold text-brand-navy bg-brand-blue-light/50 transition-colors"
            >
              {t('creatorsTab')}
            </Link>
            <Link
              href="/marketplace/campaigns"
              className="px-3 py-1.5 rounded-md text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {t('campaignsTab')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/marketplace/creators"
            locale={otherLocale}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-surface-white text-caption font-medium text-ink hover:bg-surface-faint transition-colors border border-hairline"
          >
            <Globe className="w-3.5 h-3.5 text-brand-navy" />
            <span>{otherLocale === 'hi' ? 'हिंदी' : 'English'}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Video className="w-6 h-6 text-brand-navy" />
            <h1 className="text-title-lg font-semibold text-ink">{t('title')}</h1>
          </div>
          <p className="text-body-sm text-neutral-500">{t('subtitle')}</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-surface-white rounded-xl border border-hairline p-4 flex flex-wrap items-center gap-3 shadow-soft-flat text-caption">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-neutral-500 mr-1">
              {isHi ? 'बोली / भाषा:' : 'Dialect:'}
            </span>
            {[
              { id: 'ALL', labelEn: 'All Dialects', labelHi: 'सभी बोलियां' },
              { id: 'hi', labelEn: 'Hindi', labelHi: 'हिंदी' },
              { id: 'bho', labelEn: 'Bhojpuri', labelHi: 'भोजपुरी (पूर्वांचल)' },
              { id: 'awa', labelEn: 'Awadhi', labelHi: 'अवधी (अवध)' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`px-3 py-1 rounded-pill font-medium transition-colors ${
                  selectedLanguage === lang.id
                    ? 'bg-brand-navy text-on-dark font-semibold'
                    : 'bg-surface-soft text-neutral-600 hover:bg-surface-faint'
                }`}
              >
                {isHi ? lang.labelHi : lang.labelEn}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="font-semibold text-neutral-500 mr-1">
              {isHi ? 'उद्योग क्षेत्र:' : 'Niche:'}
            </span>
            {[
              { id: 'ALL', labelEn: 'All', labelHi: 'सभी' },
              { id: 'food_fmcg', labelEn: 'Food / FMCG', labelHi: 'खाद्य / FMCG' },
              { id: 'agritech', labelEn: 'Agritech', labelHi: 'कृषि तकनीक' },
              { id: 'handloom_crafts', labelEn: 'Handloom & ODOP', labelHi: 'हथकरघा एवं ODOP' },
              { id: 'manufacturing_sme', labelEn: 'Manufacturing', labelHi: 'विनिर्माण' },
            ].map((niche) => (
              <button
                key={niche.id}
                onClick={() => setSelectedNiche(niche.id)}
                className={`px-3 py-1 rounded-pill font-medium transition-colors ${
                  selectedNiche === niche.id
                    ? 'bg-brand-navy text-on-dark font-semibold'
                    : 'bg-surface-soft text-neutral-600 hover:bg-surface-faint'
                }`}
              >
                {isHi ? niche.labelHi : niche.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center bg-surface-white rounded-xl border border-hairline space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-navy mx-auto" />
            <p className="text-body-sm text-neutral-500">{tCommon('loading')}</p>
          </div>
        )}

        {/* Creators Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => {
              const displayBio = isHi && creator.bioHi ? creator.bioHi : creator.bio;

              return (
                <div
                  key={creator.id}
                  className="bg-surface-white rounded-xl border border-hairline p-5 shadow-soft-flat hover:shadow-soft-raised transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-pill bg-brand-blue-light text-brand-navy font-semibold text-caption uppercase">
                        {creator.platform} · {creator.primaryLanguage || creator.primary_language || 'Hindi'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-caption text-status-success font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{isHi ? 'ASCI सत्यापित' : 'ASCI Verified'}</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-body font-semibold text-ink">{creator.displayName}</h3>
                      <p className="text-caption font-mono text-neutral-400">{creator.handle}</p>
                    </div>

                    <p className="text-caption text-neutral-600 line-clamp-3">{displayBio}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-hairline">
                    <div className="flex items-center justify-between text-caption">
                      <div>
                        <span className="text-neutral-400 block font-medium">
                          {isHi ? 'फॉलोअर्स' : 'Followers'}
                        </span>
                        <span className="font-mono font-bold text-ink">
                          {Number(creator.followerCount || creator.follower_count || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-neutral-400 block font-medium">
                          {isHi ? 'रील दर' : 'Reel Rate'}
                        </span>
                        <span className="font-mono font-bold text-ink">
                          ₹{creator.rateCard?.reel_video?.toLocaleString('en-IN') || '5,000'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCreator(creator);
                        setCampaignTitle(
                          isHi
                            ? `${creator.displayName} के साथ ब्रांड प्रचार`
                            : `Brand Campaign with ${creator.displayName}`
                        );
                        setBudget(creator.rateCard?.dedicated_video || 12000);
                        setShowCampaignModal(true);
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-ink text-on-dark hover:bg-ink-pressed font-semibold text-caption transition-colors shadow-soft-flat"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t('launchCampaign')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Campaign Creation Modal */}
        {showCampaignModal && selectedCreator && (
          <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-white rounded-xl border border-hairline max-w-lg w-full p-6 space-y-4 shadow-soft-raised text-left">
              <div className="space-y-1">
                <h3 className="text-title-sm font-semibold text-ink">
                  {t('createCampaignTitle')}
                </h3>
                <p className="text-caption text-neutral-500">
                  {isHi ? 'क्रिएटर के साथ अनुबंध:' : 'Collaborating with'} {selectedCreator.displayName} ({selectedCreator.handle})
                </p>
              </div>

              {campaignSuccess ? (
                <div className="p-6 text-center space-y-2 bg-status-success-bg text-status-success rounded-lg">
                  <CheckCircle2 className="w-8 h-8 mx-auto" />
                  <p className="font-semibold text-body-sm">
                    {isHi
                      ? 'अभियान शुरू हुआ एवं एस्क्रो राशि सुरक्षित रूप से जमा हो गई!'
                      : 'Campaign Launched & Escrow Funds Locked!'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLaunchCampaign} className="space-y-3.5">
                  <div>
                    <label className="text-caption font-medium text-neutral-600 block mb-1">
                      {t('campaignTitleLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('campaignTitlePlaceholder')}
                      value={campaignTitle}
                      onChange={(e) => setCampaignTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-hairline text-caption font-medium text-ink focus:outline-none focus:border-brand-blue"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-caption font-medium text-neutral-600 block mb-1">
                        {t('budgetLabel')}
                      </label>
                      <input
                        type="number"
                        required
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-lg border border-hairline text-caption font-mono font-bold text-ink"
                      />
                    </div>
                    <div>
                      <label className="text-caption font-medium text-neutral-600 block mb-1">
                        {t('deliverableTypeLabel')}
                      </label>
                      <select
                        value={deliverableType}
                        onChange={(e) => setDeliverableType(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg border border-hairline text-caption font-medium text-ink"
                      >
                        <option value="video_reel">{isHi ? 'इंस्टाग्राम रील / यूट्यूब शॉर्ट' : 'Instagram Reel / YouTube Short'}</option>
                        <option value="dedicated_video">{isHi ? 'विस्तृत वीडियो समीक्षा (Long Form)' : 'Dedicated Long Video Review'}</option>
                        <option value="story_post">{isHi ? 'स्टोरी श्रृंखला + लिंक' : 'Story Series + Link'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-caption font-medium text-neutral-600 block mb-1">
                      {isHi ? 'अभियान विवरण एवं मुख्य बिंदु' : 'Campaign Creative Brief & Key Selling Points'}
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder={
                        isHi
                          ? 'लक्षित ग्राहक जनसांख्यिकी, मुख्य उत्पाद लाभ और अनिवार्य हैशटैग उल्लेख...'
                          : 'Specify your target customer demographic, key product benefits, and mandatory hashtag inclusions...'
                      }
                      value={campaignDesc}
                      onChange={(e) => setCampaignDesc(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-hairline text-caption font-medium text-ink"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-surface-soft text-caption text-neutral-600 space-y-1">
                    <span className="font-semibold text-ink block">
                      {isHi ? 'अनिवार्य ASCI अनुपालन सूचना' : 'Mandatory ASCI Compliance Notice'}
                    </span>
                    <span>
                      {isHi
                        ? 'माइलस्टोन भुगतान तभी अनलॉक होगा जब क्रिएटर वैधानिक #Ad या #Sponsored टैग के साथ वीडियो प्रकाशित करेगा।'
                        : 'Milestone payout will be unlocked once creator publishes the deliverable with statutory #Ad or #Sponsored tags.'}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCampaignModal(false)}
                      className="px-4 py-2 rounded-lg border border-hairline font-semibold text-caption text-neutral-600 hover:bg-surface-faint"
                    >
                      {tCommon('cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={submittingCampaign}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ink text-on-dark font-semibold text-caption hover:bg-ink-pressed disabled:bg-neutral-300"
                    >
                      {submittingCampaign ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>{isHi ? 'एस्क्रो जमा करें एवं अभियान शुरू करें' : 'Fund Escrow & Launch'}</span>
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
