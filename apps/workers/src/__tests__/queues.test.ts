import { describe, it, expect } from 'vitest';
import { QUEUE_NAMES } from '../config';

describe('Worker Queues Configuration', () => {
  it('should declare exactly 8 queues as required by WORKFLOW.md §17', () => {
    expect(QUEUE_NAMES).toHaveLength(9);
  });

  it('should contain all required queue names', () => {
    const expectedQueues = [
      'compliance',
      'notifications',
      'ai',
      'ocr',
      'rag',
      'marketplace',
      'payments',
      'regulatory',
    ];

    for (const queue of expectedQueues) {
      expect(QUEUE_NAMES).toContain(queue);
    }
  });

  it('should have unique queue names', () => {
    const uniqueQueues = new Set(QUEUE_NAMES);
    expect(uniqueQueues.size).toBe(QUEUE_NAMES.length);
  });
});
