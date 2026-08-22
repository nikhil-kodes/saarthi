'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import {
  Calendar as CalendarIcon,
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
  LayoutGrid,
  ListFilter,
  CalendarDays,
  FileText,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  AmbientOrbs,
  ArchitecturalGrid,
  SpecularHorizonBeam,
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
  const isHi = locale === 'hi';
  const otherLocale = isHi ? 'en' : 'hi';

  const [instances, setInstances] = useState<ComplianceInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>('calendar');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Calendar Navigation State
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Default Feb 2026
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
        body: JSON.stringify({ year: currentDate.getFullYear() }),
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

  // Filter instances
  const filteredInstances = instances.filter((inst) => {
    // Date Filter (if selected on calendar)
    if (selectedDate && viewMode === 'calendar') {
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

  const compliantCount = instances.filter((i) => i.status === 'compliant').length;
  const dueSoonCount = instances.filter((i) => i.status === 'due_soon').length;
  const overdueCount = instances.filter((i) => i.status === 'overdue').length;

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
    setCurrentDate(new Date(2026, 1, 1));
    setSelectedDate(null);
  };

  const getStatusBadge = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-caption font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{tStatus('compliant')}</span>
          </span>
        );
      case 'due_soon':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-caption font-bold animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{tStatus('due_soon')}</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-caption font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>{tStatus('overdue')}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 text-caption font-medium">
            <span>{status}</span>
          </span>
        );
    }
  };

  // Modern Shadcn / 21st.dev Style Calendar Grid View
  const renderShadcnCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="min-h-[90px] sm:min-h-[110px] bg-neutral-50/50 rounded-2xl border border-neutral-200/40 p-2 opacity-30"
        />
      );
    }

    const todayStr = new Date(2026, 1, 20).toDateString(); // Simulated live day in Feb 2026

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toDateString();
      const isToday = dateStr === todayStr;
      const isSelected = selectedDate?.toDateString() === dateStr;

      const dayInstances = instances.filter((i) => new Date(i.dueDate).toDateString() === dateStr);
      const hasCompliant = dayInstances.some((i) => i.status === 'compliant');
      const hasDueSoon = dayInstances.some((i) => i.status === 'due_soon');
      const hasOverdue = dayInstances.some((i) => i.status === 'overdue');

      days.push(
        <button
          key={`day-${d}`}
          onClick={() => setSelectedDate(isSelected ? null : date)}
          className={`min-h-[90px] sm:min-h-[110px] flex flex-col justify-between p-2.5 rounded-2xl border transition-all text-left relative overflow-hidden group ${
            isSelected
              ? 'bg-[#123A73] border-[#123A73] text-white shadow-md ring-2 ring-[#123A73]/30 scale-[1.01]'
              : isToday
              ? 'bg-orange-50/60 border-[#ef4d23] text-neutral-900 shadow-sm'
              : 'bg-white border-neutral-200/80 hover:bg-neutral-50/80 hover:border-neutral-300'
          }`}
        >
          {/* Day Number Header */}
          <div className="flex items-center justify-between w-full">
            <span
              className={`text-caption sm:text-body-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                isSelected
                  ? 'bg-white text-[#123A73]'
                  : isToday
                  ? 'bg-[#ef4d23] text-white'
                  : 'text-neutral-700 group-hover:text-neutral-900'
              }`}
            >
              {d}
            </span>

            {dayInstances.length > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : hasOverdue
                    ? 'bg-red-100 text-red-700'
                    : hasDueSoon
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {dayInstances.length} {isHi ? 'नियत' : 'due'}
              </span>
            )}
          </div>

          {/* Event Pills list for Desktop */}
          <div className="w-full space-y-1 my-1">
            {dayInstances.slice(0, 2).map((inst) => (
              <div
                key={inst.id}
                className={`truncate text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  isSelected
                    ? 'bg-white/15 text-white'
                    : inst.status === 'overdue'
                    ? 'bg-red-50 text-red-700 border border-red-200/60'
                    : inst.status === 'due_soon'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                }`}
              >
                {inst.requirement?.title?.slice(0, 18) || 'Statutory Return'}
              </div>
            ))}
            {dayInstances.length > 2 && (
              <span className={`text-[9px] font-bold block ${isSelected ? 'text-white/80' : 'text-neutral-400'}`}>
                +{dayInstances.length - 2} more
              </span>
            )}
          </div>

          {/* Colored Status Indicator Dots */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {hasCompliant && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" />}
            {hasDueSoon && <div className="w-2 h-2 rounded-full bg-amber-500 shadow-xs animate-pulse" />}
            {hasOverdue && <div className="w-2 h-2 rounded-full bg-red-500 shadow-xs" />}
          </div>
        </button>
      );
    }

    return (
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-8 shadow-sm space-y-5">
        {/* Calendar Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={handleToday}
              className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-caption font-bold text-neutral-700 transition-colors"
            >
              {t('today')}
            </button>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-caption font-semibold text-[#ef4d23] hover:underline"
              >
                {isHi ? 'फ़िल्टर हटाएं' : 'Clear Date Filter'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 transition-colors"
              aria-label={t('prevMonth')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 transition-colors"
              aria-label={t('nextMonth')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday Names Header */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
          {dayNames.map((day) => (
            <div key={day} className="text-caption font-bold text-neutral-400 uppercase tracking-wider py-1">
              {day}
            </div>
          ))}
        </div>

        {/* 7-Column Day Cards Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">{days}</div>
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
            <span className="text-title-sm text-ink font-bold">{tCommon('appName')}</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('dashboard')}
            </Link>
            <Link
              href="/compliance"
              className="px-3 py-1.5 rounded-lg text-body-sm font-bold text-brand-navy bg-brand-blue-light/50 transition-colors"
            >
              {tNav('compliance')}
            </Link>
            <Link
              href="/licenses"
              className="px-3 py-1.5 rounded-lg text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {isHi ? 'लाइसेंस एवं NSWS' : 'Licenses & NSWS'}
            </Link>
            <Link
              href="/notices"
              className="px-3 py-1.5 rounded-lg text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('notices')}
            </Link>
            <Link
              href="/schemes"
              className="px-3 py-1.5 rounded-lg text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('schemes')}
            </Link>
            <Link
              href="/score"
              className="px-3 py-1.5 rounded-lg text-body-sm font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('score')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/compliance"
            locale={otherLocale}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-white text-caption font-semibold text-ink hover:bg-surface-faint transition-colors border border-hairline"
          >
            <Globe className="w-3.5 h-3.5 text-brand-navy" />
            <span>{otherLocale === 'hi' ? 'हिंदी' : 'English'}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-left relative z-10">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <CalendarDays className="w-7 h-7 text-[#ef4d23]" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">{t('title')}</h1>
            </div>
            <p className="text-body-sm text-neutral-500">{t('subtitle')}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle Switcher */}
            <div className="bg-neutral-200/70 p-1 rounded-2xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-caption font-bold transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>{isHi ? 'कैलेंडर' : 'Month Grid'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('agenda')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-caption font-bold transition-all ${
                  viewMode === 'agenda'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <ListFilter className="w-4 h-4" />
                <span>{isHi ? 'समयरेखा' : 'Agenda View'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#123A73] hover:bg-[#0e2d5a] text-white font-bold text-caption transition-all shadow-sm disabled:opacity-60 active:scale-[0.98]"
            >
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? t('generating') : t('generateButton')}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              {isHi ? 'कुल नियत अनुपालन' : 'Total Tracked'}
            </span>
            <span className="text-2xl font-extrabold text-neutral-900">{instances.length}</span>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
              {isHi ? 'समय पर पूर्ण' : 'Compliant'}
            </span>
            <span className="text-2xl font-extrabold text-emerald-600">{compliantCount}</span>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
              {isHi ? 'शीघ्र देय' : 'Due Soon (7 Days)'}
            </span>
            <span className="text-2xl font-extrabold text-amber-600">{dueSoonCount}</span>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider block">
              {isHi ? 'विलंबित / जोखिम' : 'Overdue Deadlines'}
            </span>
            <span className="text-2xl font-extrabold text-red-600">{overdueCount}</span>
          </div>
        </div>

        {/* Calendar View Component */}
        {viewMode === 'calendar' && renderShadcnCalendar()}

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 space-y-4 shadow-sm">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-neutral-100">
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-caption font-bold transition-all ${
                selectedStatus === 'ALL'
                  ? 'bg-[#123A73] text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t('allFilter')} ({instances.length})
            </button>
            <button
              onClick={() => setSelectedStatus('DUE_SOON')}
              className={`px-3.5 py-1.5 rounded-xl text-caption font-bold transition-all ${
                selectedStatus === 'DUE_SOON'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 border border-amber-200/60 hover:bg-amber-100'
              }`}
            >
              {t('dueSoonFilter')} ({dueSoonCount})
            </button>
            <button
              onClick={() => setSelectedStatus('OVERDUE')}
              className={`px-3.5 py-1.5 rounded-xl text-caption font-bold transition-all ${
                selectedStatus === 'OVERDUE'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-red-50 text-red-700 border border-red-200/60 hover:bg-red-100'
              }`}
            >
              {t('overdueFilter')} ({overdueCount})
            </button>
            <button
              onClick={() => setSelectedStatus('COMPLIANT')}
              className={`px-3.5 py-1.5 rounded-xl text-caption font-bold transition-all ${
                selectedStatus === 'COMPLIANT'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100'
              }`}
            >
              {t('compliantFilter')} ({compliantCount})
            </button>
          </div>

          {/* Category Tabs & Instant Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-caption">
              {[
                { id: 'ALL', label: t('categoryAll') },
                { id: 'taxation', label: isHi ? 'कर व जीएसटी' : 'Taxation & GST' },
                { id: 'labor_and_employment', label: isHi ? 'श्रम एवं ईपीएफ' : 'Labour & EPF/ESI' },
                { id: 'industry_specific', label: isHi ? 'उद्योग / FSSAI' : 'Industry & FSSAI' },
                { id: 'corporate_and_msme', label: isHi ? 'कॉर्पोरेट व MSME' : 'MSME & Corporate' },
                { id: 'environmental', label: isHi ? 'पर्यावरण (UPPCB)' : 'Pollution (UPPCB)' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 bg-neutral-100 hover:bg-neutral-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tCommon('search')}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-caption font-medium text-ink placeholder:text-neutral-400 focus:outline-none focus:border-[#ef4d23] focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="p-16 text-center bg-white rounded-3xl border border-neutral-200/80 space-y-3 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-[#ef4d23] mx-auto" />
            <p className="text-body-sm text-neutral-500">{tCommon('loading')}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredInstances.length === 0 && (
          <div className="p-16 text-center bg-white rounded-3xl border border-neutral-200/80 space-y-4 shadow-sm">
            <CalendarDays className="w-12 h-12 text-neutral-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-body font-bold text-neutral-900">{t('emptyStateTitle')}</h3>
              <p className="text-body-sm text-neutral-500 max-w-md mx-auto">
                {t('emptyStateSubtitle')}
              </p>
            </div>
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ef4d23] hover:bg-[#d83f17] text-white font-bold text-caption transition-all shadow-sm active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('generateButton')}</span>
            </button>
          </div>
        )}

        {/* Active Filing Items List View */}
        {!loading && filteredInstances.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-title-sm font-bold text-neutral-900">
                {isHi ? 'वैधानिक अनुपालन सूची' : 'Statutory Compliance Deadlines'}
              </h2>
              <span className="text-caption font-mono text-neutral-400">
                {filteredInstances.length} {isHi ? 'प्रविष्टियां' : 'Records'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredInstances.map((inst) => {
                const req = inst.requirement;
                const displayTitle =
                  locale === 'hi' && req?.titleHi ? req.titleHi : req?.title || 'Statutory Filing';
                const displayDesc =
                  locale === 'hi' && req?.descriptionHi ? req.descriptionHi : req?.description;
                const penalty =
                  locale === 'hi' && req?.penaltyDetailsHi
                    ? req.penaltyDetailsHi
                    : req?.penaltyDetails;

                return (
                  <div
                    key={inst.id}
                    className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(inst.status)}
                          <span className="px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[11px] font-bold uppercase tracking-wider">
                            {req?.category}
                          </span>
                          {req?.jurisdictionState && (
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200/60">
                              {req.jurisdictionState} State Act
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-neutral-900 leading-snug">{displayTitle}</h3>
                        <p className="text-caption text-neutral-600 line-clamp-2 leading-relaxed">
                          {displayDesc}
                        </p>
                      </div>

                      {/* Due Date Badge with Tabular Numbers */}
                      <div className="text-left sm:text-right shrink-0 bg-[#fbfaf8] border border-neutral-200 rounded-2xl p-3.5 min-w-[140px]">
                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                          {t('dueDate')}
                        </span>
                        <span className="text-base font-mono font-extrabold text-neutral-900 block mt-0.5">
                          {inst.dueDate}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Row: Governing Act & Penalty Risk */}
                    <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-caption">
                      <div className="text-neutral-500 font-medium">
                        <strong className="text-neutral-800">{t('act')}:</strong> {req?.actName}
                      </div>

                      {penalty && (
                        <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-200/60 text-red-800 font-medium flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                          <span className="text-[12px]">
                            <strong className="font-bold">Penalty:</strong> {penalty}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions & Proof Details */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                      {inst.status === 'compliant' && inst.filingRecord ? (
                        <div className="inline-flex items-center gap-2 text-caption text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>
                            {t('filedOn')} {inst.filingRecord.filedAt.slice(0, 10)}
                          </span>
                          {inst.filingRecord.acknowledgementNumber && (
                            <span className="font-mono text-neutral-600">
                              (ARN: {inst.filingRecord.acknowledgementNumber})
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
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ef4d23] hover:bg-[#d83f17] text-white font-bold text-caption transition-all shadow-md shadow-[#ef4d23]/20 active:scale-[0.98]"
                        >
                          <FileCheck className="w-4 h-4" />
                          <span>{t('markAsFiled')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Record Filing Proof Modal Dialog */}
      {filingInstance && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-neutral-900">{t('markAsFiled')}</h3>
                <p className="text-caption text-neutral-500 font-medium">
                  {filingInstance.requirement?.title}
                </p>
              </div>
              <button
                onClick={() => setFilingInstance(null)}
                className="p-1 rounded-xl text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {filingSuccess ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <p className="text-body font-bold text-emerald-800">{t('filingSuccess')}</p>
              </div>
            ) : (
              <form onSubmit={handleFilingSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-caption font-bold text-neutral-800">
                    {t('ackNumber')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={ackNumber}
                    onChange={(e) => setAckNumber(e.target.value)}
                    placeholder={t('ackPlaceholder')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 font-mono text-caption text-ink placeholder:font-sans placeholder:text-neutral-400 focus:outline-none focus:border-[#ef4d23]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-caption font-bold text-neutral-800">
                    {t('docUrl')}
                  </label>
                  <input
                    type="url"
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    placeholder={t('docPlaceholder')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 font-mono text-caption text-ink placeholder:font-sans placeholder:text-neutral-400 focus:outline-none focus:border-[#ef4d23]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-caption font-bold text-neutral-800">
                    {t('notesLabel')}
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('notesPlaceholder')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-caption text-ink placeholder:text-neutral-400 focus:outline-none focus:border-[#ef4d23]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setFilingInstance(null)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 text-caption font-bold text-neutral-700 hover:bg-neutral-50"
                  >
                    {tCommon('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFiling}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ef4d23] hover:bg-[#d83f17] text-white font-bold text-caption disabled:opacity-60 transition-all shadow-md active:scale-[0.98]"
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

