// ─── Locale ───────────────────────────────────────────────────
export type Locale = 'en' | 'hi';
export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'hi'] as const;
export const DEFAULT_LOCALE: Locale = 'en';

// ─── Application Constants ────────────────────────────────────
export const APP_NAME = 'Saarthi';
export const APP_NAME_HI = 'साथी';
export const APP_VERSION = '0.1.0';

// ─── Queue Configuration (WORKFLOW.md §17) ───────────────────
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

// ─── API ──────────────────────────────────────────────────────
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

// ─── Compliance Health Score (PRD.md §10, DESIGN.md §8.4) ─────
export const CHS_MIN_SCORE = 0;
export const CHS_MAX_SCORE = 900;
export const CHS_DANGER_THRESHOLD = 549;
export const CHS_WARNING_THRESHOLD = 699;
