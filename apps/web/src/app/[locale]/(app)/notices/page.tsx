'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import {
  FileWarning,
  UploadCloud,
  Clock,
  AlertTriangle,
  FileText,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Globe,
  MessageSquare,
  Send,
  ShieldAlert,
  FileUp,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  AmbientOrbs,
  ArchitecturalGrid,
  SpecularHorizonBeam,
} from '@/components/ui/ambient-background';

export default function NoticesHubPage() {
  const t = useTranslations('notices');
  const tStatus = useTranslations('status');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const params = useParams();

  const locale = (params.locale as string) || 'en';
  const isHi = locale === 'hi';
  const otherLocale = isHi ? 'en' : 'hi';

  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('GST_DRC01A_Discrepancy.pdf');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // WhatsApp simulation state
  const [waMessage, setWaMessage] = useState('');
  const [waResponse, setWaResponse] = useState<string | null>(null);
  const [waLoading, setWaLoading] = useState(false);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notices');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNotices(json.data);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleUploadNotice = async () => {
    try {
      setUploading(true);
      setUploadError(null);

      let finalFileName = selectedFileName;
      let finalFileUrl = `https://storage.saarthi.app/notices/${selectedFileName}`;
      let finalMimeType = 'application/pdf';
      let finalSize = 245000;

      // If user selected a real file, upload to R2 first
      if (selectedFile) {
        finalFileName = selectedFile.name;
        finalMimeType = selectedFile.type || 'application/pdf';
        finalSize = selectedFile.size;

        // 1. Get presigned R2 upload URL
        const presignRes = await fetch('/api/storage/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: selectedFile.name,
            contentType: finalMimeType,
            documentType: 'notice',
            businessId: 'active-business',
          }),
        });
        const presignJson = await presignRes.json();

        if (presignJson.success && presignJson.data?.presignedUrl) {
          // 2. Upload file directly to R2 bucket
          await fetch(presignJson.data.presignedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': finalMimeType },
            body: selectedFile,
          });
          finalFileUrl = presignJson.data.fileUrl;
        }
      }

      // 3. Register notice with AI OCR & Plain Language Explainer
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: finalFileName,
          fileUrl: finalFileUrl,
          mimeType: finalMimeType,
          fileSizeBytes: finalSize,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (json.data) {
          setNotices((prev) => [json.data, ...prev.filter((n) => n.id !== json.data.id)]);
        }
        await fetchNotices();
      } else {
        setUploadError(json.error?.message || 'Notice OCR processing failed');
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSimulateWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waMessage.trim() || waLoading) return;

    try {
      setWaLoading(true);
      const res = await fetch('/api/webhooks/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderPhone: '+919876543210',
          messageText: waMessage,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setWaResponse(json.data.response);
      }
    } catch (err) {
      console.error('WhatsApp simulation failed:', err);
    } finally {
      setWaLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f4f0] font-['Inter',sans-serif] selection:bg-[#ef4d23]/20 selection:text-[#ef4d23] relative overflow-hidden">
      {/* Dynamic Ambient Background Layer */}
      <AmbientOrbs theme="warm" intensity="subtle" />
      <ArchitecturalGrid gridSize={32} />
      <div className="pointer-events-none absolute inset-0 ambient-dot-grid opacity-50" aria-hidden="true" />

      {/* Topbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm relative">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center space-x-2.5 group">
            <SaarthiLogo className="w-8 h-8" />
            <span className="text-title-sm text-ink font-bold">{tCommon('appName')}</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1 text-body-sm">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('dashboard')}
            </Link>
            <Link
              href="/compliance"
              className="px-3 py-1.5 rounded-lg font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('compliance')}
            </Link>
            <Link
              href="/notices"
              className="px-3 py-1.5 rounded-lg font-bold text-brand-navy bg-brand-blue-light/50"
            >
              {tNav('notices')}
            </Link>
            <Link
              href="/copilot"
              className="px-3 py-1.5 rounded-lg font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('copilot')}
            </Link>
            <Link
              href="/score"
              className="px-3 py-1.5 rounded-lg font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('score')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/notices"
            locale={otherLocale}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-soft text-caption font-semibold text-ink hover:bg-surface-faint transition-colors border border-hairline"
          >
            <Globe className="w-3.5 h-3.5 text-brand-navy" />
            <span>{otherLocale === 'hi' ? 'हिंदी' : 'English'}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <FileWarning className="w-6 h-6 text-status-danger" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">{t('title')}</h1>
            </div>
            <p className="text-body-sm text-neutral-500">{t('subtitle')}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-danger-bg text-status-danger font-bold text-caption">
              <span className="w-2 h-2 rounded-full bg-status-danger animate-pulse" />
              <span>{isHi ? '30-सेकंड विधिक रक्षा' : '30-Second Legal Defense'}</span>
            </span>
          </div>
        </div>

        {/* OCR Dropzone & Ingest Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-surface-white rounded-2xl border border-hairline p-6 sm:p-8 space-y-5 shadow-soft-flat">
            <div className="space-y-1">
              <h2 className="text-title-sm font-bold text-ink">{t('uploadTitle')}</h2>
              <p className="text-caption text-neutral-500">{t('uploadSubtitle')}</p>
            </div>

            {/* Drag & Drop Real File Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-300 hover:border-[#ef4d23] rounded-xl p-6 text-center space-y-3 bg-white/60 hover:bg-white transition-all cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setSelectedFile(f);
                }}
              />
              <div className="w-12 h-12 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center text-[#ef4d23] mx-auto transition-colors">
                <FileUp className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                {selectedFile ? (
                  <div className="space-y-1">
                    <span className="text-body-sm font-bold text-ink block text-[#ef4d23]">
                      ✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                    <p className="text-caption text-neutral-500">
                      {isHi ? 'फ़ाइल अपलोड करने के लिए नीचे बटन दबाएं' : 'Ready to analyze — click Analyze Notice below'}
                    </p>
                  </div>
                ) : (
                  <>
                    <span className="text-body-sm font-bold text-ink block">
                      {isHi ? 'नोटिस PDF या फ़ोटो यहाँ चुनें / छोड़ें' : 'Upload your statutory notice (PDF or Image)'}
                    </span>
                    <p className="text-caption text-neutral-400">
                      {isHi ? 'Cloudflare R2 एवं Gemma AI द्वारा सुरक्षित विश्लेषण (अधिकतम 25MB)' : 'Direct R2 secure upload with Gemma AI OCR analysis (Max 25MB)'}
                    </p>
                  </>
                )}
              </div>

              {/* Sample Preset Selector */}
              <div className="pt-3 border-t border-neutral-200/60" onClick={(e) => e.stopPropagation()}>
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                  {isHi ? 'या नमूना नोटिस चुनें:' : 'Or test with a sample notice:'}
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {[
                    { name: 'GST_DRC01A_Discrepancy.pdf', label: isHi ? 'जीएसटी DRC-01A' : 'GST DRC-01A' },
                    { name: 'IT_Section_148A_Notice.pdf', label: isHi ? 'आयकर धारा 148A' : 'IT Sec 148A' },
                    { name: 'UP_Labour_Inspectorate_SCN.pdf', label: isHi ? 'UP श्रम नोटिस SCN' : 'UP Labour SCN' },
                    { name: 'UP_Pollution_Control_SCN.pdf', label: isHi ? 'UP प्रदूषण CTO SCN' : 'UP Pollution SCN' },
                  ].map((sample) => (

                    <button
                      key={sample.name}
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setSelectedFileName(sample.name);
                      }}
                      className={`px-3 py-1 rounded-lg text-caption font-semibold transition-all border ${
                        !selectedFile && selectedFileName === sample.name
                          ? 'bg-[#123A73] text-white border-[#123A73] shadow-sm'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-caption font-medium">
                {uploadError}
              </div>
            )}

            <button
              onClick={handleUploadNotice}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#ef4d23] hover:bg-[#d83f17] text-white font-bold text-button active:scale-[0.98] disabled:opacity-60 transition-all shadow-md shadow-[#ef4d23]/20"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isHi ? 'R2 पर अपलोड एवं AI विश्लेषण जारी...' : 'Uploading to R2 & Analyzing Notice...'}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>{isHi ? 'नोटिस का AI विश्लेषण करें (30 सेकंड)' : 'Analyze Statutory Notice (30-Sec AI)'}</span>
                </>
              )}
            </button>
          </div>

          {/* WhatsApp Inbound Simulator */}
          <div className="lg:col-span-5 bg-surface-white rounded-2xl border border-hairline p-6 space-y-4 shadow-soft-flat flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                    WA
                  </div>
                  <div>
                    <h3 className="text-body-sm font-bold text-ink">{t('whatsappSimulatorTitle')}</h3>
                    <p className="text-[10px] text-neutral-400">
                      {isHi ? 'व्हाट्सएप AI पूर्वावलोकन' : 'Outbound WhatsApp Preview'}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success text-[10px] font-bold">
                  {isHi ? 'सक्रिय' : 'Active'}
                </span>
              </div>

              <p className="text-caption text-neutral-500">{t('whatsappSubtitle')}</p>

              {/* Chat Bubble Display */}
              {waResponse && (
                <div className="p-3.5 rounded-xl bg-[#E9FBE7] border border-emerald-200 text-ink space-y-1 shadow-sm">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                    {isHi ? 'सारथी व्हाट्सएप सहायक' : 'Saarthi WhatsApp Copilot'}
                  </span>
                  <p className="text-caption leading-relaxed whitespace-pre-wrap">{waResponse}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSimulateWhatsApp} className="space-y-2 pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  placeholder={t('whatsappPlaceholder')}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-hairline text-caption font-medium text-ink focus:outline-none focus:border-brand-blue"
                />
                <button
                  type="submit"
                  disabled={waLoading}
                  className="px-4 py-2.5 rounded-xl bg-ink text-on-dark font-bold text-caption hover:bg-ink-pressed disabled:bg-neutral-300 transition-colors"
                >
                  {waLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Notices Feed Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-title-sm font-bold text-ink">
              {isHi ? 'विश्लेषित वैधानिक नोटिस' : 'Analyzed Statutory Notices'}
            </h2>
            <span className="text-caption text-neutral-400 font-mono">
              {notices.length} {isHi ? 'दर्ज' : 'Recorded'}
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-surface-white rounded-xl border border-hairline">
              <Loader2 className="w-8 h-8 animate-spin text-brand-navy mx-auto" />
            </div>
          ) : notices.length === 0 ? (
            <div className="p-12 text-center bg-surface-white rounded-2xl border border-hairline space-y-2">
              <CheckCircle2 className="w-8 h-8 text-status-success mx-auto" />
              <h3 className="text-body font-bold text-ink">{t('noNoticesTitle')}</h3>
              <p className="text-caption text-neutral-500 max-w-sm mx-auto">{t('noNoticesSubtitle')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {notices.map((notice) => {
                return (
                  <div
                    key={notice.id}
                    className="bg-surface-white rounded-2xl border border-hairline p-5 sm:p-6 shadow-soft-flat hover:shadow-soft-raised transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-surface-soft border border-hairline text-neutral-700 font-bold text-[11px]">
                            {notice.authority}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              notice.severity === 'critical'
                                ? 'bg-status-danger-bg text-status-danger'
                                : 'bg-status-warning-bg text-status-warning'
                            }`}
                          >
                            {tStatus(notice.severity || 'urgent')}
                          </span>
                        </div>
                        <h3 className="text-title-sm font-bold text-ink">{notice.noticeType}</h3>
                        <p className="text-caption text-neutral-400 font-mono">
                          Ref: {notice.noticeNumber || notice.id}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-caption text-neutral-400 block">{t('demandAmount')}</span>
                          <span className="text-title-sm font-mono font-bold text-status-danger">
                            ₹{notice.demandAmount?.toLocaleString('en-IN') || '0'}
                          </span>
                        </div>

                        <Link
                          href={`/notices/${notice.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink text-on-dark font-bold text-caption hover:bg-ink-pressed active:scale-[0.98] transition-all"
                        >
                          <span>{t('viewExplanation')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* 3-Part Plain Breakdown Snippet */}
                    <div className="p-4 rounded-xl bg-surface-soft border border-hairline grid grid-cols-1 sm:grid-cols-3 gap-3 text-caption">
                      <div>
                        <span className="font-bold text-ink block mb-0.5">
                          {isHi ? '1. क्या हुआ है' : '1. What Happened'}
                        </span>
                        <p className="text-neutral-600 line-clamp-2">
                          {notice.plainLanguageSummary || (isHi ? 'जीएसटी रिटर्न में विसंगति पाई गई।' : 'GSTR discrepancy observed.')}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-status-danger block mb-0.5">
                          {isHi ? '2. देय कर जोखिम' : '2. Demand Risk'}
                        </span>
                        <p className="text-neutral-700 font-mono font-semibold">
                          ₹{notice.demandAmount?.toLocaleString('en-IN') || '0'} {isHi ? '+ जुर्माना' : '+ Penalty'}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-brand-navy block mb-0.5">
                          {isHi ? '3. सुझाई गई कार्यवाही' : '3. Recommended Action'}
                        </span>
                        <p className="text-neutral-600 line-clamp-2">
                          {notice.recommendedAction || (isHi ? '7 दिनों के भीतर मिलान विवरण प्रस्तुत करें।' : 'Submit reconciliation table in 7 days.')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
