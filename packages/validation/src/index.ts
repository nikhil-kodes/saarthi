import { z } from 'zod';

// ─── Locale ───────────────────────────────────────────────────
export const localeSchema = z.enum(['en', 'hi']);
export type LocaleSchema = z.infer<typeof localeSchema>;

// ─── User Roles ───────────────────────────────────────────────
export const userRoleSchema = z.enum([
  'owner',
  'team_member',
  'ca_partner',
  'supplier',
  'influencer',
  'lender',
  'admin',
]);
export type UserRoleSchema = z.infer<typeof userRoleSchema>;

// ─── Email & Password ─────────────────────────────────────────
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Invalid email address format')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// ─── Auth Schemas ─────────────────────────────────────────────
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .trim(),
  locale: localeSchema.default('en'),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ─── Profile Update ───────────────────────────────────────────
export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phoneNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian 10-digit mobile number')
    .optional()
    .nullable(),
  locale: localeSchema.optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ─── Business Schemas ─────────────────────────────────────────
export const createBusinessSchema = z.object({
  legalName: z.string().min(2, 'Legal name must be at least 2 characters').max(200).trim(),
  tradeName: z.string().max(200).optional().nullable(),
  sector: z.string().min(2, 'Sector is required'),
  jurisdictionCountry: z.string().default('IN'),
  jurisdictionState: z.string().default('UP'),
  employeeCountBand: z.enum(['1-9', '10-19', '20-49', '50-249', '250+']).optional().nullable(),
  turnoverBand: z.enum(['micro', 'small', 'medium', 'other']).optional().nullable(),
  investmentBand: z.string().optional().nullable(),
  gstin: z
    .string()
    .trim()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
    .optional()
    .nullable()
    .or(z.literal('')),
  udyamNumber: z
    .string()
    .trim()
    .regex(/^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/, 'Invalid Udyam registration number')
    .optional()
    .nullable()
    .or(z.literal('')),
  fssaiNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{14}$/, 'FSSAI number must be 14 digits')
    .optional()
    .nullable()
    .or(z.literal('')),
  pan: z
    .string()
    .trim()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format')
    .optional()
    .nullable()
    .or(z.literal('')),
});
export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;

// ─── Team Invites ─────────────────────────────────────────────
export const createTeamInviteSchema = z.object({
  businessId: z.string().uuid('Invalid business ID'),
  email: emailSchema,
  roleName: z.enum(['team_member', 'ca_partner', 'supplier', 'influencer', 'lender']),
});
export type CreateTeamInviteInput = z.infer<typeof createTeamInviteSchema>;

export const acceptTeamInviteSchema = z.object({
  token: z.string().min(10, 'Invalid or expired invite token'),
});
export type AcceptTeamInviteInput = z.infer<typeof acceptTeamInviteSchema>;

// ─── Verification ─────────────────────────────────────────────
export const initiateVerificationSchema = z.object({
  businessId: z.string().uuid('Invalid business ID'),
});
export type InitiateVerificationInput = z.infer<typeof initiateVerificationSchema>;

// ─── Compliance Schemas ───────────────────────────────────────
export const complianceCategorySchema = z.enum([
  'taxation',
  'labor_and_employment',
  'industry_specific',
  'corporate_and_msme',
  'environmental',
]);
export type ComplianceCategorySchema = z.infer<typeof complianceCategorySchema>;

export const complianceStatusSchema = z.enum([
  'compliant',
  'due_soon',
  'overdue',
  'pending_verification',
  'exempt',
]);
export type ComplianceStatusSchema = z.infer<typeof complianceStatusSchema>;

export const createFilingRecordSchema = z.object({
  instanceId: z.string().uuid('Invalid compliance instance ID'),
  acknowledgementNumber: z.string().max(100).optional().nullable(),
  documentUrl: z.string().url().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});
export type CreateFilingRecordInput = z.infer<typeof createFilingRecordSchema>;

export const updateComplianceInstanceSchema = z.object({
  status: complianceStatusSchema.optional(),
  notes: z.string().max(500).optional().nullable(),
});
export type UpdateComplianceInstanceInput = z.infer<typeof updateComplianceInstanceSchema>;

export const listComplianceInstancesQuerySchema = z.object({
  status: complianceStatusSchema.optional(),
  category: complianceCategorySchema.optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});
export type ListComplianceInstancesQueryInput = z.infer<typeof listComplianceInstancesQuerySchema>;

