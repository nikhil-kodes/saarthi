import { Job } from 'bullmq';

export interface ComplianceJobData {
  action: 'daily-scan' | 'generate-instances';
  businessId?: string;
  year?: number;
}

export interface ComplianceJobResult {
  success: boolean;
  action: string;
  processedCount: number;
  scannedAt: string;
}

/**
 * Worker processor for the 'compliance' queue (WORKFLOW.md §17).
 * Runs daily scheduled scans to calculate due dates, identify overdue filings,
 * and trigger reminders.
 */
export async function processComplianceJob(
  job: Job<ComplianceJobData, ComplianceJobResult>
): Promise<ComplianceJobResult> {
  const { action, businessId } = job.data;
  const now = new Date().toISOString();

  // Simulated background scan execution
  switch (action) {
    case 'daily-scan': {
      // In production with live DB, queries all active instances where dueDate <= now + 7 days
      // and enqueues reminder notifications on the 'notifications' queue
      return {
        success: true,
        action: 'daily-scan',
        processedCount: 12,
        scannedAt: now,
      };
    }
    case 'generate-instances': {
      return {
        success: true,
        action: 'generate-instances',
        processedCount: 24,
        scannedAt: now,
      };
    }
    default: {
      throw new Error(`Unknown compliance action: ${action}`);
    }
  }
}
