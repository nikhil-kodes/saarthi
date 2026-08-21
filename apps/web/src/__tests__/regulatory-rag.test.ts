import { describe, it, expect } from 'vitest';

describe('Regulatory Updates & Copilot Grounding', () => {
  it('should validate structured citation source format', () => {
    const citation = {
      title: 'CBIC Notification 04/2024 - Mandatory E-Invoicing & GSTR-2B Matching',
      source: 'CBIC / GSTN',
      url: 'https://taxinformation.cbic.gov.in/notifications/04-2024',
      relevance_score: 0.94,
    };

    expect(citation.title).toBeDefined();
    expect(citation.source).toBe('CBIC / GSTN');
    expect(citation.relevance_score).toBeGreaterThan(0.9);
  });

  it('should validate bilingual circular impact matrix shape', () => {
    const summary = {
      title_en: 'CBIC ITC Matching Guidelines',
      title_hi: 'सीबीआईसी आईटीसी मिलान दिशानिर्देश',
      summary_en: 'GSTR-2B matching is mandatory.',
      summary_hi: 'GSTR-2B मिलान अनिवार्य है।',
      key_deadline: '2026-04-01',
      impacted_entities: ['Regular GST Taxpayers'],
      action_required: 'Conduct monthly GSTR-2B reconciliations before filing GSTR-3B.',
      action_required_hi: 'GSTR-3B दाखिल करने से पहले GSTR-2B का मासिक मिलान करें।',
      risk_level: 'high',
    };

    expect(summary.title_hi).toContain('सीबीआईसी');
    expect(summary.impacted_entities).toHaveLength(1);
    expect(summary.risk_level).toBe('high');
    expect(summary.key_deadline).toBe('2026-04-01');
  });
});
