'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import {
  User,
  Building2,
  FileCheck2,
  UploadCloud,
  Users2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Globe,
  Info,
  CheckCircle2,
  FileIcon,
  X
} from 'lucide-react';
import {
  AmbientOrbs,
  ArchitecturalGrid,
  SpecularHorizonBeam,
} from '@/components/ui/ambient-background';

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

function FileUploadField({ label, onUploadSuccess, businessId, documentType }: { label: string, onUploadSuccess: () => void, businessId: string, documentType: string }) {
  const t = useTranslations('onboarding');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    setFile(selected);
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Get presigned URL
      const res = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selected.name,
          contentType: selected.type,
          documentType,
          businessId,
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to get upload URL');

      const { presignedUrl, fileKey, fileUrl } = data.data;

      // 2. Upload to R2
      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': selected.type },
        body: selected
      });
      if (!uploadRes.ok) throw new Error('Upload to storage failed');

      // 3. Save to business_documents
      const docRes = await fetch('/api/business/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          documentType,
          fileName: selected.name,
          fileKey,
          fileUrl,
          mimeType: selected.type,
          fileSizeBytes: selected.size
        })
      });
      const docData = await docRes.json();
      if (!docData.success) throw new Error(docData.error || 'Failed to save document metadata');

      setSuccess(true);
      onUploadSuccess();
    } catch (err: any) {
      setError(err.message || 'Upload error');
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-body-sm font-medium text-ink">{label}</label>
      <div 
        className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          success ? 'border-status-success bg-status-success-bg/30' : 
          error ? 'border-status-danger bg-status-danger-bg/30' : 
          'border-neutral-300 hover:border-brand-blue bg-surface-white'
        }`}
        onClick={() => !uploading && !success && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf,image/jpeg,image/png,image/webp" 
          onChange={handleFileChange} 
          disabled={uploading || success}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
            <span className="text-body-sm text-neutral-600">{t('uploading')}</span>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center justify-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-status-success" />
            <span className="text-body-sm font-medium text-status-success">{file?.name}</span>
            <span className="text-caption text-neutral-500">{t('uploaded')}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
            <UploadCloud className="w-6 h-6 text-neutral-400" />
            <span className="text-body-sm text-neutral-600">{error || t('dragDrop')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const t = useTranslations('onboarding');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();

  const locale = (params.locale as string) || 'en';
  const otherLocale = locale === 'en' ? 'hi' : 'en';

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Personal Details
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [personalState, setPersonalState] = useState('Uttar Pradesh');

  // Load existing profile
  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data.profile) {
          const p = res.data.profile;
          if (p.full_name) setFullName(p.full_name);
          if (p.phone_number) setPhoneNumber(p.phone_number.replace('+91', ''));
          if (p.date_of_birth) setDob(p.date_of_birth);
          if (p.address_line1) setAddress1(p.address_line1);
          if (p.address_line2) setAddress2(p.address_line2);
          if (p.city) setCity(p.city);
          if (p.pincode) setPincode(p.pincode);
          if (p.state) setPersonalState(p.state);
        }
      }).catch(console.error);
  }, []);

  // Step 2: Form State
  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [sector, setSector] = useState(SECTORS[0]!.value);
  const [jurisdictionState, setJurisdictionState] = useState('UP');
  const [employeeCountBand, setEmployeeCountBand] = useState<'1-9' | '10-19' | '20-49' | '50-249' | '250+'>('10-19');
  const [turnoverBand, setTurnoverBand] = useState<'micro' | 'small' | 'medium' | 'other'>('micro');

  // Step 3: Registrations
  const [pan, setPan] = useState('');
  const [gstin, setGstin] = useState('');
  const [udyamNumber, setUdyamNumber] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');

  // Business Tracking
  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(null);

  // Step 5: Team Invite
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ca_partner' | 'team_member'>('ca_partner');

  const handleNext = async () => {
    setLoading(true);
    setError(null);

    try {
      if (step === 1) {
        // Save Personal Details
        const res = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: fullName,
            phone_number: `+91${phoneNumber}`,
            date_of_birth: dob || null,
            address_line1: address1,
            address_line2: address2,
            city,
            pincode,
            state: personalState
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to save profile');
        setStep(2);
      } 
      else if (step === 2) {
        setStep(3);
      }
      else if (step === 3) {
        // Create Business
        if (!createdBusinessId) {
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
            throw new Error(json.error?.message || 'Failed to create business profile.');
          }
          setCreatedBusinessId(json.data.business.id);
        }
        setStep(4);
      }
      else if (step === 4) {
        setStep(5);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!createdBusinessId) return;
    setLoading(true);
    try {
      // Send Team Invite
      if (inviteEmail.trim()) {
        await fetch('/api/business/team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: createdBusinessId,
            email: inviteEmail.trim(),
            roleName: inviteRole,
          }),
        }).catch((err) => console.error('Team invite failed:', err));
      }
      router.push(`/onboarding/verify?businessId=${createdBusinessId}`);
    } catch (err: any) {
      setError(err.message || 'Error completing onboarding.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      handleNext();
    } else {
      handleFinish();
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f4f0] font-['Inter',sans-serif] selection:bg-[#ef4d23]/20 selection:text-[#ef4d23] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <AmbientOrbs theme="warm" intensity="subtle" />
      <ArchitecturalGrid gridSize={32} />
      <div className="pointer-events-none absolute inset-0 ambient-dot-grid opacity-50" aria-hidden="true" />

      <div className="w-full max-w-2xl flex items-center justify-between mb-6 relative z-10">
        <Link href="/" className="flex items-center space-x-2.5">
          <SaarthiLogo className="w-8 h-8" />
          <span className="text-title-sm text-ink font-semibold">{tCommon('appName')}</span>
        </Link>
        <Link
          href="/onboarding"
          locale={otherLocale}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-caption font-medium text-ink hover:bg-white transition-colors border border-neutral-200/80 shadow-2xs"
        >
          <Globe className="w-3.5 h-3.5 text-brand-navy" />
          <span>{otherLocale === 'hi' ? 'हिंदी' : 'English'}</span>
        </Link>
      </div>

      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-neutral-200/80 p-6 sm:p-8 space-y-6 relative z-10 overflow-hidden">
        <SpecularHorizonBeam color="#ef4d23" className="top-0" />
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-title-md font-semibold text-ink">{t('wizardTitle')}</h1>
            <span className="text-caption font-mono text-neutral-500">
              Step {step} of 5
            </span>
          </div>
          <p className="text-body-sm text-neutral-500">{t('wizardSubtitle')}</p>
          <div className="grid grid-cols-5 gap-2 pt-2">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-pill transition-colors ${
                  step >= idx ? 'bg-brand-navy' : 'bg-surface-faint'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-md bg-status-danger-bg border border-status-danger/20 flex items-start gap-2.5 text-body-sm text-status-danger">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-hairline text-brand-navy font-semibold text-body">
                <User className="w-4 h-4" />
                <span>{t('step1')}</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-body-sm font-medium text-ink">{t('fullNameLabel')} *</label>
                  <input required value={fullName} onChange={e => setFullName(e.target.value)} placeholder={t('fullNamePlaceholder')} className="w-full px-3.5 py-2.5 rounded-md border border-hairline text-body focus:ring-2 focus:ring-brand-blue-light" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-body-sm font-medium text-ink">{t('phoneLabel')} *</label>
                  <div className="flex border border-hairline rounded-md focus-within:ring-2 focus-within:ring-brand-blue-light overflow-hidden">
                    <span className="bg-surface-soft px-3 py-2.5 text-neutral-500 border-r border-hairline">+91</span>
                    <input required type="tel" maxLength={10} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder={t('phonePlaceholder')} className="w-full px-3.5 py-2.5 text-body focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">{t('dobLabel')}</label>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full px-3.5 py-2.5 rounded-md border border-hairline text-body focus:ring-2 focus:ring-brand-blue-light" />
              </div>

              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">{t('address1Label')} *</label>
                <input required value={address1} onChange={e => setAddress1(e.target.value)} placeholder={t('address1Placeholder')} className="w-full px-3.5 py-2.5 rounded-md border border-hairline text-body focus:ring-2 focus:ring-brand-blue-light" />
              </div>

              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">{t('address2Label')}</label>
                <input value={address2} onChange={e => setAddress2(e.target.value)} placeholder={t('address2Placeholder')} className="w-full px-3.5 py-2.5 rounded-md border border-hairline text-body focus:ring-2 focus:ring-brand-blue-light" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-body-sm font-medium text-ink">{t('cityLabel')} *</label>
                  <input required value={city} onChange={e => setCity(e.target.value)} placeholder={t('cityPlaceholder')} className="w-full px-3.5 py-2.5 rounded-md border border-hairline text-body focus:ring-2 focus:ring-brand-blue-light" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-body-sm font-medium text-ink">{t('pincodeLabel')} *</label>
                  <input required maxLength={6} value={pincode} onChange={e => setPincode(e.target.value)} placeholder={t('pincodePlaceholder')} className="w-full px-3.5 py-2.5 rounded-md border border-hairline text-body focus:ring-2 focus:ring-brand-blue-light" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-body-sm font-medium text-ink">{t('stateLabelPersonal')} *</label>
                  <input required value={personalState} onChange={e => setPersonalState(e.target.value)} className="w-full px-3.5 py-2.5 rounded-md border border-hairline text-body focus:ring-2 focus:ring-brand-blue-light" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-hairline text-brand-navy font-semibold text-body">
                <Building2 className="w-4 h-4" />
                <span>{t('step2')}</span>
              </div>
              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">{t('legalNameLabel')} *</label>
                <input required value={legalName} onChange={(e) => setLegalName(e.target.value)} placeholder={t('legalNamePlaceholder')} className="w-full px-3.5 py-2.5 rounded-md border border-hairline text-body focus:ring-2 focus:ring-brand-blue-light" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">{t('tradeNameLabel')}</label>
                <input value={tradeName} onChange={(e) => setTradeName(e.target.value)} placeholder={t('tradeNamePlaceholder')} className="w-full px-3.5 py-2.5 rounded-md border border-hairline text-body focus:ring-2 focus:ring-brand-blue-light" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-body-sm font-medium text-ink">{t('sectorLabel')}</label>
                  <select value={sector} onChange={(e) => setSector(e.target.value)} className="w-full px-3.5 py-2.5 rounded-md border border-hairline text-body focus:ring-2 focus:ring-brand-blue-light">
                    {SECTORS.map((s) => (
                      <option key={s.value} value={s.value}>{locale === 'hi' ? s.labelHi : s.labelEn}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-body-sm font-medium text-ink">{t('stateLabel')}</label>
                  <select value={jurisdictionState} onChange={(e) => setJurisdictionState(e.target.value)} className="w-full px-3.5 py-2.5 rounded-md border border-hairline text-body focus:ring-2 focus:ring-brand-blue-light">
                    <option value="UP">Uttar Pradesh (Active Support)</option>
                    <option value="MH">Maharashtra (Coming Soon)</option>
                    <option value="DL">Delhi NCR (Coming Soon)</option>
                  </select>
                </div>
              </div>
              <div className="p-3 rounded-md bg-status-info-bg border border-status-info/20 flex items-start gap-2 text-caption text-brand-navy">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{t('upSupportedNotice')}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-body-sm font-medium text-ink">{t('employeeBandLabel')}</label>
                  <select value={employeeCountBand} onChange={(e) => setEmployeeCountBand(e.target.value as any)} className="w-full px-3.5 py-2.5 rounded-md border border-hairline text-body focus:ring-2 focus:ring-brand-blue-light">
                    <option value="1-9">1 - 9 Employees</option>
                    <option value="10-19">10 - 19 Employees</option>
                    <option value="20-49">20 - 49 Employees</option>
                    <option value="50-249">50 - 249 Employees</option>
                    <option value="250+">250+ Employees</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-body-sm font-medium text-ink">{t('turnoverBandLabel')}</label>
                  <select value={turnoverBand} onChange={(e) => setTurnoverBand(e.target.value as any)} className="w-full px-3.5 py-2.5 rounded-md border border-hairline text-body focus:ring-2 focus:ring-brand-blue-light">
                    <option value="micro">{t('turnoverMicro')}</option>
                    <option value="small">{t('turnoverSmall')}</option>
                    <option value="medium">{t('turnoverMedium')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-hairline text-brand-navy font-semibold text-body">
                <FileCheck2 className="w-4 h-4" />
                <span>{t('step3')}</span>
              </div>
              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">{t('panLabel')}</label>
                <input maxLength={10} value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} placeholder={t('panPlaceholder')} className="w-full px-3.5 py-2.5 rounded-md border border-hairline font-mono text-body focus:ring-2 focus:ring-brand-blue-light" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">{t('gstinLabel')}</label>
                <input maxLength={15} value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} placeholder={t('gstinPlaceholder')} className="w-full px-3.5 py-2.5 rounded-md border border-hairline font-mono text-body focus:ring-2 focus:ring-brand-blue-light" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">{t('udyamLabel')}</label>
                <input value={udyamNumber} onChange={(e) => setUdyamNumber(e.target.value.toUpperCase())} placeholder={t('udyamPlaceholder')} className="w-full px-3.5 py-2.5 rounded-md border border-hairline font-mono text-body focus:ring-2 focus:ring-brand-blue-light" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">{t('fssaiLabel')}</label>
                <input maxLength={14} value={fssaiNumber} onChange={(e) => setFssaiNumber(e.target.value)} placeholder={t('fssaiPlaceholder')} className="w-full px-3.5 py-2.5 rounded-md border border-hairline font-mono text-body focus:ring-2 focus:ring-brand-blue-light" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-hairline text-brand-navy font-semibold text-body">
                <UploadCloud className="w-4 h-4" />
                <span>{t('step4')}</span>
              </div>
              <p className="text-body-sm text-neutral-500">{t('docsSubtitle')}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FileUploadField label={t('gstCert')} documentType="gst_certificate" businessId={createdBusinessId!} onUploadSuccess={() => {}} />
                <FileUploadField label={t('udyamCert')} documentType="udyam_certificate" businessId={createdBusinessId!} onUploadSuccess={() => {}} />
                <FileUploadField label={t('panCard')} documentType="pan_card" businessId={createdBusinessId!} onUploadSuccess={() => {}} />
                <FileUploadField label={t('incorpDoc')} documentType="incorporation_document" businessId={createdBusinessId!} onUploadSuccess={() => {}} />
                <FileUploadField label={t('fssaiCert')} documentType="fssai_license" businessId={createdBusinessId!} onUploadSuccess={() => {}} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-hairline text-brand-navy font-semibold text-body">
                <Users2 className="w-4 h-4" />
                <span>{t('step5')}</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-body font-semibold text-ink">{t('inviteTeamTitle')}</h3>
                <p className="text-body-sm text-neutral-500">{t('inviteTeamSubtitle')}</p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">{t('inviteEmailLabel')}</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="ca.partner@firm.in" className="w-full px-3.5 py-2.5 rounded-md border border-hairline text-body focus:ring-2 focus:ring-brand-blue-light" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-ink">{t('inviteRoleLabel')}</label>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)} className="w-full px-3.5 py-2.5 rounded-md border border-hairline text-body focus:ring-2 focus:ring-brand-blue-light">
                  <option value="ca_partner">{t('roleCaPartner')}</option>
                  <option value="team_member">{t('roleTeamMember')}</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-hairline">
            {step > 1 ? (
              <button
                type="button"
                disabled={loading}
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
              ) : step < 5 ? (
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
