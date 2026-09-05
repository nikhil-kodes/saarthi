import { startWorkers } from './workers';

export * from './config';
export * from './queues';
export * from './workers';
export * from './processors/health';
export * from './processors/compliance';
export * from './processors/regulatory';
export * from './processors/ocr';
export * from './processors/payments';
export * from './processors/score';
export * from './processors/marketplace';
export * from './processors/campaigns';

// Start workers automatically when this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('[WORKERS] Starting background processor service...');
  startWorkers();
}
