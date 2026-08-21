// ─── Locale ───────────────────────────────────────────────────
export type Locale = 'en' | 'hi';
export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'hi'] as const;
export const DEFAULT_LOCALE: Locale = 'en';

// ─── User Roles ───────────────────────────────────────────────
export type UserRole =
  | 'owner'
  | 'team_member'
  | 'ca_partner'
  | 'supplier'
  | 'influencer'
  | 'lender'
  | 'admin';

export const USER_ROLES: readonly UserRole[] = [
  'owner',
  'team_member',
  'ca_partner',
  'supplier',
  'influencer',
  'lender',
  'admin',
] as const;

// ─── Granular Permissions ─────────────────────────────────────
export type PermissionName =
  | 'compliance.view'
  | 'compliance.manage'
  | 'compliance.export'
  | 'documents.view'
  | 'documents.upload'
  | 'documents.delete'
  | 'business.view'
  | 'business.update_profile'
  | 'business.verify'
  | 'team.view'
  | 'team.invite'
  | 'team.manage_roles'
  | 'team.remove'
  | 'marketplace.buy'
  | 'marketplace.sell'
  | 'marketplace.manage_rfq'
  | 'campaigns.create'
  | 'campaigns.collaborate'
  | 'campaigns.payout'
  | 'score.view'
  | 'score.share'
  | 'consents.view'
  | 'consents.grant'
  | 'consents.revoke'
  | 'audit.view'
  | 'admin.all';

