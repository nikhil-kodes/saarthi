-- Saarthi Database Migration: 00011_compliance_health_score.sql
-- Adds tables for Compliance Health Scores (300-900) and Consent-Gated Shareable Tokens with RLS.

-- ─── COMPLIANCE_HEALTH_SCORES TABLE ────────────────────────────
CREATE TABLE IF NOT EXISTS public.compliance_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 300 AND score <= 900),
  grade TEXT NOT NULL, -- 'AAA_EXCELLENT', 'AA_GOOD', 'A_MODERATE', 'NEEDS_IMPROVEMENT'
  pillar_scores JSONB NOT NULL DEFAULT '{}'::jsonb, -- 5 pillars: filing_timeliness, notice_resolution, identity_authenticity, financial_discipline, regulatory_adherence
  computation_factors JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SCORE_CONSENT_GRANTS TABLE ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.score_consent_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  grantee_name TEXT NOT NULL, -- e.g. 'State Bank of India - SME Branch', 'Tata Steel Vendor Desk'
  grantee_type TEXT NOT NULL DEFAULT 'lender', -- 'lender' | 'supplier' | 'buyer' | 'ca_partner'
  access_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_health_scores_biz ON public.compliance_health_scores(business_id, computed_at DESC);
CREATE INDEX IF NOT EXISTS idx_consent_token ON public.score_consent_grants(access_token);
CREATE INDEX IF NOT EXISTS idx_consent_biz ON public.score_consent_grants(business_id, created_at DESC);

-- ─── ROW LEVEL SECURITY (RLS) POLICIES ─────────────────────────

ALTER TABLE public.compliance_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_consent_grants ENABLE ROW LEVEL SECURITY;

-- 1. Scores: Readable by business members
CREATE POLICY "Members can view scores for their business"
  ON public.compliance_health_scores FOR SELECT
  USING (public.is_member_of_business(business_id));

CREATE POLICY "Members can insert recomputed scores"
  ON public.compliance_health_scores FOR INSERT
  WITH CHECK (public.has_business_permission(business_id, 'score.view'));

-- 2. Consent Grants: Readable by business members or via public token verification
CREATE POLICY "Members can view consent grants for their business"
  ON public.score_consent_grants FOR SELECT
  USING (public.is_member_of_business(business_id));

CREATE POLICY "Members can grant score sharing consent"
  ON public.score_consent_grants FOR INSERT
  WITH CHECK (public.has_business_permission(business_id, 'score.share'));

CREATE POLICY "Members can revoke score sharing consent"
  ON public.score_consent_grants FOR UPDATE
  USING (public.has_business_permission(business_id, 'score.share'));