export const generateComplianceInstancesSchema = z.object({
  businessId: z.string().uuid('Invalid business ID'),
  year: z.number().int().min(2024).max(2030).default(new Date().getFullYear()),
});
export type GenerateComplianceInstancesInput = z.infer<typeof generateComplianceInstancesSchema>;

// ─── Notice & OCR Schemas ─────────────────────────────────────
export const noticeSeveritySchema = z.enum(['low', 'moderate', 'urgent', 'critical']);
export type NoticeSeveritySchema = z.infer<typeof noticeSeveritySchema>;

export const noticeStatusSchema = z.enum([
  'pending_review',
  'action_required',
  'reply_drafted',
  'replied',
  'resolved',
]);
export type NoticeStatusSchema = z.infer<typeof noticeStatusSchema>;

export const createNoticeUploadSchema = z.object({
  businessId: z.string().uuid('Invalid business ID'),
  fileName: z.string().min(1).max(255),
  fileUrl: z.string().url('Invalid file URL'),
  mimeType: z.string().default('application/pdf'),
  fileSizeBytes: z.number().int().min(0).default(0),
  rawOcrText: z.string().optional().nullable(),
});
export type CreateNoticeUploadInput = z.infer<typeof createNoticeUploadSchema>;

export const updateNoticeStatusSchema = z.object({
  status: noticeStatusSchema.optional(),
  replyDraftEn: z.string().optional().nullable(),
});
export type UpdateNoticeStatusInput = z.infer<typeof updateNoticeStatusSchema>;

export const whatsappWebhookSchema = z.object({
  senderPhone: z.string().min(8).max(20),
  messageText: z.string().optional().nullable(),
  mediaUrl: z.string().url().optional().nullable(),
});
export type WhatsAppWebhookInput = z.infer<typeof whatsappWebhookSchema>;

// ─── Schemes & Payments Schemas ───────────────────────────────
export const applySchemeSchema = z.object({
  businessId: z.string().uuid('Invalid business ID'),
  schemeId: z.string().uuid('Invalid scheme ID'),
  applicationData: z.record(z.unknown()).default({}),
});
export type ApplySchemeInput = z.infer<typeof applySchemeSchema>;

export const createPaymentOrderSchema = z.object({
  businessId: z.string().uuid('Invalid business ID'),
  amount: z.number().positive('Amount must be greater than zero'),
  purpose: z.string().min(2).max(100),
  notes: z.record(z.string()).optional(),
});
export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  paymentId: z.string().min(1, 'Payment ID is required'),
  signature: z.string().min(1, 'Signature is required'),
});
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

export const refundPaymentSchema = z.object({
  transactionId: z.string().uuid('Invalid transaction ID'),
  reason: z.string().max(255).optional(),
});
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;

// ─── Compliance Health Score Schemas (300-900) ────────────────
export const recomputeScoreSchema = z.object({
  businessId: z.string().uuid('Invalid business ID'),
});
export type RecomputeScoreInput = z.infer<typeof recomputeScoreSchema>;

export const createScoreConsentSchema = z.object({
  businessId: z.string().uuid('Invalid business ID'),
  granteeName: z.string().min(2).max(100).trim(),
  granteeType: z.enum(['lender', 'supplier', 'buyer', 'ca_partner']).default('lender'),
  expiresInDays: z.number().int().min(1).max(90).default(30),
});
export type CreateScoreConsentInput = z.infer<typeof createScoreConsentSchema>;

// ─── Supplier Marketplace Schemas ─────────────────────────────
export const createSupplierProductSchema = z.object({
  title: z.string().min(2, 'Product title is required').max(200).trim(),
  titleHi: z.string().max(200).optional().nullable(),
  description: z.string().min(5, 'Description is required').max(1000).trim(),
  category: z.enum(['packaging', 'raw_ingredients', 'machinery', 'chemicals', 'safety_gear']),
  unit: z.string().min(1).max(20).default('piece'),
  unitPrice: z.number().positive('Unit price must be positive'),
  hsnCode: z.string().max(20).optional().nullable(),
  gstRate: z.number().min(0).max(28).default(18.0),
  minOrderQuantity: z.number().int().positive().default(1),
  leadTimeDays: z.number().int().min(1).max(90).default(7),
});
export type CreateSupplierProductInput = z.infer<typeof createSupplierProductSchema>;

