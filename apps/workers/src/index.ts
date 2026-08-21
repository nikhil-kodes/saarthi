import { Worker, Job } from 'bullmq';
import { redisConfig } from './config';
import { getQueue, queues } from './queues';
import { processHealthCheck } from './processors/health';
import { processComplianceJob } from './processors/compliance';
import { processRegulatoryJob } from './processors/regulatory';
import { processOCRJob } from './processors/ocr';
import { processPaymentsJob } from './processors/payments';
import { processScoreJob } from './processors/score';
import { processMarketplaceJob } from './processors/marketplace';
import { processCampaignJob } from './processors/campaigns';

export * from './config';
export * from './queues';
export * from './processors/health';
export * from './processors/compliance';
export * from './processors/regulatory';
export * from './processors/ocr';
export * from './processors/payments';
export * from './processors/score';
export * from './processors/marketplace';
export * from './processors/campaigns';

/**
 * Starts worker instances for background queues.
 */
export function startWorkers() {
  const workers: Worker[] = [];

  // 1. Health Queue Worker
  const healthWorker = new Worker(
    'compliance',
    async (job: Job) => processHealthCheck(job),
    { connection: redisConfig }
  );
  workers.push(healthWorker);

  // 2. Compliance Queue Worker
  const complianceWorker = new Worker(
    'compliance',
    async (job: Job) => processComplianceJob(job),
    { connection: redisConfig }
  );
  workers.push(complianceWorker);

  // 3. Regulatory Queue Worker
  const regulatoryWorker = new Worker(
    'regulatory',
    async (job: Job) => processRegulatoryJob(job),
    { connection: redisConfig }
  );
  workers.push(regulatoryWorker);

  // 4. OCR Queue Worker
  const ocrWorker = new Worker(
    'ocr',
    async (job: Job) => processOCRJob(job),
    { connection: redisConfig }
  );
  workers.push(ocrWorker);

  // 5. Payments Queue Worker
  const paymentsWorker = new Worker(
    'payments',
    async (job: Job) => processPaymentsJob(job),
    { connection: redisConfig }
  );
  workers.push(paymentsWorker);

  // 6. Marketplace Queue Worker
  const marketplaceWorker = new Worker(
    'marketplace',
    async (job: Job) => processMarketplaceJob(job),
    { connection: redisConfig }
  );
  workers.push(marketplaceWorker);

  return workers;
}
