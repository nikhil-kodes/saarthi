-- Saarthi Database Migration: 00003_business_verifications_and_invites.sql
-- Adds business_verifications table for verification history and team_invites table for team delegation.

-- ─── ENUMS ───────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE verification_status_enum AS ENUM (
    'unverified',
    'pending',
    'verified',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─── BUSINESS_VERIFICATIONS TABLE ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.business_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  status verification_status_enum NOT NULL DEFAULT 'pending',
  provider_used TEXT NOT NULL DEFAULT 'MockVerificationProvider',
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_results JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of verification check items (GSTIN, Udyam, PAN, FSSAI)
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TEAM_INVITES TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role_name TEXT NOT NULL REFERENCES public.roles(name) ON DELETE RESTRICT,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_verifications_business ON public.business_verifications(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_invites_token ON public.team_invites(token);
CREATE INDEX IF NOT EXISTS idx_team_invites_business ON public.team_invites(business_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON public.team_invites(email);

-- ─── ROW LEVEL SECURITY (RLS) POLICIES ─────────────────────────

ALTER TABLE public.business_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- 1. Business Verifications Policies
CREATE POLICY "Members can view verifications for their business"
  ON public.business_verifications FOR SELECT
  USING (public.is_member_of_business(business_id));

CREATE POLICY "Owners and suppliers can initiate verifications"
  ON public.business_verifications FOR INSERT
  WITH CHECK (
    public.has_business_permission(business_id, 'business.verify')
  );

CREATE POLICY "Owners can update verification status"
  ON public.business_verifications FOR UPDATE
  USING (
    public.has_business_permission(business_id, 'business.verify')
  );

-- 2. Team Invites Policies
CREATE POLICY "Members can view invites for their business"
  ON public.team_invites FOR SELECT
  USING (
    public.is_member_of_business(business_id)
  );

CREATE POLICY "Owners can create team invites"
  ON public.team_invites FOR INSERT
  WITH CHECK (
    public.has_business_permission(business_id, 'team.invite')
  );

CREATE POLICY "Owners can manage team invites"
  ON public.team_invites FOR DELETE
  USING (
    public.has_business_permission(business_id, 'team.remove')
  );
