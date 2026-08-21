import { Queue } from 'bullmq';
import { redisConfig, QUEUE_NAMES, type QueueName } from './config';

export const queues: Partial<Record<QueueName, Queue>> = {};

for (const name of QUEUE_NAMES) {
  queues[name] = new Queue(name, { connection: redisConfig });
}

export function getQueue(name: QueueName): Queue {
  const queue = queues[name];
  if (!queue) {
    throw new Error(`Queue '${name}' not found`);
  }
  return queue;
}
