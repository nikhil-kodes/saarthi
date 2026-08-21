import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { fontInter, fontNotoDevanagari } from '@/lib/fonts';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Saarthi — AI Compliance & Trust Platform for Indian MSMEs',
  description:
    'Institutional-trust compliance, verification, marketplace enablement, and Compliance Health Score for Indian MSMEs.',
  icons: {
    icon: [
      { url: '/icon.png' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/apple-icon.png',
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${fontInter.variable} ${fontNotoDevanagari.variable}`}
    >
      <body
        className={`min-h-screen bg-canvas text-ink font-sans antialiased ${
          locale === 'hi' ? 'font-devanagari' : ''
        }`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
