import { describe, it, expect } from 'vitest';
import enMessages from '../../messages/en.json';
import hiMessages from '../../messages/hi.json';
import { routing } from '../i18n/routing';

describe('Bilingual i18n Configuration & Health Tests', () => {
  it('should support both English and Hindi locales', () => {
    expect(routing.locales).toEqual(['en', 'hi']);
    expect(routing.defaultLocale).toBe('en');
  });

  it('should have parity of top-level sections in en and hi messages', () => {
    const enKeys = Object.keys(enMessages).sort();
    const hiKeys = Object.keys(hiMessages).sort();
    expect(enKeys).toEqual(hiKeys);
  });

  it('should have health messages in both English and Hindi', () => {
    expect(enMessages.health.status).toBe('Healthy');
    expect(hiMessages.health.status).toBe('सक्रिय व स्वस्थ');
    expect(enMessages.health.version).toBe('0.1.0');
    expect(hiMessages.health.version).toBe('0.1.0');
  });

  it('should have navigation labels translated in Hindi without English fallbacks', () => {
    expect(hiMessages.nav.dashboard).toBe('डैशबोर्ड');
    expect(hiMessages.nav.complianceCalendar).toBe('अनुपालन कैलेंडर');
    expect(hiMessages.nav.notices).toBe('नोटिस');
    expect(hiMessages.nav.schemes).toBe('सरकारी योजनाएं');
    expect(hiMessages.nav.payments).toBe('भुगतान');
    expect(hiMessages.nav.supplierMarketplace).toBe('सप्लायर मार्केटप्लेस');
    expect(hiMessages.nav.creatorMarketplace).toBe('क्रिएटर मार्केटप्लेस');
    expect(hiMessages.nav.healthScore).toBe('अनुपालन स्वास्थ्य स्कोर');
  });

  it('should have status badges translated in Hindi', () => {
    expect(hiMessages.status.compliant).toBe('अनुपालित');
    expect(hiMessages.status.dueSoon).toBe('जल्द देय');
    expect(hiMessages.status.overdue).toBe('अतिदेय');
    expect(hiMessages.status.verified).toBe('सत्यापित');
    expect(hiMessages.status.pending).toBe('लंबित');
  });
});
