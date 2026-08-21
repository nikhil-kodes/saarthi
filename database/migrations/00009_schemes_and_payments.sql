-- Saarthi Database Migration: 00009_schemes_and_payments.sql
-- Adds tables for government schemes, scheme applications, and payment/refund transactions with RLS.

-- ─── ENUMS ───────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE scheme_benefit_type_enum AS ENUM (
    'capital_subsidy',
    'interest_subvention',
    'collateral_free_loan',
    'tax_exemption',
    'grant'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE scheme_application_status_enum AS ENUM (
    'draft',
    'submitted',
    'under_review',
    'approved',
    'disbursed',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_enum AS ENUM (
    'created',
    'pending',
    'captured',
    'failed',
    'refunded'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─── GOVERNMENT_SCHEMES TABLE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.government_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_hi TEXT,
  ministry TEXT NOT NULL,
  description TEXT NOT NULL,
  description_hi TEXT,
  eligibility_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  max_benefit_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  benefit_type scheme_benefit_type_enum NOT NULL DEFAULT 'capital_subsidy',
  application_url TEXT,
  jurisdiction_state TEXT, -- NULL for Central, 'UP' for Uttar Pradesh
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SCHEME_APPLICATIONS TABLE ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.scheme_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES public.government_schemes(id) ON DELETE CASCADE,
  applicant_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status scheme_application_status_enum NOT NULL DEFAULT 'submitted',
  application_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  tracking_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PAYMENT_TRANSACTIONS TABLE ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'razorpay',
  provider_order_id TEXT NOT NULL,
  provider_payment_id TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status payment_status_enum NOT NULL DEFAULT 'created',
  purpose TEXT NOT NULL, -- e.g. 'compliance_filing_fee', 'ca_consultation', 'saarthi_pro_subscription'
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  refund_id TEXT,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_schemes_state_act ON public.government_schemes(jurisdiction_state, is_active);
CREATE INDEX IF NOT EXISTS idx_scheme_apps_biz ON public.scheme_applications(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_biz ON public.payment_transactions(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payment_transactions(provider_order_id);

-- ─── ROW LEVEL SECURITY (RLS) POLICIES ─────────────────────────

ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- 1. Schemes: Readable by all authenticated users
CREATE POLICY "Authenticated users can view schemes"
  ON public.government_schemes FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 2. Scheme Applications: Scoped to business members
CREATE POLICY "Members can view applications for their business"
  ON public.scheme_applications FOR SELECT
  USING (public.is_member_of_business(business_id));

CREATE POLICY "Members can apply for schemes on behalf of business"
  ON public.scheme_applications FOR INSERT
  WITH CHECK (public.has_business_permission(business_id, 'compliance.manage'));

-- 3. Payment Transactions: Scoped to business members
CREATE POLICY "Members can view payments for their business"
  ON public.payment_transactions FOR SELECT
  USING (public.is_member_of_business(business_id));

CREATE POLICY "Members can initiate payments for their business"
  ON public.payment_transactions FOR INSERT
  WITH CHECK (public.has_business_permission(business_id, 'compliance.manage'));
