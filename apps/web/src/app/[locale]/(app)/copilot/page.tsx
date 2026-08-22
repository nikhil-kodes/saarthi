'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { SaarthiLogo } from '@/components/Navbar';
import {
  Send,
  Sparkles,
  ShieldCheck,
  Globe,
  Loader2,
  User,
  BookOpen,
  MessageSquare,
  Plus
} from 'lucide-react';
import {
  AmbientOrbs,
  ArchitecturalGrid,
} from '@/components/ui/ambient-background';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: Array<{
    title: string;
    source: string;
    url?: string;
    relevance_score: number;
  }>;
  confidence_score?: number;
  latency_ms?: number;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    } else {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: isHi
          ? 'नमस्ते! मैं आपका विधिक अनुपालन साथी (Compliance Copilot) हूँ। आप मुझसे जीएसटी, इनपुट टैक्स क्रेडिट, FSSAI, उद्यम या उत्तर प्रदेश सरकारी सब्सिडी एवं विधिक नियमों के बारे में पूछ सकते हैं।'
          : 'Welcome! I am your Compliance Copilot. Ask me any regulatory or statutory question regarding GST, GSTR-2B matching, FSSAI food licensing, Udyam MSME classification, or UP State incentives.',
      }]);
    }
  }, [activeConversationId, isHi]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/copilot/conversations');
      const data = await res.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  const fetchMessages = async (id: string) => {
    try {
      const res = await fetch(`/api/copilot/conversations/${id}/messages`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

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
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend.trim(),
          locale,
          conversationId: activeConversationId
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const assistantMessage: ChatMessage = {
          id: json.data.id || `assistant-${Date.now()}`,
          role: 'assistant',
          content: json.data.response || json.data.answer || 'No response text returned.',
          sources: json.data.sources || [],
          confidence_score: json.data.confidence_score,
          latency_ms: json.data.latency_ms,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        if (!activeConversationId && json.data.conversationId) {
          setActiveConversationId(json.data.conversationId);
          fetchConversations();
        }
      } else {
        throw new Error(json.error || 'Failed to generate response.');
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
    <div className="min-h-screen bg-[#f5f4f0] font-['Inter',sans-serif] selection:bg-[#ef4d23]/20 selection:text-[#ef4d23] flex flex-col relative overflow-hidden">
      <AmbientOrbs theme="cool" intensity="subtle" />
      <ArchitecturalGrid gridSize={32} />
      <div className="pointer-events-none absolute inset-0 ambient-dot-grid opacity-50" aria-hidden="true" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm relative">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center space-x-2.5 group">
            <SaarthiLogo className="w-8 h-8" />
            <span className="text-title-sm text-ink font-bold">{tCommon('appName')}</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-1 text-body-sm">
            <Link href="/dashboard" className="px-3 py-1.5 rounded-lg font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors">{tNav('dashboard')}</Link>
            <Link href="/compliance" className="px-3 py-1.5 rounded-lg font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors">{tNav('compliance')}</Link>
            <Link href="/notices" className="px-3 py-1.5 rounded-lg font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors">{tNav('notices')}</Link>
            <Link href="/copilot" className="px-3 py-1.5 rounded-lg font-bold text-brand-navy bg-brand-blue-light/50">{tNav('copilot')}</Link>
            <Link href="/score" className="px-3 py-1.5 rounded-lg font-medium text-neutral-600 hover:text-ink hover:bg-surface-faint transition-colors">{tNav('score')}</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/copilot" locale={otherLocale} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-soft text-caption font-semibold text-ink hover:bg-surface-faint transition-colors border border-hairline">
            <Globe className="w-3.5 h-3.5 text-brand-navy" />
            <span>{otherLocale === 'hi' ? 'हिंदी' : 'English'}</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6 overflow-hidden h-[calc(100vh-70px)]">
        
        {/* Sidebar */}
        <div className="w-72 hidden lg:flex flex-col bg-surface-white rounded-2xl border border-hairline shadow-soft-flat relative z-10 overflow-hidden">
          <div className="p-4 border-b border-hairline">
            <button
              onClick={handleNewChat}
              className="w-full py-2.5 px-4 bg-brand-navy text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-brand-navy/90 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('newChat')}</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-3 mb-2 mt-2">{t('historyTitle')}</h3>
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-start gap-2 ${
                  activeConversationId === conv.id 
                    ? 'bg-brand-blue-light/30 text-brand-navy font-medium' 
                    : 'text-neutral-700 hover:bg-surface-soft'
                }`}
              >
                <MessageSquare className="w-4 h-4 mt-0.5 shrink-0 opacity-60" />
                <span className="truncate">{conv.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Workspace */}
        <div className="flex-1 flex flex-col space-y-4 min-w-0 relative z-10">
          <div className="flex items-center justify-between border-b border-hairline pb-4 bg-white/50 rounded-2xl p-4 shadow-soft-flat">
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

          {/* Chat History Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-surface-white rounded-2xl border border-hairline shadow-soft-flat space-y-6">
            {!activeConversationId && messages.length === 1 && (
              <div className="mb-8 p-4">
                <div className="flex flex-wrap gap-2 mt-4">
                  {suggestedQueries.map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(query)}
                      className="px-3.5 py-1.5 rounded-full bg-surface-soft border border-hairline hover:border-brand-navy text-caption font-medium text-neutral-700 hover:text-ink transition-all"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center shrink-0 p-0.5 shadow-sm mt-1">
                    <SaarthiLogo className="w-6 h-6" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-body-sm leading-relaxed space-y-3 ${
                    msg.role === 'user'
                      ? 'bg-brand-navy text-white rounded-tr-none'
                      : 'bg-surface-soft border border-hairline text-ink rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Grounded Citations Box */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-3 border-t border-hairline/80 space-y-2 mt-2">
                      <span className="text-[11px] font-bold uppercase text-brand-navy flex items-center gap-1 tracking-wider">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>
                          {t('citationsTitle')} ({Math.round((msg.confidence_score || 0.95) * 100)}% {isHi ? 'सटीकता' : 'Confidence'})
                        </span>
                      </span>
                      <div className="grid grid-cols-1 gap-2">
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
                  <div className="w-8 h-8 rounded-xl bg-surface-soft border border-hairline flex items-center justify-center shrink-0 text-neutral-600 mt-1">
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
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2 relative"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={t('inputPlaceholder')}
              className="flex-1 px-4 py-3.5 rounded-xl bg-surface-white border border-hairline text-body text-ink placeholder:text-neutral-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-light/50 transition-all shadow-soft-flat"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-6 py-3.5 rounded-xl bg-brand-navy text-white font-bold text-caption hover:bg-brand-navy/90 active:scale-[0.98] disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all shadow-soft-flat flex items-center gap-2"
            >
              <span className="hidden sm:inline">{tCommon('send')}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[11px] text-neutral-400 text-center">{t('askDisclaimer')}</p>
        </div>
      </main>
    </div>
  );
}
