import type { Job } from 'bullmq';

export interface HealthCheckResult {
  status: 'healthy';
  timestamp: string;
  jobId: string | undefined;
}

export async function processHealthCheck(job: Job): Promise<HealthCheckResult> {
  console.log(`[HEALTH_CHECK] Processing job ${job.id}`);
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    jobId: job.id,
  };
}
