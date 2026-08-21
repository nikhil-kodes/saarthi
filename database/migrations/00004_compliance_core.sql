-- Saarthi Database Migration: 00004_compliance_core.sql
-- Adds tables for regulatory requirement definitions, business compliance instances, and filing audit records.

-- ─── ENUMS ───────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE compliance_status_enum AS ENUM (
    'compliant',
    'due_soon',
    'overdue',
    'pending_verification',
    'exempt'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE compliance_frequency_enum AS ENUM (
    'monthly',
    'quarterly',
    'half_yearly',
    'annual',
    'event_based',
    'one_time'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE compliance_category_enum AS ENUM (
    'taxation',
    'labor_and_employment',
    'industry_specific',
    'corporate_and_msme',
    'environmental'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─── COMPLIANCE_REQUIREMENTS TABLE ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.compliance_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- e.g. 'GST_GSTR1_MONTHLY', 'UP_SHOPS_ANNUAL'
  title TEXT NOT NULL,
  title_hi TEXT,
  description TEXT NOT NULL,
  description_hi TEXT,
  category compliance_category_enum NOT NULL,
  act_name TEXT NOT NULL,
  jurisdiction_country TEXT NOT NULL DEFAULT 'IN',
  jurisdiction_state TEXT, -- NULL for Central acts, 'UP' for Uttar Pradesh acts
  applicability_rules JSONB NOT NULL DEFAULT '{}'::jsonb, -- Rules: sector, turnover_band, min_employees, has_gstin, has_fssai
  frequency compliance_frequency_enum NOT NULL,
  due_day_offset INTEGER NOT NULL DEFAULT 20, -- Days after period end (e.g. 20th of next month)
  penalty_details TEXT,
  penalty_details_hi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── BUSINESS_COMPLIANCE_INSTANCES TABLE ───────────────────────
CREATE TABLE IF NOT EXISTS public.business_compliance_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES public.compliance_requirements(id) ON DELETE RESTRICT,
  status compliance_status_enum NOT NULL DEFAULT 'due_soon',
  due_date DATE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_business_requirement_period UNIQUE (business_id, requirement_id, period_start, period_end)
);

-- ─── COMPLIANCE_FILING_RECORDS TABLE ───────────────────────────
CREATE TABLE IF NOT EXISTS public.compliance_filing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.business_compliance_instances(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  filed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  filed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledgement_number TEXT,
  document_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_compliance_inst_biz ON public.business_compliance_instances(business_id, due_date ASC);
CREATE INDEX IF NOT EXISTS idx_compliance_inst_status ON public.business_compliance_instances(status, due_date ASC);
CREATE INDEX IF NOT EXISTS idx_compliance_filing_inst ON public.compliance_filing_records(instance_id);
CREATE INDEX IF NOT EXISTS idx_compliance_req_cat ON public.compliance_requirements(category, jurisdiction_state);

-- ─── ROW LEVEL SECURITY (RLS) POLICIES ─────────────────────────

ALTER TABLE public.compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_compliance_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_filing_records ENABLE ROW LEVEL SECURITY;

-- 1. Requirements Catalog: Public read for authenticated users
CREATE POLICY "Authenticated users can read compliance requirements"
  ON public.compliance_requirements FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 2. Business Compliance Instances: Scoped to business members
CREATE POLICY "Members can view compliance instances for their business"
  ON public.business_compliance_instances FOR SELECT
  USING (public.is_member_of_business(business_id));

CREATE POLICY "Authorized members can update compliance instances"
  ON public.business_compliance_instances FOR UPDATE
  USING (public.has_business_permission(business_id, 'compliance.manage'));

CREATE POLICY "System/Owners can insert compliance instances"
  ON public.business_compliance_instances FOR INSERT
  WITH CHECK (public.has_business_permission(business_id, 'compliance.manage'));

-- 3. Filing Records: Scoped to business members with manage permissions
CREATE POLICY "Members can view filing records for their business"
  ON public.compliance_filing_records FOR SELECT
  USING (public.is_member_of_business(business_id));

CREATE POLICY "Authorized members can insert filing records"
  ON public.compliance_filing_records FOR INSERT
  WITH CHECK (public.has_business_permission(business_id, 'compliance.manage'));
