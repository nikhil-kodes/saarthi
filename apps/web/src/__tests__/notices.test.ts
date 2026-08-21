import { describe, it, expect } from 'vitest';
import {
  createNoticeUploadSchema,
  updateNoticeStatusSchema,
  whatsappWebhookSchema,
} from '@saarthi/validation';

describe('Notice OCR & Explainer Validation', () => {
  it('should validate valid notice upload payload', () => {
    const validPayload = {
      businessId: '123e4567-e89b-12d3-a456-426614174000',
      fileName: 'GST_DRC01A_Notice.pdf',
      fileUrl: 'https://storage.saarthi.app/notices/GST_DRC01A_Notice.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 1048576,
    };

    const result = createNoticeUploadSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should reject invalid file url in notice upload', () => {
    const invalidPayload = {
      businessId: '123e4567-e89b-12d3-a456-426614174000',
      fileName: 'GST_DRC01A_Notice.pdf',
      fileUrl: 'not-a-valid-url',
    };

    const result = createNoticeUploadSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('should validate WhatsApp webhook payloads', () => {
    const validWebhook = {
      senderPhone: '+919876543210',
      messageText: 'Received GST DRC-01A notice for 4.5 lakh',
    };

    const result = whatsappWebhookSchema.safeParse(validWebhook);
    expect(result.success).toBe(true);
  });

  it('should validate notice status transitions', () => {
    const validUpdate = {
      status: 'reply_drafted',
      replyDraftEn: 'To the Proper Officer,\n\nWe submit our formal reply.',
    };

    const result = updateNoticeStatusSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });
});