export const createMarketplaceRFQSchema = z.object({
  title: z.string().min(2, 'RFQ title is required').max(200).trim(),
  category: z.string().min(2).max(100),
  description: z.string().min(5, 'Description is required').max(1000).trim(),
  requiredQuantity: z.number().int().positive('Quantity must be greater than zero'),
  unit: z.string().min(1).max(20).default('unit'),
  targetBudget: z.number().positive().optional().nullable(),
  deliveryPincode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, 'Invalid Indian 6-digit PIN code')
    .default('201301'),
  minComplianceScore: z.number().int().min(300).max(900).default(600),
  expiresInDays: z.number().int().min(1).max(30).default(14),
});
export type CreateMarketplaceRFQInput = z.infer<typeof createMarketplaceRFQSchema>;

export const submitMarketplaceQuoteSchema = z.object({
  rfqId: z.string().uuid('Invalid RFQ ID'),
  unitPrice: z.number().positive('Unit price must be positive'),
  totalAmount: z.number().positive('Total quote amount must be positive'),
  validityDays: z.number().int().min(1).max(60).default(15),
  deliveryDays: z.number().int().min(1).max(60).default(7),
  notes: z.string().max(500).optional().nullable(),
});
export type SubmitMarketplaceQuoteInput = z.infer<typeof submitMarketplaceQuoteSchema>;

export const acceptMarketplaceQuoteSchema = z.object({
  quoteId: z.string().uuid('Invalid quote ID'),
});
export type AcceptMarketplaceQuoteInput = z.infer<typeof acceptMarketplaceQuoteSchema>;

// ─── Influencer Marketplace & ASCI Schemas ────────────────────
export const createCreatorProfileSchema = z.object({
  displayName: z.string().min(2).max(100).trim(),
  handle: z.string().min(2).max(50).trim(),
  platform: z.enum(['youtube', 'instagram', 'moj', 'josh']).default('youtube'),
  primaryLanguage: z.string().min(2).max(10).default('hi'),
  followerCount: z.number().int().positive().default(10000),
  niche: z.string().min(2).max(50),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  bioHi: z.string().max(500).optional().nullable(),
  rateCard: z.record(z.number()).default({ reel_video: 5000, dedicated_video: 15000 }),
});
export type CreateCreatorProfileInput = z.infer<typeof createCreatorProfileSchema>;

export const createCampaignSchema = z.object({
  brandBusinessId: z.string().uuid('Invalid business ID'),
  title: z.string().min(2).max(200).trim(),
  description: z.string().min(5).max(1000).trim(),
  budget: z.number().positive('Campaign budget must be greater than zero'),
  platform: z.enum(['youtube', 'instagram', 'moj', 'josh']).default('youtube'),
  targetLanguage: z.string().default('hi'),
  creatorId: z.string().uuid('Invalid creator ID'),
  deliverableType: z.string().default('video_reel'),
});
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

export const submitMilestoneDeliverableSchema = z.object({
  milestoneId: z.string().uuid('Invalid milestone ID'),
  deliverableUrl: z.string().url('Invalid deliverable URL'),
  captionText: z.string().optional().nullable(), // Used to verify #Ad / #Sponsored ASCI disclosure
  notes: z.string().max(500).optional().nullable(),
});
export type SubmitMilestoneDeliverableInput = z.infer<typeof submitMilestoneDeliverableSchema>;

export const releaseMilestonePayoutSchema = z.object({
  milestoneId: z.string().uuid('Invalid milestone ID'),
});
export type ReleaseMilestonePayoutInput = z.infer<typeof releaseMilestonePayoutSchema>;

// ─── Compliance Export & Admin Schemas ────────────────────────
export const exportComplianceDossierSchema = z.object({
  businessId: z.string().uuid('Invalid business ID'),
  format: z.enum(['json', 'summary']).default('json'),
  includeNotices: z.boolean().default(true),
  includeScore: z.boolean().default(true),
});
export type ExportComplianceDossierInput = z.infer<typeof exportComplianceDossierSchema>;

export const listAuditLogsQuerySchema = z.object({
  businessId: z.string().uuid('Invalid business ID').optional(),
  action: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
});
export type ListAuditLogsQueryInput = z.infer<typeof listAuditLogsQuerySchema>;

// ─── Health Check ─────────────────────────────────────────────
export const healthCheckSchema = z.object({
  status: z.enum(['healthy', 'unhealthy']),
  service: z.string(),
  version: z.string(),
  timestamp: z.string().datetime().optional(),
});
export type HealthCheckSchema = z.infer<typeof healthCheckSchema>;

// ─── API Response ─────────────────────────────────────────────
export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: apiErrorSchema.optional(),
  });
