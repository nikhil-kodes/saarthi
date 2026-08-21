'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import {
  Bot,
  Send,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Globe,
  Loader2,
  FileText,
  User,
  Info,
  CheckCircle2,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    title: string;
    source: string;
    url?: string;
    relevance_score: number;
  }>;
  confidenceScore?: number;
  latencyMs?: number;
}

export default function ComplianceCopilotPage() {
  const t = useTranslations('copilot');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const params = useParams();

  const locale = (params.locale as string) || 'en';
  const isHi = locale === 'hi';
  const otherLocale = isHi ? 'en' : 'hi';

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: isHi
        ? 'नमस्ते! मैं आपका विधिक अनुपालन साथी (Compliance Copilot) हूँ। आप मुझसे जीएसटी, इनपुट टैक्स क्रेडिट, FSSAI, उद्यम या उत्तर प्रदेश सरकारी सब्सिडी एवं विधिक नियमों के बारे में पूछ सकते हैं।'
        : 'Welcome! I am your Compliance Copilot. Ask me any regulatory or statutory question regarding GST, GSTR-2B matching, FSSAI food licensing, Udyam MSME classification, or UP State incentives.',
    },
  ]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/regulatory/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend.trim(),
          locale,
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: json.data.answer,
          sources: json.data.sources,
          confidenceScore: json.data.confidence_score,
          latencyMs: json.data.latency_ms,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(json.error?.message || 'Failed to generate response.');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: isHi
            ? 'क्षमा करें, विधिक स्रोतों के विश्लेषण में समस्या आई। कृपया पुनः प्रयास करें।'
            : 'I encountered an error synthesizing statutory sources. Please retry.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQueries = [
    t('suggested1'),
    t('suggested2'),
    t('suggested3'),
  ];

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface-white/95 backdrop-blur-md border-b border-hairline px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-soft-flat">
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
              className="px-3 py-1.5 rounded-lg font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors"
            >
              {tNav('notices')}
            </Link>
            <Link
              href="/copilot"
              className="px-3 py-1.5 rounded-lg font-bold text-brand-navy bg-brand-blue-light/50"
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
            href="/copilot"
            locale={otherLocale}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-soft text-caption font-semibold text-ink hover:bg-surface-faint transition-colors border border-hairline"
          >
            <Globe className="w-3.5 h-3.5 text-brand-navy" />
            <span>{otherLocale === 'hi' ? 'हिंदी' : 'English'}</span>
          </Link>
        </div>
      </header>

      {/* Main Chat Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col space-y-5">
        {/* Title Header */}
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-blue" />
              <h1 className="text-xl font-bold text-ink">{t('title')}</h1>
            </div>
            <p className="text-caption text-neutral-500">{t('subtitle')}</p>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-status-success-bg text-status-success text-caption font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isHi ? 'प्रमाणित pgvector RAG AI' : 'Grounded pgvector RAG'}</span>
          </span>
        </div>

        {/* Suggested Queries Pills */}
        <div className="flex flex-wrap gap-2">
          {suggestedQueries.map((query, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(query)}
              className="px-3.5 py-1.5 rounded-full bg-surface-white border border-hairline hover:border-brand-navy text-caption font-medium text-neutral-700 hover:text-ink transition-all shadow-soft-flat"
            >
              {query}
            </button>
          ))}
        </div>

        {/* Chat History Scroll Area */}
        <div className="flex-1 space-y-4 overflow-y-auto min-h-[360px] max-h-[500px] p-4 bg-surface-white rounded-2xl border border-hairline shadow-soft-flat">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center shrink-0 p-0.5 shadow-sm">
                  <SaarthiLogo className="w-6 h-6" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-body-sm leading-relaxed space-y-3 ${
                  msg.role === 'user'
                    ? 'bg-ink text-on-dark rounded-tr-none'
                    : 'bg-surface-soft border border-hairline text-ink rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Grounded Citations Box */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-3 border-t border-hairline/80 space-y-2">
                    <span className="text-[11px] font-bold uppercase text-brand-navy flex items-center gap-1 tracking-wider">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>
                        {t('citationsTitle')} ({Math.round((msg.confidenceScore || 0.95) * 100)}% {isHi ? 'सटीकता' : 'Confidence'})
                      </span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.sources.map((src, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2.5 rounded-lg bg-surface-white border border-hairline text-[11px] space-y-0.5"
                        >
                          <span className="font-bold text-ink block truncate">{src.title}</span>
                          <span className="text-neutral-500 block truncate">{src.source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-surface-soft border border-hairline flex items-center justify-center shrink-0 text-neutral-600">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center shrink-0 p-0.5 shadow-sm">
                <SaarthiLogo className="w-6 h-6" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-surface-soft border border-hairline flex items-center gap-2 text-caption text-neutral-500">
                <Loader2 className="w-4 h-4 animate-spin text-brand-navy" />
                <span>{tCommon('thinking')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={t('inputPlaceholder')}
            className="flex-1 px-4 py-3 rounded-xl bg-surface-white border border-hairline text-body text-ink placeholder:text-neutral-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-light/50 transition-all shadow-soft-flat"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="px-6 py-3 rounded-xl bg-ink text-on-dark font-bold text-caption hover:bg-ink-pressed active:scale-[0.98] disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all shadow-soft-flat flex items-center gap-2"
          >
            <span>{tCommon('send')}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-neutral-400 text-center">{t('askDisclaimer')}</p>
      </main>
    </div>
  );
}
