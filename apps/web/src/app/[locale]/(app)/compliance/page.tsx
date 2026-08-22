'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  Upload,
  Globe,
  Loader2,
} from 'lucide-react';
import {
  AmbientOrbs,
  ArchitecturalGrid,
} from '@/components/ui/ambient-background';
import type {
  ComplianceCategory,
  ComplianceInstance,
  ComplianceStatus,
} from '@saarthi/shared-types';

export default function ComplianceCalendarPage() {
  const t = useTranslations('compliance');
  const tStatus = useTranslations('status');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const params = useParams();

  const locale = (params.locale as string) || 'en';
  const otherLocale = locale === 'en' ? 'hi' : 'en';

  const [instances, setInstances] = useState<ComplianceInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Filing Modal State
  const [filingInstance, setFilingInstance] = useState<ComplianceInstance | null>(null);
  const [ackNumber, setAckNumber] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingFiling, setSubmittingFiling] = useState(false);
  const [filingSuccess, setFilingSuccess] = useState(false);

  const fetchInstances = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/compliance/instances');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setInstances(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch instances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await fetch('/api/compliance/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: new Date().getFullYear() }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchInstances();
      }
    } catch (err) {
      console.error('Failed to generate instances:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleFilingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filingInstance) return;

    try {
      setSubmittingFiling(true);
      const res = await fetch(`/api/compliance/instances/${filingInstance.id}/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acknowledgementNumber: ackNumber.trim() || undefined,
          documentUrl: docUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFilingSuccess(true);
        setTimeout(() => {
          setFilingSuccess(false);
          setFilingInstance(null);
          setAckNumber('');
          setDocUrl('');
          setNotes('');
          fetchInstances();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to submit filing:', err);
    } finally {
      setSubmittingFiling(false);
    }
  };

  const filteredInstances = instances.filter((inst) => {
    // Date Filter
    if (selectedDate) {
      const instDate = new Date(inst.dueDate);
      if (instDate.toDateString() !== selectedDate.toDateString()) {
        return false;
      }
    }

    // Status Filter
    if (selectedStatus === 'DUE_SOON' && inst.status !== 'due_soon') return false;
    if (selectedStatus === 'OVERDUE' && inst.status !== 'overdue') return false;
    if (selectedStatus === 'COMPLIANT' && inst.status !== 'compliant') return false;

    // Category Filter
    if (selectedCategory !== 'ALL' && inst.requirement?.category !== selectedCategory) {
      return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (inst.requirement?.title || '').toLowerCase();
      const titleHi = (inst.requirement?.titleHi || '').toLowerCase();
      const act = (inst.requirement?.actName || '').toLowerCase();
      return title.includes(q) || titleHi.includes(q) || act.includes(q);
    }

    return true;
  });

  const getStatusBadge = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill bg-status-success-bg text-status-success border border-status-success/20 text-caption font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{tStatus('compliant')}</span>
          </span>
        );
      case 'due_soon':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill bg-status-warning-bg text-status-warning border border-status-warning/20 text-caption font-semibold">
            <Clock className="w-3 h-3" />
            <span>{tStatus('due_soon')}</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill bg-status-danger-bg text-status-danger border border-status-danger/20 text-caption font-semibold">
            <AlertTriangle className="w-3 h-3" />
            <span>{tStatus('overdue')}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill bg-surface-faint text-neutral-600 border border-hairline text-caption font-semibold">
            <span>{status}</span>
          </span>
        );
    }
  };

  const monthNames = [
    t('january'), t('february'), t('march'), t('april'), t('may'), t('june'),
    t('july'), t('august'), t('september'), t('october'), t('november'), t('december')
  ];

  const dayNames = [t('sun'), t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat')];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-14 sm:h-20 bg-surface-white/40 border border-hairline/50 rounded-xl" />);
    }
    
    const todayStr = new Date().toDateString();
    
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toDateString();
      const isToday = dateStr === todayStr;
      const isSelected = selectedDate?.toDateString() === dateStr;
      
      const dayInstances = instances.filter(i => new Date(i.dueDate).toDateString() === dateStr);
      const hasCompliant = dayInstances.some(i => i.status === 'compliant');
      const hasDueSoon = dayInstances.some(i => i.status === 'due_soon');
      const hasOverdue = dayInstances.some(i => i.status === 'overdue');
      
      days.push(
        <button
          key={`day-${d}`}
          onClick={() => setSelectedDate(isSelected ? null : date)}
          className={`h-14 sm:h-20 flex flex-col items-center justify-start p-1.5 sm:p-2 border rounded-xl transition-all relative overflow-hidden group ${
            isSelected 
              ? 'bg-brand-navy border-brand-navy shadow-soft-flat text-on-dark' 
              : isToday 
                ? 'bg-brand-blue-light/30 border-brand-blue/30 text-brand-navy hover:bg-surface-soft hover:border-brand-blue/50' 
                : 'bg-surface-white border-hairline hover:bg-surface-soft hover:border-neutral-300'
          }`}
        >
          <span className={`text-[12px] sm:text-body-sm font-semibold mb-1 ${isSelected ? 'text-on-dark' : 'text-ink'}`}>
            {d}
          </span>
          
          <div className="flex gap-1">
             {hasCompliant && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-status-success shadow-[0_0_4px_rgba(22,163,74,0.4)]" />}
             {hasDueSoon && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-status-warning shadow-[0_0_4px_rgba(234,179,8,0.4)]" />}
             {hasOverdue && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-status-danger shadow-[0_0_4px_rgba(220,38,38,0.4)]" />}
          </div>
        </button>
      );
    }
    
    return (
      <div className="bg-surface-white rounded-xl border border-hairline p-4 sm:p-6 shadow-soft-flat">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-title-sm sm:text-title font-semibold text-ink">
              {monthNames[month]} {year}
            </h2>
            <button 
              onClick={handleToday}
              className="px-3 py-1 rounded-pill bg-surface-soft text-caption font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors border border-hairline"
            >
              {t('today')}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={handlePrevMonth} className="p-1.5 rounded-lg border border-hairline hover:bg-surface-soft text-neutral-600 hover:text-ink transition-colors" aria-label={t('prevMonth')}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={handleNextMonth} className="p-1.5 rounded-lg border border-hairline hover:bg-surface-soft text-neutral-600 hover:text-ink transition-colors" aria-label={t('nextMonth')}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-caption font-semibold text-neutral-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f4f0] font-['Inter',sans-serif] selection:bg-[#ef4d23]/20 selection:text-[#ef4d23] relative overflow-hidden">
      {/* Dynamic Ambient Background Layers */}
      <AmbientOrbs theme="cool" intensity="subtle" />
      <ArchitecturalGrid gridSize={32} />
      <div className="pointer-events-none absolute inset-0 ambient-dot-grid opacity-50" aria-hidden="true" />

      {/* Top Application Header */}
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
              className="px-3 py-1.5 rounded-md text-body-sm font-semibold text-brand-navy bg-brand-blue-light/50 transition-colors"
            >
              {tNav('compliance')}
            </Link>
            <Link
              href="/notices"
              className="px-3 py-1.5 rounded-md text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('notices')}
            </Link>
            <Link
              href="/score"
              className="px-3 py-1.5 rounded-md text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('score')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/compliance"
            locale={otherLocale}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-surface-white text-caption font-medium text-ink hover:bg-surface-faint transition-colors border border-hairline"
          >
            <Globe className="w-3.5 h-3.5 text-brand-navy" />
            <span>{otherLocale === 'hi' ? 'हिंदी' : 'English'}</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Title & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-6 h-6 text-brand-navy" />
              <h1 className="text-title-lg font-semibold text-ink">{t('title')}</h1>
            </div>
            <p className="text-body-sm text-neutral-500">{t('subtitle')}</p>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-ink text-on-dark font-semibold text-button hover:bg-ink-pressed disabled:bg-neutral-300 transition-colors shrink-0 shadow-soft-flat"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? t('generating') : t('generateButton')}</span>
          </button>
        </div>

        {/* Visual Calendar */}
        {renderCalendar()}

        {/* Filter Controls Bar */}
        <div className="bg-surface-white rounded-xl border border-hairline p-4 space-y-3.5 shadow-soft-flat">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-hairline">
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-3.5 py-1.5 rounded-pill text-caption font-semibold transition-colors ${
                selectedStatus === 'ALL'
                  ? 'bg-ink text-on-dark'
                  : 'bg-surface-soft text-neutral-600 hover:bg-surface-faint'
              }`}
            >
              {t('allFilter')} ({instances.length})
            </button>
            <button
              onClick={() => setSelectedStatus('DUE_SOON')}
              className={`px-3.5 py-1.5 rounded-pill text-caption font-semibold transition-colors ${
                selectedStatus === 'DUE_SOON'
                  ? 'bg-status-warning-bg text-status-warning border border-status-warning/30'
                  : 'bg-surface-soft text-neutral-600 hover:bg-surface-faint'
              }`}
            >
              {t('dueSoonFilter')} ({instances.filter((i) => i.status === 'due_soon').length})
            </button>
            <button
              onClick={() => setSelectedStatus('OVERDUE')}
              className={`px-3.5 py-1.5 rounded-pill text-caption font-semibold transition-colors ${
                selectedStatus === 'OVERDUE'
                  ? 'bg-status-danger-bg text-status-danger border border-status-danger/30'
                  : 'bg-surface-soft text-neutral-600 hover:bg-surface-faint'
              }`}
            >
              {t('overdueFilter')} ({instances.filter((i) => i.status === 'overdue').length})
            </button>
            <button
              onClick={() => setSelectedStatus('COMPLIANT')}
              className={`px-3.5 py-1.5 rounded-pill text-caption font-semibold transition-colors ${
                selectedStatus === 'COMPLIANT'
                  ? 'bg-status-success-bg text-status-success border border-status-success/30'
                  : 'bg-surface-soft text-neutral-600 hover:bg-surface-faint'
              }`}
            >
              {t('compliantFilter')} ({instances.filter((i) => i.status === 'compliant').length})
            </button>
          </div>

          {/* Category Tabs & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-caption">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedCategory === 'ALL'
                    ? 'bg-brand-navy text-on-dark'
                    : 'text-neutral-600 hover:bg-surface-faint'
                }`}
              >
                {t('categoryAll')}
              </button>
              <button
                onClick={() => setSelectedCategory('taxation')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedCategory === 'taxation'
                    ? 'bg-brand-navy text-on-dark'
                    : 'text-neutral-600 hover:bg-surface-faint'
                }`}
              >
                {t('categoryTaxation')}
              </button>
              <button
                onClick={() => setSelectedCategory('labor_and_employment')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedCategory === 'labor_and_employment'
                    ? 'bg-brand-navy text-on-dark'
                    : 'text-neutral-600 hover:bg-surface-faint'
                }`}
              >
                {t('categoryLabor')}
              </button>
              <button
                onClick={() => setSelectedCategory('industry_specific')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedCategory === 'industry_specific'
                    ? 'bg-brand-navy text-on-dark'
                    : 'text-neutral-600 hover:bg-surface-faint'
                }`}
              >
                {t('categoryIndustry')}
              </button>
              <button
                onClick={() => setSelectedCategory('corporate_and_msme')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedCategory === 'corporate_and_msme'
                    ? 'bg-brand-navy text-on-dark'
                    : 'text-neutral-600 hover:bg-surface-faint'
                }`}
              >
                {t('categoryCorporate')}
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tCommon('search')}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-md bg-surface-white border border-hairline text-caption text-ink placeholder:text-neutral-400 focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center bg-surface-white rounded-xl border border-hairline space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-navy mx-auto" />
            <p className="text-body-sm text-neutral-500">{tCommon('loading')}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredInstances.length === 0 && (
          <div className="p-12 text-center bg-surface-white rounded-xl border border-hairline space-y-4">
            <Calendar className="w-12 h-12 text-neutral-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-body font-semibold text-ink">{t('emptyStateTitle')}</h3>
              <p className="text-body-sm text-neutral-500 max-w-md mx-auto">
                {t('emptyStateSubtitle')}
              </p>
            </div>
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ink text-on-dark font-semibold text-button hover:bg-ink-pressed"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('generateButton')}</span>
            </button>
          </div>
        )}

        {/* Instances Grid / List View */}
        {!loading && filteredInstances.length > 0 && (
          <div className="space-y-3">
            {filteredInstances.map((inst) => {
              const req = inst.requirement;
              const displayTitle =
                locale === 'hi' && req?.titleHi ? req.titleHi : req?.title || 'Filing Requirement';
              const displayDesc =
                locale === 'hi' && req?.descriptionHi ? req.descriptionHi : req?.description;
              const penalty =
                locale === 'hi' && req?.penaltyDetailsHi
                  ? req.penaltyDetailsHi
                  : req?.penaltyDetails;

              return (
                <div
                  key={inst.id}
                  className="bg-surface-white rounded-xl border border-hairline p-5 shadow-soft-flat hover:shadow-soft-raised transition-all space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(inst.status)}
                        <span className="px-2 py-0.5 rounded-pill bg-surface-faint text-neutral-600 text-caption font-mono uppercase">
                          {req?.category}
                        </span>
                        {req?.jurisdictionState && (
                          <span className="px-2 py-0.5 rounded-pill bg-status-info-bg text-brand-navy text-caption font-semibold">
                            {req.jurisdictionState} State Act
                          </span>
                        )}
                      </div>

                      <h3 className="text-body font-semibold text-ink">{displayTitle}</h3>
                      <p className="text-caption text-neutral-600 line-clamp-2">{displayDesc}</p>
                    </div>

                    {/* Due Date Badge (Tabular Figures per DESIGN.md §4) */}
                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-caption font-medium text-neutral-500 uppercase tracking-wider">
                        {t('dueDate')}
                      </div>
                      <div className="text-body font-mono font-bold text-ink tracking-tight">
                        {inst.dueDate}
                      </div>
                    </div>
                  </div>

                  {/* Metadata Row: Governing Act & Penalty Risk */}
                  <div className="pt-2 border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-caption">
                    <div className="text-neutral-500">
                      <span className="font-semibold text-ink">{t('act')}:</span> {req?.actName}
                    </div>

                    {penalty && (
                      <div className="text-status-danger font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          <strong className="font-semibold">Penalty:</strong> {penalty}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Filing Proof Details */}
                  <div className="pt-2 border-t border-hairline flex items-center justify-between">
                    {inst.status === 'compliant' && inst.filingRecord ? (
                      <div className="inline-flex items-center gap-2 text-caption text-status-success font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {t('filedOn')} {inst.filingRecord.filedAt.slice(0, 10)}
                        </span>
                        {inst.filingRecord.acknowledgementNumber && (
                          <span className="font-mono text-neutral-600">
                            (Ref: {inst.filingRecord.acknowledgementNumber})
                          </span>
                        )}
                      </div>
                    ) : (
                      <div />
                    )}

                    {inst.status !== 'compliant' && (
                      <button
                        type="button"
                        onClick={() => setFilingInstance(inst)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-ink text-on-dark font-semibold text-caption hover:bg-ink-pressed transition-colors"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>{t('markAsFiled')}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Record Filing Proof Modal / Drawer */}
      {filingInstance && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface-white rounded-xl shadow-soft-raised border border-hairline p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <div className="space-y-0.5">
                <h3 className="text-body font-semibold text-ink">{t('markAsFiled')}</h3>
                <p className="text-caption text-neutral-500">
                  {filingInstance.requirement?.title}
                </p>
              </div>
              <button
                onClick={() => setFilingInstance(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {filingSuccess ? (
              <div className="p-6 rounded-lg bg-status-success-bg border border-status-success/20 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-status-success mx-auto" />
                <p className="text-body font-semibold text-status-success">{t('filingSuccess')}</p>
              </div>
            ) : (
              <form onSubmit={handleFilingSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-body-sm font-medium text-ink">
                    {t('ackNumber')}
                  </label>
                  <input
                    type="text"
                    value={ackNumber}
                    onChange={(e) => setAckNumber(e.target.value)}
                    placeholder={t('ackPlaceholder')}
                    className="w-full px-3.5 py-2 rounded-md bg-surface-white border border-hairline font-mono text-body-sm text-ink placeholder:font-sans placeholder:text-neutral-400 focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-body-sm font-medium text-ink">
                    {t('docUrl')}
                  </label>
                  <input
                    type="url"
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    placeholder={t('docPlaceholder')}
                    className="w-full px-3.5 py-2 rounded-md bg-surface-white border border-hairline font-mono text-body-sm text-ink placeholder:font-sans placeholder:text-neutral-400 focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-body-sm font-medium text-ink">
                    {t('notesLabel')}
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('notesPlaceholder')}
                    className="w-full px-3.5 py-2 rounded-md bg-surface-white border border-hairline text-body-sm text-ink placeholder:text-neutral-400 focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-hairline">
                  <button
                    type="button"
                    onClick={() => setFilingInstance(null)}
                    className="px-4 py-2 rounded-md border border-hairline text-caption font-medium text-ink hover:bg-surface-faint"
                  >
                    {tCommon('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFiling}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-ink text-on-dark font-semibold text-button hover:bg-ink-pressed disabled:bg-neutral-300"
                  >
                    {submittingFiling && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{t('submitFiling')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
