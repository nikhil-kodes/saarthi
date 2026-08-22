'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import Gauge from '@/components/Gauge';
import {
  AmbientOrbs,
  ArchitecturalGrid,
  SpecularHorizonBeam,
} from '@/components/ui/ambient-background';
import {
  Calendar,
  Sparkles,
  FileText,
  HelpCircle,
  Landmark,
  CreditCard,
  Activity,
  Store,
  Video,
  Briefcase,
  ShieldAlert,
  Globe,
  ShieldCheck,
  Clock,
  Coins,
  ChevronRight,
  CheckCircle2,
  Award,
} from 'lucide-react';

export default function UnifiedDashboardPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isHi = locale === 'hi';
  const otherLocale = isHi ? 'en' : 'hi';
  const t = useTranslations('dashboard');

  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  
  const [nextDeadline, setNextDeadline] = useState<{ title: string; days: number; status: string } | null>(null);
  const [matchedSchemes, setMatchedSchemes] = useState(0);
  const [activeNotices, setActiveNotices] = useState(0);
  const [recentFilings, setRecentFilings] = useState(0);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [scoreRes, compRes, schemeRes, noticeRes] = await Promise.all([
          fetch('/api/score'),
          fetch('/api/compliance/instances'),
          fetch('/api/schemes'),
          fetch('/api/notices')
        ]);
        
        if (scoreRes.ok) {
          const scoreData = await scoreRes.json();
          if (scoreData.success && scoreData.data) {
            setScore(scoreData.data.score || 0);
          }
        }
        
        if (compRes.ok) {
          const compData = await compRes.json();
          if (compData.success && Array.isArray(compData.data)) {
            const instances = compData.data;
            const compliant = instances.filter((i: any) => i.status === 'compliant').length;
            setRecentFilings(compliant);
            
            const pending = instances.filter((i: any) => i.status === 'due_soon' || i.status === 'overdue');
            if (pending.length > 0) {
              pending.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
              const nearest = pending[0];
              const daysDiff = Math.ceil((new Date(nearest.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              
              setNextDeadline({
                title: isHi ? (nearest.requirement?.titleHi || nearest.requirement?.title) : nearest.requirement?.title,
                days: Math.abs(daysDiff),
                status: nearest.status
              });
            }
          }
        }
        
        if (schemeRes.ok) {
          const schemeData = await schemeRes.json();
          if (schemeData.success && Array.isArray(schemeData.data)) {
            setMatchedSchemes(schemeData.data.filter((s: any) => s.eligibilityMet).length);
          }
        }
        
        if (noticeRes.ok) {
          const noticeData = await noticeRes.json();
          if (noticeData.success && Array.isArray(noticeData.data)) {
            setActiveNotices(noticeData.data.filter((n: any) => n.status !== 'resolved').length);
          }
        }
      } catch (e) {
        console.error('Failed to fetch dashboard data', e);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [isHi]);

  const hubs = [
    {
      title: 'Compliance Calendar',
      titleHi: 'अनुपालन कैलेंडर',
      description: 'Automated statutory return schedules, due dates, penalties, and filing receipts.',
      descriptionHi: 'स्वचालित वैधानिक रिटर्न शेड्यूल, समय-सीमाएं, जुर्माना गणना एवं रसीद प्रबंधन।',
      href: '/compliance',
      icon: Calendar,
      badge: isHi ? 'केंद्रीय व UP अधिनियम' : 'Central & UP Acts',
    },
    {
      title: 'Notice Hub & OCR Explainer',
      titleHi: 'नोटिस हब एवं OCR विश्लेषक',
      description: 'Instant OCR notice breakdown, 3-part explainer, and pre-filled formal reply letters.',
      descriptionHi: 'तत्काल OCR नोटिस विश्लेषण, 3-चरणीय सरल विवरण एवं तैयार कानूनी उत्तर पत्र।',
      href: '/notices',
      icon: FileText,
      badge: 'DRC-01A / SCN',
    },
    {
      title: 'License & NSWS Monitoring',
      titleHi: 'लाइसेंस एवं NSWS ट्रैकर',
      description: 'Personalized Micro/Small/Medium statutory licenses matrix with 1-click NSWS AI assistant.',
      descriptionHi: 'सूक्ष्म, लघु एवं मध्यम उद्योगों के लिए आवश्यक लाइसेंस व 1-क्लिक NSWS पोर्टल सहायक।',
      href: '/licenses',
      icon: Award,
      badge: isHi ? '1-क्लिक NSWS' : 'NSWS AI Assist',
    },
    {
      title: 'Compliance Copilot',
      titleHi: 'AI अनुपालन सहायक',
      description: 'Grounded AI legal advisory citing Central & UP Acts, rules, and gazetted circulars.',
      descriptionHi: 'केंद्रीय व UP अधिनियमों और सरकारी परिपत्रों के संदर्भ के साथ कानूनी सलाह।',
      href: '/copilot',
      icon: HelpCircle,
      badge: isHi ? 'विधिक RAG AI' : 'Grounded RAG',
    },
    {
      title: 'Regulatory Intelligence',
      titleHi: 'नियामक आसूचना',
      description: 'Daily distilled notifications, gazetted circulars, and sector impact matrices.',
      descriptionHi: 'दैनिक अधिसूचनाएं, सरकारी गजट सारांश और उद्योग क्षेत्र प्रभाव विश्लेषण।',
      href: '/regulatory',
      icon: Sparkles,
      badge: isHi ? 'लाइव फीड' : 'Live Feed',
    },
    {
      title: 'Government Schemes & Subsidies',
      titleHi: 'सरकारी योजनाएं एवं सब्सिडी',
      description: 'Matched Central & UP State financial schemes, 25% capital subsidy, and Mudra credit.',
      descriptionHi: '25% पूंजीगत सब्सिडी, ब्याज छूट, ODOP सहायता और मुद्रा ऋण मिलान।',
      href: '/schemes',
      icon: Landmark,
      badge: isHi ? '25% पूंजीगत सब्सिडी' : '25% Capital Match',
    },
    {
      title: 'Compliance Health Score',
      titleHi: 'अनुपालन स्वास्थ्य स्कोर',
      description: 'Objective 5-pillar trust score (300 - 900) unlocking bank loans & B2B credit terms.',
      descriptionHi: '300-900 का निष्पक्ष विश्वास स्कोर जो बैंक ऋण और अनुकूल व्यावसायिक शर्तें दिलाए।',
      href: '/score',
      icon: Activity,
      badge: isHi ? '300 - 900 अंक' : '300 - 900 Pts',
    },
    {
      title: 'B2B Supplier Marketplace',
      titleHi: 'B2B सप्लायर मार्केटप्लेस',
      description: 'Direct source industrial packaging, ingredients & machinery with escrow safety.',
      descriptionHi: 'औद्योगिक पैकेजिंग, कच्चा माल और मशीनरी सीधे खरीदें — एस्क्रो सुरक्षा के साथ।',
      href: '/marketplace/suppliers',
      icon: Store,
      badge: isHi ? 'एस्क्रो सुरक्षित' : 'Escrow Protected',
    },
    {
      title: 'Vernacular Creator Marketplace',
      titleHi: 'क्षेत्रीय क्रिएटर मार्केटप्लेस',
      description: 'Contract regional video creators across UP with mandatory ASCI disclosure tags.',
      descriptionHi: 'भोजपुरी, अवधी व हिंदी में स्थानीय क्रिएटर्स से प्रचार — ASCI अनुपालन के साथ।',
      href: '/marketplace/creators',
      icon: Video,
      badge: isHi ? 'ASCI #Ad जांच' : 'ASCI #Ad Check',
    },
    {
      title: 'Payments & Billing Hub',
      titleHi: 'भुगतान एवं बिलिंग हब',
      description: 'Simulated Razorpay checkout for compliance fees and 1-click escrow refunds.',
      descriptionHi: 'अनुपालन शुल्क का भुगतान और सुरक्षित एस्क्रो रिफंड प्रबंधन।',
      href: '/payments',
      icon: CreditCard,
      badge: isHi ? 'सुरक्षित भुगतान' : 'Razorpay Sandbox',
    },
    {
      title: 'CA Partner Client Portal',
      titleHi: 'सीए पार्टनर पोर्टल',
      description: 'Multi-tenant client portfolio oversight and 1-click statutory compliance export.',
      descriptionHi: 'मल्टी-क्लाइंट पोर्टफोलियो निगरानी एवं 1-क्लिक वैधानिक रिपोर्ट निर्यात।',
      href: '/ca/clients',
      icon: Briefcase,
      badge: isHi ? 'सीए एक्सेस' : 'CA Scoped',
    },
    {
      title: 'Platform Administration',
      titleHi: 'मंच प्रशासन व सुरक्षा',
      description: 'Global tenant metrics, system security audit explorer, and queue health monitoring.',
      descriptionHi: 'सुरक्षा ऑडिट लॉग, कतार स्वास्थ्य निगरानी एवं व्यवस्थापक नियंत्रण।',
      href: '/admin',
      icon: ShieldAlert,
      badge: isHi ? 'सुपरएडमिन' : 'Superadmin',
    },
  ];

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
            <div className="flex flex-col text-left">
              <span className="text-[16px] text-neutral-900 font-bold leading-none">
                {isHi ? 'सारथी' : 'Saarthi'}
              </span>
              <span className="text-[10px] text-neutral-400 font-medium">
                {isHi ? 'एंटरप्राइज कॉकपिट' : 'Enterprise Cockpit'}
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            locale={otherLocale}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[12px] font-semibold text-neutral-700 hover:text-neutral-900 border border-neutral-200/80 shadow-2xs transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-[#ef4d23]" />
            <span>{isHi ? 'English' : 'हिंदी'}</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 relative z-10">
        {/* Executive Banner Card with Luminous Glow & Specular Horizon */}
        <div className="bg-[#0b0f1a] text-white rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden border border-white/10">
          <SpecularHorizonBeam color="#ef4d23" className="top-0" />
          {/* Luminous Ambient Glow */}
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[450px] h-[250px] bg-[radial-gradient(circle,rgba(239,77,35,0.2)_0%,rgba(18,58,115,0.15)_50%,transparent_70%)] blur-[70px] pointer-events-none" />

          <div className="space-y-3 relative z-10 text-left">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isHi ? 'GSTIN एवं उद्यम सत्यापित' : 'GSTIN & Udyam Verified'}</span>
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                {isHi ? 'उत्तर प्रदेश जोन-1' : 'Uttar Pradesh Zone-1'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white">
              {isHi ? 'एंटरप्राइज ऑपरेशन्स कॉकपिट' : 'Enterprise Operations Cockpit'}
            </h1>
            <p className="text-[14px] text-neutral-300 max-w-xl leading-relaxed">
              {isHi
                ? 'विश्वास प्रोटोकॉल के अंतर्गत सभी वैधानिक फाइलिंग, योजनाएं और एस्क्रो लेनदेन की एकीकृत निगरानी।'
                : 'All statutory obligations, campaigns, and escrow transactions monitored under the Trust Protocol.'}
            </p>
          </div>

          {/* Mini Gauge Card */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-inner flex items-center gap-5 shrink-0 relative z-10">
            <div className="w-28">
              <Gauge value={Math.round((score / 900) * 100)} color="#ef4d23" showLabels={false} />
            </div>
            <div className="text-left space-y-1">
              <span className="text-[11px] text-neutral-300 block uppercase font-bold tracking-wider">
                {isHi ? 'हेल्थ रेटिंग' : 'Health Rating'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-mono font-extrabold text-white">{score}</span>
                <span className="text-[11px] text-neutral-400">/ 900</span>
              </div>
              <Link
                href="/score"
                className="inline-block px-3 py-1 rounded-full bg-[#ef4d23] text-white font-bold text-[11px] hover:bg-[#df4118] transition-colors shadow-sm"
              >
                {isHi ? 'ग्रेड AAA उत्कृष्ट' : 'Grade AAA'}
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Executive Stat Quick-Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-sm flex items-center justify-between hover:shadow-md hover:border-neutral-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f5f2ee] flex items-center justify-center text-[#ef4d23]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block font-medium">
                  {t('nextDeadline')}
                </span>
                <span className="text-[14px] font-bold text-neutral-900 font-mono">
                  {loading ? t('loading') : (nextDeadline ? `${nextDeadline.title} (${nextDeadline.status === 'overdue' ? t('daysOverdue', { days: nextDeadline.days }) : t('daysRemaining', { days: nextDeadline.days })})` : t('noData'))}
                </span>
              </div>
            </div>
            <Link href="/compliance" className="text-[12px] text-[#ef4d23] font-semibold hover:underline shrink-0 ml-2">
              {isHi ? 'दाखिल करें →' : 'File →'}
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-sm flex items-center justify-between hover:shadow-md hover:border-neutral-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f5f2ee] flex items-center justify-center text-[#ef4d23]">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block font-medium">
                  {t('matchedSubsidies')}
                </span>
                <span className="text-[14px] font-bold text-neutral-900 font-mono">
                  {loading ? t('loading') : t('eligibleSchemes', { count: matchedSchemes })}
                </span>
              </div>
            </div>
            <Link href="/schemes" className="text-[12px] text-[#ef4d23] font-semibold hover:underline shrink-0 ml-2">
              {isHi ? 'आवेदन करें →' : 'Apply →'}
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-sm flex items-center justify-between hover:shadow-md hover:border-neutral-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f5f2ee] flex items-center justify-center text-[#ef4d23]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block font-medium">
                  {t('statutoryNotices')}
                </span>
                <span className="text-[14px] font-bold text-neutral-900 font-mono">
                  {loading ? t('loading') : t('activeDemands', { count: activeNotices })}
                </span>
              </div>
            </div>
            <Link href="/notices" className="text-[12px] text-[#ef4d23] font-semibold hover:underline shrink-0 ml-2">
              {isHi ? 'OCR जांचें →' : 'OCR →'}
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-sm flex items-center justify-between hover:shadow-md hover:border-neutral-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f5f2ee] flex items-center justify-center text-[#ef4d23]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block font-medium">
                  {t('recentFilings')}
                </span>
                <span className="text-[14px] font-bold text-neutral-900 font-mono">
                  {loading ? t('loading') : t('compliantFilings', { count: recentFilings })}
                </span>
              </div>
            </div>
            <Link href="/score" className="text-[12px] text-[#ef4d23] font-semibold hover:underline shrink-0 ml-2">
              {isHi ? 'स्कोर देखें →' : 'Score →'}
            </Link>
          </div>
        </div>

        {/* Product Hubs Grid */}
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-neutral-900">
              {isHi ? 'ऑपरेशनल हब एवं टूल्स' : 'Operational Hubs & Tools'}
            </h2>
            <span className="text-[12px] text-neutral-400 font-mono">
              {isHi ? '11 मॉड्यूल सक्रिय' : '11 Modules Active'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {hubs.map((hub) => {
              const Icon = hub.icon;
              const displayTitle = isHi ? hub.titleHi : hub.title;
              const displayDesc = isHi ? hub.descriptionHi : hub.description;

              return (
                <div key={hub.href}>
                  <Link
                    href={hub.href}
                    className="bg-white/95 backdrop-blur-md rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-sm hover:shadow-lg hover:border-[#ef4d23]/50 transition-all flex flex-col justify-between space-y-4 group h-full relative overflow-hidden"
                  >
                    {/* Subtle top edge glow on hover */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-20 bg-[#ef4d23]/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[#f5f2ee] flex items-center justify-center text-[#ef4d23] group-hover:bg-[#ef4d23] group-hover:text-white transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#f5f2ee] border border-neutral-200/60 text-neutral-700 font-semibold text-[11px] group-hover:border-[#ef4d23]/30 transition-colors">
                          {hub.badge}
                        </span>
                      </div>

                      <h3 className="text-[16px] font-bold text-neutral-900 group-hover:text-[#ef4d23] transition-colors">
                        {displayTitle}
                      </h3>
                      <p className="text-[13px] text-neutral-600 line-clamp-2 leading-relaxed">{displayDesc}</p>
                    </div>

                    <div className="inline-flex items-center justify-between text-[12px] font-bold text-[#ef4d23] pt-3 border-t border-neutral-100 relative z-10">
                      <span>{isHi ? 'वर्कस्पेस खोलें' : 'Open Workspace'}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
