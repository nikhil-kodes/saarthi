import { Worker, type Job } from 'bullmq';
import { redisConfig, QUEUE_NAMES, type QueueName } from './config';
import { processHealthCheck } from './processors/health';

export const workers: Worker[] = [];

export function startWorkers(): Worker[] {
  for (const name of QUEUE_NAMES) {
    const worker = new Worker(
      name,
      async (job: Job) => {
        console.log(`[${name.toUpperCase()}] Processing job: ${job.name} (ID: ${job.id})`);

        if (job.name === 'HEALTH_CHECK') {
          return processHealthCheck(job);
        }

        console.log(`[${name.toUpperCase()}] No dedicated processor for job: ${job.name}`);
        return { processed: true, queue: name, jobName: job.name };
      },
      { connection: redisConfig }
    );

    worker.on('completed', (job: Job) => {
      console.log(`[${name.toUpperCase()}] Job ${job.id} completed successfully`);
    });

    worker.on('failed', (job: Job | undefined, err: Error) => {
      console.error(`[${name.toUpperCase()}] Job ${job?.id} failed:`, err.message);
    });

    workers.push(worker);
  }

  console.log(`[WORKERS] Initialized ${workers.length} workers for queues: ${QUEUE_NAMES.join(', ')}`);
  return workers;
}

export async function stopWorkers(): Promise<void> {
  console.log('[WORKERS] Stopping all workers...');
  await Promise.all(workers.map((worker) => worker.close()));
  workers.length = 0;
  console.log('[WORKERS] All workers stopped.');
}