// ─── Profiles ─────────────────────────────────────────────────
export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  locale: Locale;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Businesses ───────────────────────────────────────────────
export interface Business {
  id: string;
  legalName: string;
  tradeName: string | null;
  sector: string;
  jurisdictionCountry: string;
  jurisdictionState: string;
  employeeCountBand: string | null;
  turnoverBand: string | null;
  investmentBand: string | null;
  gstin: string | null;
  udyamNumber: string | null;
  fssaiNumber: string | null;
  pan: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Business Verification ───────────────────────────────────
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type VerificationCheckType = 'gstin' | 'udyam' | 'fssai' | 'pan' | 'registry';

export interface VerificationCheck {
  type: VerificationCheckType;
  identifier: string;
  status: 'verified' | 'failed' | 'skipped';
  verifiedAt: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface BusinessVerification {
  id: string;
  businessId: string;
  status: VerificationStatus;
  providerUsed: string;
  checkedAt: string;
  checkResults: VerificationCheck[];
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationRequest {
  businessId: string;
  legalName: string;
  pan?: string | null;
  gstin?: string | null;
  udyamNumber?: string | null;
  fssaiNumber?: string | null;
  sector: string;
  jurisdictionState: string;
}

export interface VerificationResult {
  status: VerificationStatus;
  provider: string;
  checks: VerificationCheck[];
  verifiedAt: string;
  failureReason?: string;
  isMock: boolean;
}

// ─── Team Invites ─────────────────────────────────────────────
export interface TeamInvite {
  id: string;
  businessId: string;
  invitedBy: string;
  email: string;
  roleName: UserRole;
  token: string;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
  business?: Business;
  inviter?: Profile;
}

// ─── Compliance Types ─────────────────────────────────────────
export type ComplianceCategory =
  | 'taxation'
  | 'labor_and_employment'
  | 'industry_specific'
  | 'corporate_and_msme'
  | 'environmental';

export type ComplianceFrequency =
  | 'monthly'
  | 'quarterly'
  | 'half_yearly'
  | 'annual'
  | 'event_based'
  | 'one_time';

export type ComplianceStatus =
  | 'compliant'
  | 'due_soon'
  | 'overdue'
  | 'pending_verification'
  | 'exempt';

export interface ComplianceRequirement {
  id: string;
  code: string;
  title: string;
  titleHi?: string | null;
  description: string;
  descriptionHi?: string | null;
  category: ComplianceCategory;
  actName: string;
  jurisdictionCountry: string;
  jurisdictionState?: string | null;
  applicabilityRules: Record<string, unknown>;
  frequency: ComplianceFrequency;
  dueDayOffset: number;
  penaltyDetails?: string | null;
  penaltyDetailsHi?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceInstance {
  id: string;
  businessId: string;
  requirementId: string;
  status: ComplianceStatus;
  dueDate: string;
  periodStart: string;
  periodEnd: string;
  notes?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  requirement?: ComplianceRequirement;
  filingRecord?: FilingRecord;
}

export interface FilingRecord {
  id: string;
  instanceId: string;
  businessId: string;
  filedBy?: string | null;
  filedAt: string;
  acknowledgementNumber?: string | null;
  documentUrl?: string | null;
  notes?: string | null;
  createdAt: string;
}

// ─── Notice OCR & Explanation Types ───────────────────────────
export type NoticeSeverity = 'low' | 'moderate' | 'urgent' | 'critical';

export type NoticeStatus =
  | 'pending_review'
  | 'action_required'
  | 'reply_drafted'
  | 'replied'
  | 'resolved';

export interface DocumentUpload {
  id: string;
  businessId: string;
  uploadedBy?: string | null;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  ocrStatus: string;
  rawOcrText?: string | null;
  createdAt: string;
}

export interface ComplianceNotice {
  id: string;
  documentId?: string | null;
  businessId: string;
  authority: string;
  noticeNumber?: string | null;
  issueDate?: string | null;
  responseDeadline: string;
  demandAmount: number;
  penaltyAmount: number;
  severity: NoticeSeverity;
  status: NoticeStatus;
  plainSummaryEn: string;
  plainSummaryHi?: string | null;
  replyDraftEn?: string | null;
  parsedFields: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  document?: DocumentUpload;
}

export interface WhatsAppConversation {
  id: string;
  businessId?: string | null;
  senderPhone: string;
  messageText?: string | null;
  mediaUrl?: string | null;
  responseText: string;
  createdAt: string;
}

// ─── Government Schemes Types ─────────────────────────────────
export type SchemeBenefitType =
  | 'capital_subsidy'
  | 'interest_subvention'
  | 'collateral_free_loan'
  | 'tax_exemption'
  | 'grant';

export type SchemeApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'disbursed'
  | 'rejected';

export interface GovernmentScheme {
  id: string;
  code: string;
  title: string;
  titleHi?: string | null;
  ministry: string;
  description: string;
  descriptionHi?: string | null;
  eligibilityCriteria: Record<string, unknown>;
  maxBenefitAmount: number;
  benefitType: SchemeBenefitType;
  applicationUrl?: string | null;
  jurisdictionState?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isEligible?: boolean;
  eligibilityReason?: string;
}

export interface SchemeApplication {
  id: string;
  businessId: string;
  schemeId: string;
  applicantUserId?: string | null;
  status: SchemeApplicationStatus;
  applicationData: Record<string, unknown>;
  trackingNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  scheme?: GovernmentScheme;
}

// ─── Payments & Escrow Refund Types ───────────────────────────
export type PaymentStatus =
  | 'created'
  | 'pending'
  | 'captured'
  | 'failed'
  | 'refunded';

export interface PaymentTransaction {
  id: string;
  businessId: string;
  userId?: string | null;
  provider: string;
  providerOrderId: string;
  providerPaymentId?: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  purpose: string;
  metadata: Record<string, unknown>;
  refundId?: string | null;
  refundedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentOrderRequest {
  businessId: string;
  amount: number;
  purpose: string;
  notes?: Record<string, string>;
}

export interface PaymentOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  isMock: boolean;
}

export interface PaymentVerificationRequest {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface PaymentRefundResult {
  refundId: string;
  paymentId: string;
  amount: number;
  status: 'processed';
  isMock: boolean;
}

// ─── Compliance Health Score Types (300-900) ──────────────────
export interface PillarScores {
  filingTimeliness: number; // Max 210 pts (35%)
  noticeResolution: number; // Max 120 pts (20%)
  identityAuthenticity: number; // Max 120 pts (20%)
  financialDiscipline: number; // Max 90 pts (15%)
  regulatoryAdherence: number; // Max 60 pts (10%)
}

export type ScoreGrade =
  | 'AAA_EXCELLENT'
  | 'AA_GOOD'
  | 'A_MODERATE'
  | 'NEEDS_IMPROVEMENT';

export interface ComplianceHealthScore {
  id: string;
  businessId: string;
  score: number;
  grade: ScoreGrade;
  pillarScores: PillarScores;
  computationFactors: Record<string, unknown>;
  computedAt: string;
  createdAt: string;
}

export interface ScoreConsentGrant {
  id: string;
  businessId: string;
  grantedBy?: string | null;
  granteeName: string;
  granteeType: string;
  accessToken: string;
  expiresAt: string;
  isRevoked: boolean;
  createdAt: string;
  business?: Business;
  score?: ComplianceHealthScore;
}

// ─── Supplier Marketplace Types ───────────────────────────────
export type RFQStatus = 'open' | 'quotes_received' | 'awarded' | 'closed' | 'expired';
export type QuoteStatus = 'submitted' | 'accepted' | 'rejected' | 'withdrawn';
export type MarketplaceEscrowStatus =
  | 'pending_deposit'
  | 'held_in_escrow'
  | 'released_to_supplier'
  | 'refunded_to_buyer';

export interface SupplierProduct {
  id: string;
  businessId: string;
  title: string;
  titleHi?: string | null;
  description: string;
  category: string;
  unit: string;
  unitPrice: number;
  hsnCode?: string | null;
  gstRate: number;
  minOrderQuantity: number;
  leadTimeDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  business?: Business;
}

export interface MarketplaceRFQ {
  id: string;
  buyerBusinessId: string;
  title: string;
  category: string;
  description: string;
  requiredQuantity: number;
  unit: string;
  targetBudget?: number | null;
  deliveryPincode: string;
  minComplianceScore: number;
  status: RFQStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  buyerBusiness?: Business;
  quotesCount?: number;
}

export interface MarketplaceQuote {
  id: string;
  rfqId: string;
  supplierBusinessId: string;
  unitPrice: number;
  totalAmount: number;
  validityDays: number;
  deliveryDays: number;
  notes?: string | null;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
  supplierBusiness?: Business;
  rfq?: MarketplaceRFQ;
}

export interface MarketplaceOrder {
  id: string;
  rfqId: string;
  quoteId: string;
  buyerBusinessId: string;
  supplierBusinessId: string;
  amount: number;
  escrowStatus: MarketplaceEscrowStatus;
  paymentTransactionId?: string | null;
  createdAt: string;
  updatedAt: string;
  buyerBusiness?: Business;
  supplierBusiness?: Business;
  quote?: MarketplaceQuote;
}

// ─── Influencer & Creator Marketplace Types ───────────────────
export type CampaignStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled';
export type MilestoneStatus =
  | 'pending_submission'
  | 'submitted_for_review'
  | 'approved_released'
  | 'revision_requested';

export interface CreatorProfile {
  id: string;
  userId?: string | null;
  businessId?: string | null;
  displayName: string;
  handle: string;
  platform: 'youtube' | 'instagram' | 'moj' | 'josh';
  primaryLanguage: string;
  followerCount: number;
  niche: string;
  pan?: string | null;
  isVerified: boolean;
  bio?: string | null;
  bioHi?: string | null;
  rateCard: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorCampaign {
  id: string;
  brandBusinessId: string;
  title: string;
  description: string;
  budget: number;
  platform: string;
  targetLanguage: string;
  status: CampaignStatus;
  escrowStatus: MarketplaceEscrowStatus;
  paymentTransactionId?: string | null;
  createdAt: string;
  updatedAt: string;
  brandBusiness?: Business;
  milestones?: CampaignMilestone[];
}

export interface CampaignMilestone {
  id: string;
  campaignId: string;
  creatorId: string;
  title: string;
  deliverableType: string;
  amount: number;
  status: MilestoneStatus;
  deliverableUrl?: string | null;
  asciDisclosureVerified: boolean;
  notes?: string | null;
  submittedAt?: string | null;
  releasedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: CreatorProfile;
}

// ─── Roles & Permissions ──────────────────────────────────────
export interface Role {
  name: UserRole;
  description: string;
  createdAt: string;
}

export interface Permission {
  name: PermissionName;
  module: string;
  description: string;
  createdAt: string;
}

export interface RolePermission {
  id: string;
  roleName: UserRole;
  permissionName: PermissionName;
  createdAt: string;
}

// ─── Business Membership ──────────────────────────────────────
export interface BusinessMembership {
  id: string;
  userId: string;
  businessId: string;
  roleName: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  business?: Business;
  profile?: Profile;
}

// ─── Audit Logs ───────────────────────────────────────────────
export interface AuditLog {
  id: string;
  businessId: string | null;
  actorId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

// ─── Auth Session & User ──────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  locale?: Locale;
}

export interface AuthSession {
  user: AuthUser;
  profile: Profile | null;
  activeMembership: BusinessMembership | null;
  memberships: BusinessMembership[];
  permissions: PermissionName[];
}

// ─── Status Types ─────────────────────────────────────────────
export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

// ─── Queue Names (WORKFLOW.md §17) ────────────────────────────
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

// ─── API Response Types ───────────────────────────────────────
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  service: string;
  version: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
