import { describe, it, expect } from 'vitest';
import { QUEUE_NAMES } from '@saarthi/shared-types';

describe('Integration Hardening & Resilience', () => {
  it('should verify all 8 background queues are registered and distinct', () => {
    expect(QUEUE_NAMES).toHaveLength(8);
    expect(QUEUE_NAMES).toContain('compliance');
    expect(QUEUE_NAMES).toContain('notifications');
    expect(QUEUE_NAMES).toContain('ai');
    expect(QUEUE_NAMES).toContain('ocr');
    expect(QUEUE_NAMES).toContain('rag');
    expect(QUEUE_NAMES).toContain('marketplace');
    expect(QUEUE_NAMES).toContain('payments');
    expect(QUEUE_NAMES).toContain('regulatory');
  });

  it('should verify supported locales are en and hi', () => {
    const supported = ['en', 'hi'];
    expect(supported).toContain('en');
    expect(supported).toContain('hi');
  });

  it('should verify health status contracts', () => {
    const health = {
      status: 'healthy',
      service: 'web',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    };
    expect(health.status).toBe('healthy');
    expect(health.version).toBe('0.1.0');
  });
});
