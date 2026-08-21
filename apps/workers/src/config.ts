export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
};

export const QUEUE_NAMES = [
  'compliance',
  'notifications',
  'ai',
  'ocr',
  'rag',
  'marketplace',
  'payments',
  'regulatory',
] as const;

export type QueueName = (typeof QUEUE_NAMES)[number];
