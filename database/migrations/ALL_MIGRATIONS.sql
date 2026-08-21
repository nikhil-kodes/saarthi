-- =====================================================================
-- SAARTHI COMPLETE DATABASE SCHEMA & SEED DATA MIGRATION
-- Project: https://ijozkccvhwwzbowxremt.supabase.co
-- Generated: 2026-08-21T06:29:37.319Z
-- Contains all 15 migrations in exact chronological dependency order.
-- =====================================================================


-- ═════════════════════════════════════════════════════════════════════
-- MIGRATION: 00001_initial_schema.sql
-- ═════════════════════════════════════════════════════════════════════

-- Saarthi Database Migration: 00001_initial_schema.sql
-- Foundational schema: extensions, profiles, businesses, roles, permissions,
-- role_permissions, business_memberships, and audit_logs with Row Level Security.

-- ─── EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUMS ───────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM (
    'owner',
    'team_member',
    'ca_partner',
    'supplier',
    'influencer',
    'lender',
    'admin'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE locale_enum AS ENUM ('en', 'hi');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─── PROFILES TABLE (linked to auth.users) ────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone_number TEXT,
  locale locale_enum NOT NULL DEFAULT 'en',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── BUSINESSES TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name TEXT NOT NULL,
  trade_name TEXT,
  sector TEXT NOT NULL, -- NIC code or standardized sector name
  jurisdiction_country TEXT NOT NULL DEFAULT 'IN',
  jurisdiction_state TEXT NOT NULL DEFAULT 'UP', -- Central + UP scope for Phase 0–4
  employee_count_band TEXT, -- '1-9', '10-19', '20-49', '50-249', '250+'
  turnover_band TEXT, -- 'micro', 'small', 'medium', 'other'
  investment_band TEXT,
  gstin TEXT,
  udyam_number TEXT,
  fssai_number TEXT,
  pan TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ROLES TABLE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.roles (
  name TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PERMISSIONS TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.permissions (
  name TEXT PRIMARY KEY,
  module TEXT NOT NULL, -- 'compliance', 'marketplace', 'auth', 'admin', 'consents', etc.
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ROLE_PERMISSIONS TABLE ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT NOT NULL REFERENCES public.roles(name) ON DELETE CASCADE,
  permission_name TEXT NOT NULL REFERENCES public.permissions(name) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_role_permission UNIQUE (role_name, permission_name)
);

-- ─── BUSINESS_MEMBERSHIPS TABLE ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.business_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL REFERENCES public.roles(name) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_business UNIQUE (user_id, business_id)
);

-- ─── AUDIT_LOGS TABLE (Append-Only) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_businesses_jurisdiction ON public.businesses(jurisdiction_country, jurisdiction_state);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.business_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_business ON public.business_memberships(business_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_business_created ON public.audit_logs(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, created_at DESC);

-- ─── FUNCTIONS & TRIGGERS ─────────────────────────────────────

-- Automatically handle profile creation on new user signup in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_locale locale_enum := 'en';
  v_full_name TEXT;
  v_avatar TEXT;
BEGIN
  -- Safe locale determination (Google OAuth sends 'en-US', 'en-GB', etc.)
  IF (NEW.raw_user_meta_data->>'locale') ILIKE 'hi%' THEN
    v_locale := 'hi';
  ELSE
    v_locale := 'en';
  END IF;

  -- Safe name resolution (Google OAuth sends 'name' or 'full_name')
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    ''
  );

  -- Safe avatar resolution (Google OAuth sends 'picture' or 'avatar_url')
  v_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NULL
  );

  INSERT INTO public.profiles (id, email, full_name, locale, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    v_full_name,
    v_locale,
    v_avatar
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never abort auth.users transaction; log warning and proceed safely
  RAISE WARNING 'handle_new_user trigger exception for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Trigger on auth.users (executed if auth schema exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT OR UPDATE ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Helper to check if current authenticated user belongs to business
CREATE OR REPLACE FUNCTION public.is_member_of_business(business_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.business_memberships
    WHERE business_id = business_uuid
      AND user_id = auth.uid()
      AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper to check if user has a specific permission in a business
CREATE OR REPLACE FUNCTION public.has_business_permission(business_uuid UUID, required_permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.business_memberships bm
    JOIN public.role_permissions rp ON rp.role_name = bm.role_name
    WHERE bm.business_id = business_uuid
      AND bm.user_id = auth.uid()
      AND bm.is_active = TRUE
      AND rp.permission_name = required_permission
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─── ROW LEVEL SECURITY (RLS) POLICIES ─────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Businesses Policies
CREATE POLICY "Users can view businesses they belong to"
  ON public.businesses FOR SELECT
  USING (public.is_member_of_business(id));

CREATE POLICY "Owners can update their businesses"
  ON public.businesses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.business_memberships
      WHERE business_id = public.businesses.id
        AND user_id = auth.uid()
        AND role_name = 'owner'
        AND is_active = TRUE
    )
  );

CREATE POLICY "Authenticated users can create businesses"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Business Memberships Policies
CREATE POLICY "Users can view memberships of their businesses"
  ON public.business_memberships FOR SELECT
  USING (
    user_id = auth.uid() OR public.is_member_of_business(business_id)
  );

CREATE POLICY "Owners can manage memberships of their businesses"
  ON public.business_memberships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.business_memberships
      WHERE business_id = public.business_memberships.business_id
        AND user_id = auth.uid()
        AND role_name = 'owner'
        AND is_active = TRUE
    )
  );

CREATE POLICY "Users can insert their own initial ownership membership"
  ON public.business_memberships FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 4. Roles & Permissions (Read-only for all authenticated users)
CREATE POLICY "Anyone can view roles"
  ON public.roles FOR SELECT
  USING (TRUE);

CREATE POLICY "Anyone can view permissions"
  ON public.permissions FOR SELECT
  USING (TRUE);

CREATE POLICY "Anyone can view role_permissions"
  ON public.role_permissions FOR SELECT
  USING (TRUE);

-- 5. Audit Logs Policies (Append-only: SELECT and INSERT only, NO UPDATE or DELETE)
CREATE POLICY "Members can view audit logs for their business"
  ON public.audit_logs FOR SELECT
  USING (
    business_id IS NOT NULL AND public.is_member_of_business(business_id)
  );

CREATE POLICY "System and users can append audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (
    actor_id IS NULL OR actor_id = auth.uid()
  );

-- Explicitly disallow UPDATE and DELETE on audit_logs
CREATE POLICY "No update on audit logs"
  ON public.audit_logs FOR UPDATE
  USING (FALSE);

CREATE POLICY "No delete on audit logs"
  ON public.audit_logs FOR DELETE
  USING (FALSE);



-- ═════════════════════════════════════════════════════════════════════
-- MIGRATION: 00002_seed_rbac.sql
-- ═════════════════════════════════════════════════════════════════════

-- Saarthi Database Migration: 00002_seed_rbac.sql
-- Seed standard roles, granular permissions, and role_permissions mapping.

-- ─── SEED ROLES ───────────────────────────────────────────────
INSERT INTO public.roles (name, description) VALUES
  ('owner', 'MSME proprietor or director with full authority over business and compliance.'),
  ('team_member', 'Delegated staff handling compliance tasks, document uploads, and day-to-day operations.'),
  ('ca_partner', 'External Chartered Accountant / Tax Consultant with scoped access across client businesses.'),
  ('supplier', 'B2B seller offering goods or services on the supplier marketplace.'),
  ('influencer', 'Content creator participating in verified brand campaigns.'),
  ('lender', 'Financial institution or NBFC evaluating business credit via consented score access.'),
  ('admin', 'Saarthi platform operator overseeing verifications, disputes, and system health.')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- ─── SEED PERMISSIONS ─────────────────────────────────────────
INSERT INTO public.permissions (name, module, description) VALUES
  -- Compliance Module
  ('compliance.view', 'compliance', 'View compliance calendar, requirements, and status.'),
  ('compliance.manage', 'compliance', 'Mark tasks complete, upload evidence, edit calendar dates.'),
  ('compliance.export', 'compliance', 'Export compliance certificates and reports.'),

  -- Documents & Notices Module
  ('documents.view', 'documents', 'View uploaded documents, licences, and notices.'),
  ('documents.upload', 'documents', 'Upload new licences, government notices, and filings.'),
  ('documents.delete', 'documents', 'Delete uploaded documents.'),

  -- Business Profile & Verification
  ('business.view', 'business', 'View business profile and registration details.'),
  ('business.update_profile', 'business', 'Update legal name, turnover, sector, and registrations.'),
  ('business.verify', 'business', 'Initiate business identity and registration verification.'),

  -- Team Management
  ('team.view', 'team', 'View members and assigned roles.'),
  ('team.invite', 'team', 'Invite new team members or CA partners.'),
  ('team.manage_roles', 'team', 'Change assigned roles of team members.'),
  ('team.remove', 'team', 'Remove team members from the business.'),

  -- Supplier Marketplace
  ('marketplace.buy', 'marketplace', 'Browse suppliers, create RFQs, and place orders.'),
  ('marketplace.sell', 'marketplace', 'Create supplier catalog, respond to RFQs, and fulfill orders.'),
  ('marketplace.manage_rfq', 'marketplace', 'Approve quotes and finalize escrow transactions.'),

  -- Influencer Marketplace
  ('campaigns.create', 'campaigns', 'Create influencer marketing campaigns and fund escrow.'),
  ('campaigns.collaborate', 'campaigns', 'Accept campaign proposals and submit deliverable proof.'),
  ('campaigns.payout', 'campaigns', 'Approve creator milestones and release TDS-deducted payouts.'),

  -- Compliance Health Score & Consents
  ('score.view', 'score', 'View Compliance Health Score, breakdown, and score history.'),
  ('score.share', 'score', 'Grant consent to lenders/NBFCs to view Compliance Health Score.'),
  ('consents.view', 'consents', 'View active and historical data sharing consents.'),
  ('consents.grant', 'consents', 'Issue new consent tokens to lenders or partners.'),
  ('consents.revoke', 'consents', 'Immediately revoke third-party consent access.'),

  -- Audit & Admin
  ('audit.view', 'audit', 'View business audit logs and security activity.'),
  ('admin.all', 'admin', 'Full platform administrative access.')
ON CONFLICT (name) DO UPDATE SET module = EXCLUDED.module, description = EXCLUDED.description;

-- ─── SEED ROLE_PERMISSIONS MAPPING ────────────────────────────

-- 1. Owner: Full business, compliance, marketplace, and consent permissions
INSERT INTO public.role_permissions (role_name, permission_name)
SELECT 'owner', name FROM public.permissions WHERE name != 'admin.all'
ON CONFLICT (role_name, permission_name) DO NOTHING;

-- 2. Team Member: Operational compliance and documents
INSERT INTO public.role_permissions (role_name, permission_name)
SELECT 'team_member', name FROM public.permissions WHERE name IN (
  'compliance.view',
  'compliance.manage',
  'documents.view',
  'documents.upload',
  'business.view',
  'score.view',
  'marketplace.buy'
)
ON CONFLICT (role_name, permission_name) DO NOTHING;

-- 3. CA Partner: Compliance, documents, audit, and score
INSERT INTO public.role_permissions (role_name, permission_name)
SELECT 'ca_partner', name FROM public.permissions WHERE name IN (
  'compliance.view',
  'compliance.manage',
  'compliance.export',
  'documents.view',
  'documents.upload',
  'business.view',
  'score.view',
  'audit.view'
)
ON CONFLICT (role_name, permission_name) DO NOTHING;

-- 4. Supplier: Marketplace sell + compliance view
INSERT INTO public.role_permissions (role_name, permission_name)
SELECT 'supplier', name FROM public.permissions WHERE name IN (
  'marketplace.sell',
  'marketplace.manage_rfq',
  'business.view',
  'business.verify',
  'compliance.view',
  'score.view',
  'documents.view',
  'documents.upload'
)
ON CONFLICT (role_name, permission_name) DO NOTHING;

-- 5. Influencer / Creator: Campaigns collaborate + profile
INSERT INTO public.role_permissions (role_name, permission_name)
SELECT 'influencer', name FROM public.permissions WHERE name IN (
  'campaigns.collaborate',
  'business.view',
  'business.verify',
  'documents.view',
  'documents.upload'
)
ON CONFLICT (role_name, permission_name) DO NOTHING;

-- 6. Lender / NBFC: Consented score and verification view
INSERT INTO public.role_permissions (role_name, permission_name)
SELECT 'lender', name FROM public.permissions WHERE name IN (
  'score.view',
  'business.view',
  'compliance.view'
)
ON CONFLICT (role_name, permission_name) DO NOTHING;

-- 7. Admin: Platform administration
INSERT INTO public.role_permissions (role_name, permission_name)
SELECT 'admin', name FROM public.permissions
ON CONFLICT (role_name, permission_name) DO NOTHING;



-- ═════════════════════════════════════════════════════════════════════
-- MIGRATION: 00003_business_verifications_and_invites.sql
-- ═════════════════════════════════════════════════════════════════════

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



-- ═════════════════════════════════════════════════════════════════════
-- MIGRATION: 00004_compliance_core.sql
-- ═════════════════════════════════════════════════════════════════════

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



-- ═════════════════════════════════════════════════════════════════════
-- MIGRATION: 00005_seed_compliance_requirements.sql
-- ═════════════════════════════════════════════════════════════════════

-- Saarthi Database Migration: 00005_seed_compliance_requirements.sql
-- Seeds initial Central Indian and Uttar Pradesh State regulatory requirements catalog.

INSERT INTO public.compliance_requirements (
  code,
  title,
  title_hi,
  description,
  description_hi,
  category,
  act_name,
  jurisdiction_country,
  jurisdiction_state,
  applicability_rules,
  frequency,
  due_day_offset,
  penalty_details,
  penalty_details_hi
) VALUES
-- 1. GST GSTR-1 Monthly
(
  'GST_GSTR1_MONTHLY',
  'GSTR-1 Monthly Outward Supplies Return',
  'जीएसटीआर-1 मासिक बिक्री रिटर्न',
  'Mandatory monthly statement of all outward supplies of goods and services for regular GST taxpayers.',
  'नियमित जीएसटी करदाताओं के लिए माल और सेवाओं की सभी बाहरी आपूर्ति का अनिवार्य मासिक विवरण।',
  'taxation',
  'Central Goods and Services Tax Act, 2017',
  'IN',
  NULL,
  '{"has_gstin": true, "filing_scheme": "monthly"}'::jsonb,
  'monthly',
  11,
  'Late fee of ₹50/day (₹20/day for NIL return) under Section 47 of CGST Act.',
  'सीजीएसटी अधिनियम की धारा 47 के तहत ₹50/दिन (शून्य रिटर्न के लिए ₹20/दिन) का विलंब शुल्क।'
),
-- 2. GST GSTR-3B Monthly
(
  'GST_GSTR3B_MONTHLY',
  'GSTR-3B Monthly Summary Return & Tax Payment',
  'जीएसटीआर-3बी मासिक सारांश रिटर्न और कर भुगतान',
  'Mandatory monthly self-assessed summary return of input tax credit availed, tax liability declared and paid.',
  'इनपुट टैक्स क्रेडिट, कर देनदारी और भुगतान का अनिवार्य मासिक स्व-मूल्यांकन रिटर्न।',
  'taxation',
  'Central Goods and Services Tax Act, 2017',
  'IN',
  NULL,
  '{"has_gstin": true, "filing_scheme": "monthly"}'::jsonb,
  'monthly',
  20,
  'Interest at 18% p.a. on delayed tax payment plus ₹50/day late fee.',
  'विलंबित कर भुगतान पर 18% प्रति वर्ष की दर से ब्याज और ₹50/दिन का विलंब शुल्क।'
),
-- 3. Udyam Annual Update
(
  'UDYAM_ANNUAL_UPDATE',
  'Udyam MSME Annual Information Update',
  'उद्यम एमएसएमई वार्षिक विवरण अद्यतन',
  'Annual mandatory update of turnover and plant & machinery investment on the official Udyam portal to maintain MSME priority classification.',
  'एमएसएमई प्राथमिकता वर्गीकरण बनाए रखने के लिए उद्यम पोर्टल पर टर्नओवर और निवेश का वार्षिक अद्यतन।',
  'corporate_and_msme',
  'Micro, Small and Medium Enterprises Development (MSMED) Act, 2006',
  'IN',
  NULL,
  '{"has_udyam": true}'::jsonb,
  'annual',
  90, -- June 30 (90 days post FY close)
  'Suspension of MSME priority benefits and public procurement preferences.',
  'एमएसएमई प्राथमिकता लाभों और सार्वजनिक खरीद वरीयता का निलंबन।'
),
-- 4. FSSAI Annual Return Form D1
(
  'FSSAI_ANNUAL_RETURN_D1',
  'FSSAI Annual Return (Form D-1)',
  'FSSAI वार्षिक रिटर्न (फॉर्म डी-1)',
  'Annual return filing for Food Business Operators (manufacturers, repackers, importers) detailing food category volumes and quantities.',
  'खाद्य व्यवसाय संचालकों के लिए वार्षिक रिटर्न जिसमें खाद्य श्रेणियों और मात्राओं का विवरण होता है।',
  'industry_specific',
  'Food Safety and Standards Act, 2006',
  'IN',
  NULL,
  '{"sector": "Food Processing & Confectionery"}'::jsonb,
  'annual',
  61, -- May 31 (61 days post FY close)
  'Late fee of ₹100 per day of delay up to a maximum equal to 5 times annual licence fee.',
  'विलंब के प्रति दिन ₹100 का शुल्क, जो वार्षिक लाइसेंस शुल्क के अधिकतम 5 गुना तक हो सकता है।'
),
-- 5. Income Tax Advance Tax - Q1
(
  'IT_ADVANCE_TAX_Q1',
  'Income Tax Advance Tax Installment (Q1 - 15%)',
  'आयकर अग्रिम कर पहली किस्त (Q1 - 15%)',
  'First installment of advance tax (15% of estimated total income tax liability) for the assessment year.',
  'आकलन वर्ष के लिए अनुमानित कुल आयकर देनदारी की पहली किस्त (15%)।',
  'taxation',
  'Income Tax Act, 1961',
  'IN',
  NULL,
  '{"min_turnover": "micro"}'::jsonb,
  'quarterly',
  15, -- June 15
  'Interest penalty at 1% per month under Section 234C on shortfall of advance tax.',
  'अग्रिम कर की कमी पर धारा 234C के तहत प्रति माह 1% की दर से ब्याज दंड।'
),
-- 6. Income Tax Advance Tax - Q2
(
  'IT_ADVANCE_TAX_Q2',
  'Income Tax Advance Tax Installment (Q2 - 45%)',
  'आयकर अग्रिम कर दूसरी किस्त (Q2 - 45%)',
  'Second cumulative installment of advance tax (45% of estimated total income tax liability).',
  'अनुमानित कुल आयकर देनदारी की दूसरी संचयी किस्त (45%)।',
  'taxation',
  'Income Tax Act, 1961',
  'IN',
  NULL,
  '{"min_turnover": "micro"}'::jsonb,
  'quarterly',
  15, -- Sept 15
  'Interest penalty at 1% per month under Section 234C on shortfall.',
  'कमी पर धारा 234C के तहत प्रति माह 1% की दर से ब्याज दंड।'
),
-- 7. Income Tax Advance Tax - Q3
(
  'IT_ADVANCE_TAX_Q3',
  'Income Tax Advance Tax Installment (Q3 - 75%)',
  'आयकर अग्रिम कर तीसरी किस्त (Q3 - 75%)',
  'Third cumulative installment of advance tax (75% of estimated total income tax liability).',
  'अनुमानित कुल आयकर देनदारी की तीसरी संचयी किस्त (75%)।',
  'taxation',
  'Income Tax Act, 1961',
  'IN',
  NULL,
  '{"min_turnover": "micro"}'::jsonb,
  'quarterly',
  15, -- Dec 15
  'Interest penalty at 1% per month under Section 234C on shortfall.',
  'कमी पर धारा 234C के तहत प्रति माह 1% की दर से ब्याज दंड।'
),
-- 8. Income Tax Advance Tax - Q4
(
  'IT_ADVANCE_TAX_Q4',
  'Income Tax Advance Tax Installment (Q4 - 100%)',
  'आयकर अग्रिम कर चौथी किस्त (Q4 - 100%)',
  'Final installment of advance tax (100% of estimated income tax liability).',
  'अनुमानित आयकर देनदारी की अंतिम किस्त (100%)।',
  'taxation',
  'Income Tax Act, 1961',
  'IN',
  NULL,
  '{"min_turnover": "micro"}'::jsonb,
  'quarterly',
  15, -- March 15
  'Interest penalty under Section 234B and 234C.',
  'धारा 234B और 234C के तहत ब्याज दंड।'
),
-- 9. EPF Monthly ECR
(
  'EPF_MONTHLY_ECR',
  'EPF Monthly Electronic Challan cum Return (ECR)',
  'ईपीएफ मासिक इलेक्ट्रॉनिक चालान सह रिटर्न (ECR)',
  'Monthly filing and remittance of Employees Provident Fund contributions for units with 20 or more staff.',
  '20 या अधिक कर्मचारियों वाली इकाइयों के लिए कर्मचारी भविष्य निधि योगदान का मासिक विवरण व प्रेषण।',
  'labor_and_employment',
  'Employees Provident Funds and Miscellaneous Provisions Act, 1952',
  'IN',
  NULL,
  '{"min_employees": 20}'::jsonb,
  'monthly',
  15,
  'Damages ranging from 5% to 25% p.a. under Section 14B plus 12% interest under Section 7Q.',
  'धारा 14B के तहत 5% से 25% प्रति वर्ष तक हर्जाना और धारा 7Q के तहत 12% ब्याज।'
),
-- 10. UP Shops & Commercial Establishments Annual Renewal
(
  'UP_SHOPS_ANNUAL_RENEWAL',
  'UP Shops & Commercial Establishments Registration Renewal',
  'उत्तर प्रदेश दुकान एवं वाणिज्यिक प्रतिष्ठान पंजीकरण नवीनीकरण',
  'Annual renewal of establishment registration under Uttar Pradesh state labor rules for operational commercial premises.',
  'व्यावसायिक परिसरों के लिए उत्तर प्रदेश राज्य श्रम नियमों के तहत प्रतिष्ठान पंजीकरण का वार्षिक नवीनीकरण।',
  'labor_and_employment',
  'Uttar Pradesh Dookan Aur Vanijya Adhishthan Adhiniyam, 1962',
  'IN',
  'UP',
  '{"jurisdiction_state": "UP"}'::jsonb,
  'annual',
  31, -- Dec 31
  'Penal action by State Labor Inspectorate and fines under Section 31.',
  'राज्य श्रम निरीक्षणालय द्वारा दंडात्मक कार्रवाई और धारा 31 के तहत जुर्माना।'
),
-- 11. UP Pollution Control Board CTO Renewal
(
  'UPPCB_CTO_RENEWAL',
  'UPPCB Consent to Operate (CTO) Renewal',
  'उत्तर प्रदेश प्रदूषण नियंत्रण बोर्ड संचालन सहमति (CTO) नवीनीकरण',
  'Periodic renewal of air and water consent to operate for manufacturing, chemical, and leather processing units in Uttar Pradesh.',
  'उत्तर प्रदेश में विनिर्माण, रसायन और चमड़ा प्रसंस्करण इकाइयों के लिए संचालन हेतु वायु और जल सहमति का नवीनीकरण।',
  'environmental',
  'Water (Prevention & Control of Pollution) Act, 1974 & Air Act, 1981',
  'IN',
  'UP',
  '{"jurisdiction_state": "UP", "sectors": ["Leather & Footwear", "Chemicals & Pharmaceuticals", "Food Processing & Confectionery"]}'::jsonb,
  'annual',
  90,
  'Closure notices under Section 33A of Water Act and heavy environmental compensation tariffs.',
  'जल अधिनियम की धारा 33A के तहत बंदी नोटिस और भारी पर्यावरणीय मुआवजा शुल्क।'
)
ON CONFLICT (code) DO NOTHING;



-- ═════════════════════════════════════════════════════════════════════
-- MIGRATION: 00006_regulatory_intelligence_and_rag.sql
-- ═════════════════════════════════════════════════════════════════════

-- Saarthi Database Migration: 00006_regulatory_intelligence_and_rag.sql
-- Adds tables for regulatory updates, document chunks with vector embeddings, and RAG query audit records.

-- ─── EXTENSIONS ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- ─── REGULATORY_UPDATES TABLE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.regulatory_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_hi TEXT,
  source TEXT NOT NULL, -- e.g., 'CBIC', 'GSTN', 'FSSAI', 'Ministry of MSME', 'UP Government'
  source_url TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_date DATE,
  category compliance_category_enum NOT NULL DEFAULT 'taxation',
  jurisdiction_state TEXT, -- NULL for Central, 'UP' for Uttar Pradesh
  summary_en TEXT NOT NULL,
  summary_hi TEXT,
  raw_content TEXT,
  impacted_sectors JSONB NOT NULL DEFAULT '[]'::jsonb,
  impacted_thresholds JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── REGULATORY_DOCUMENT_CHUNKS (VECTOR EMBEDDINGS) ───────────
CREATE TABLE IF NOT EXISTS public.regulatory_document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id UUID NOT NULL REFERENCES public.regulatory_updates(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  chunk_text TEXT NOT NULL,
  chunk_text_hi TEXT,
  embedding vector(384), -- BAAI/bge-small-en-v1.5 / all-MiniLM-L6-v2 dimensions
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RAG_QUERIES TABLE (AUDIT & CITATION LOG) ─────────────────
CREATE TABLE IF NOT EXISTS public.rag_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  query_text TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  response_text TEXT NOT NULL,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb, -- Grounded citations (title, circular_number, date, url)
  confidence_score NUMERIC(4, 3),
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reg_updates_cat_pub ON public.regulatory_updates(category, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_reg_updates_state ON public.regulatory_updates(jurisdiction_state);
CREATE INDEX IF NOT EXISTS idx_rag_queries_biz ON public.rag_queries(business_id, created_at DESC);

-- ─── ROW LEVEL SECURITY (RLS) POLICIES ─────────────────────────

ALTER TABLE public.regulatory_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_queries ENABLE ROW LEVEL SECURITY;

-- 1. Regulatory Updates: Readable by all authenticated users
CREATE POLICY "Authenticated users can read regulatory updates"
  ON public.regulatory_updates FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 2. Chunks: Readable by authenticated users
CREATE POLICY "Authenticated users can read document chunks"
  ON public.regulatory_document_chunks FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 3. RAG Queries: Users can view their own queries or queries for their business
CREATE POLICY "Users can view their own RAG query logs"
  ON public.rag_queries FOR SELECT
  USING (
    user_id = auth.uid() OR
    (business_id IS NOT NULL AND public.is_member_of_business(business_id))
  );

CREATE POLICY "Authenticated users can insert RAG query logs"
  ON public.rag_queries FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ─── PGVECTOR SIMILARITY SEARCH RPC ───────────────────────────
CREATE OR REPLACE FUNCTION public.match_regulatory_chunks(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.4,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  update_id UUID,
  chunk_index INTEGER,
  chunk_text TEXT,
  chunk_text_hi TEXT,
  metadata JSONB,
  similarity float,
  title TEXT,
  source TEXT,
  source_url TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.update_id,
    c.chunk_index,
    c.chunk_text,
    c.chunk_text_hi,
    c.metadata,
    (1 - (c.embedding <=> query_embedding))::float AS similarity,
    u.title,
    u.source,
    u.source_url
  FROM public.regulatory_document_chunks c
  JOIN public.regulatory_updates u ON u.id = c.update_id
  WHERE c.embedding IS NOT NULL
    AND (1 - (c.embedding <=> query_embedding)) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;




-- ═════════════════════════════════════════════════════════════════════
-- MIGRATION: 00007_seed_regulatory_updates.sql
-- ═════════════════════════════════════════════════════════════════════

-- Saarthi Database Migration: 00007_seed_regulatory_updates.sql
-- Seeds initial regulatory circulars, notifications, and advisories for RAG grounding.

INSERT INTO public.regulatory_updates (
  title,
  title_hi,
  source,
  source_url,
  published_at,
  effective_date,
  category,
  jurisdiction_state,
  summary_en,
  summary_hi,
  raw_content,
  impacted_sectors,
  impacted_thresholds
) VALUES
-- 1. GST Invoice Matching Advisory
(
  'CBIC Notification: Mandatory E-Invoicing Thresholds & ITC Verification',
  'सीबीआईसी अधिसूचना: अनिवार्य ई-चालान और आईटीसी सत्यापन नियम',
  'CBIC / GSTN',
  'https://taxinformation.cbic.gov.in/notifications/04-2024',
  NOW() - INTERVAL '3 days',
  '2026-04-01',
  'taxation',
  NULL,
  'CBIC mandates strict 100% GSTR-2B automated matching for Input Tax Credit claims. Taxpayers with aggregate turnover above ₹5 Crore must issue B2B e-invoices with valid IRN numbers.',
  'सीबीआईसी ने इनपुट टैक्स क्रेडिट के लिए GSTR-2B से 100% मिलान अनिवार्य किया है। ₹5 करोड़ से अधिक वार्षिक कारोबार वाले व्यवसायों को अनिवार्य रूप से ई-इनवॉइस बनाना होगा।',
  'In exercise of the powers conferred by section 164 of the Central Goods and Services Tax Act, 2017, the Central Government hereby clarifies that no registered person shall avail input tax credit in respect of any supply of goods or services unless the details of such invoice have been furnished by the supplier in GSTR-1 and communicated to the recipient in Form GSTR-2B.',
  '["All Sectors", "Manufacturing", "Retail Trade & Wholesale"]'::jsonb,
  '{"min_turnover": "small", "annual_turnover_cr": 5}'::jsonb
),
-- 2. FSSAI Labeling & Display Regulations
(
  'FSSAI Advisory: Front-of-Pack Nutritional Labeling & Devanagari Display',
  'FSSAI सलाह: खाद्य पैकेटों पर पोषण लेबलिंग और अनिवार्य देवनागरी प्रदर्शन',
  'Food Safety and Standards Authority of India (FSSAI)',
  'https://fssai.gov.in/advisories/fopnl-2026',
  NOW() - INTERVAL '7 days',
  '2026-06-01',
  'industry_specific',
  NULL,
  'FSSAI mandates clear declarations of total sugar, saturated fat, and sodium per 100g on the principal display panel. Hindi / regional language font size must be at least 1.5mm.',
  'FSSAI ने सभी पैक किए गए खाद्य उत्पादों पर चीनी, वसा और सोडियम की स्पष्ट घोषणा अनिवार्य की है। हिंदी/क्षेत्रीय भाषा का फ़ॉन्ट आकार न्यूनतम 1.5 मिमी होना चाहिए।',
  'Food Safety and Standards (Labeling and Display) Amendment Regulations require all pre-packaged food manufacturers to display key nutritional values and allergy warnings in both English and Devanagari script.',
  '["Food Processing & Confectionery", "Agriculture & Allied Activities"]'::jsonb,
  '{"sectors": ["Food Processing & Confectionery"]}'::jsonb
),
-- 3. UP MSME Promotion Policy Subsidy Guidelines
(
  'UP MSME Promotion Policy: Capital Subsidy & Stamp Duty Exemption for Manufacturing Units',
  'उत्तर प्रदेश एमएसएमई संवर्धन नीति: पूंजीगत सब्सिडी एवं स्टांप शुल्क छूट',
  'Directorate of Industries, Government of Uttar Pradesh',
  'https://upmsme.in/schemes/promotion-policy-2026',
  NOW() - INTERVAL '12 days',
  '2026-01-01',
  'corporate_and_msme',
  'UP',
  'UP Government announces up to 25% capital investment subsidy (max ₹4 Crore) for micro and small manufacturing units established in Purvanchal, Bundelkhand, and Madhyanchal regions, along with 100% stamp duty exemption on industrial land acquisition.',
  'उत्तर प्रदेश सरकार ने पूर्वांचल, बुंदेलखंड और मध्यांचल में स्थापित सूक्ष्म एवं लघु विनिर्माण इकाइयों के लिए 25% तक पूंजीगत सब्सिडी (अधिकतम ₹4 करोड़) और 100% स्टांप शुल्क छूट की घोषणा की है।',
  'Under the Uttar Pradesh Micro, Small and Medium Enterprises Promotion Policy, eligible units with valid Udyam registration can submit online applications on Nivesh Mitra for capital subsidy reimbursement within 6 months of commercial production commencement.',
  '["Textiles & Apparel", "Leather & Footwear", "Automotive & Engineering Components", "Chemicals & Pharmaceuticals"]'::jsonb,
  '{"jurisdiction_state": "UP", "enterprise_types": ["micro", "small"]}'::jsonb
);



-- ═════════════════════════════════════════════════════════════════════
-- MIGRATION: 00008_notices_and_ocr.sql
-- ═════════════════════════════════════════════════════════════════════

-- Saarthi Database Migration: 00008_notices_and_ocr.sql
-- Adds tables for document uploads, OCR extractions, structured notices, and WhatsApp copilot logs.

-- ─── ENUMS ───────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE notice_severity_enum AS ENUM (
    'low',
    'moderate',
    'urgent',
    'critical'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notice_status_enum AS ENUM (
    'pending_review',
    'action_required',
    'reply_drafted',
    'replied',
    'resolved'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─── DOCUMENTS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  ocr_status TEXT NOT NULL DEFAULT 'completed', -- 'pending' | 'processing' | 'completed' | 'failed'
  raw_ocr_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── COMPLIANCE_NOTICES TABLE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.compliance_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  authority TEXT NOT NULL, -- e.g. 'GST Department (DRC-01A)', 'Income Tax Department (148A)', 'FSSAI Food Safety', 'UP Labor Inspectorate'
  notice_number TEXT,
  issue_date DATE,
  response_deadline DATE NOT NULL,
  demand_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  penalty_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  severity notice_severity_enum NOT NULL DEFAULT 'moderate',
  status notice_status_enum NOT NULL DEFAULT 'action_required',
  plain_summary_en TEXT NOT NULL,
  plain_summary_hi TEXT,
  reply_draft_en TEXT,
  parsed_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── WHATSAPP_CONVERSATIONS TABLE ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  sender_phone TEXT NOT NULL,
  message_text TEXT,
  media_url TEXT,
  response_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_documents_biz ON public.documents(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_biz_deadline ON public.compliance_notices(business_id, response_deadline ASC);
CREATE INDEX IF NOT EXISTS idx_notices_severity ON public.compliance_notices(severity, status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sender ON public.whatsapp_conversations(sender_phone, created_at DESC);

-- ─── ROW LEVEL SECURITY (RLS) POLICIES ─────────────────────────

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;

-- 1. Documents Policies
CREATE POLICY "Members can view documents for their business"
  ON public.documents FOR SELECT
  USING (public.is_member_of_business(business_id));

CREATE POLICY "Members can upload documents for their business"
  ON public.documents FOR INSERT
  WITH CHECK (public.has_business_permission(business_id, 'documents.upload'));

-- 2. Compliance Notices Policies
CREATE POLICY "Members can view notices for their business"
  ON public.compliance_notices FOR SELECT
  USING (public.is_member_of_business(business_id));

CREATE POLICY "Members with manage permissions can insert notices"
  ON public.compliance_notices FOR INSERT
  WITH CHECK (public.has_business_permission(business_id, 'compliance.manage'));

CREATE POLICY "Members with manage permissions can update notices"
  ON public.compliance_notices FOR UPDATE
  USING (public.has_business_permission(business_id, 'compliance.manage'));

-- 3. WhatsApp Conversations Policies
CREATE POLICY "Members can view WhatsApp messages for their business"
  ON public.whatsapp_conversations FOR SELECT
  USING (
    business_id IS NOT NULL AND public.is_member_of_business(business_id)
  );

CREATE POLICY "System/Webhooks can insert WhatsApp messages"
  ON public.whatsapp_conversations FOR INSERT
  WITH CHECK (TRUE);



-- ═════════════════════════════════════════════════════════════════════
-- MIGRATION: 00009_schemes_and_payments.sql
-- ═════════════════════════════════════════════════════════════════════

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



-- ═════════════════════════════════════════════════════════════════════
-- MIGRATION: 00010_seed_government_schemes.sql
-- ═════════════════════════════════════════════════════════════════════

-- Saarthi Database Migration: 00010_seed_government_schemes.sql
-- Seeds Central and Uttar Pradesh State government MSME schemes and subsidies.

INSERT INTO public.government_schemes (
  code,
  title,
  title_hi,
  ministry,
  description,
  description_hi,
  eligibility_criteria,
  max_benefit_amount,
  benefit_type,
  application_url,
  jurisdiction_state,
  is_active
) VALUES
-- 1. PMEGP
(
  'CENTRAL_PMEGP',
  'Prime Minister Employment Generation Programme (PMEGP)',
  'प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)',
  'Ministry of Micro, Small and Medium Enterprises',
  'Credit-linked subsidy scheme offering up to 35% margin money subsidy on project cost for setting up new micro-enterprises in manufacturing and services sectors.',
  'विनिर्माण और सेवा क्षेत्र में नए सूक्ष्म उद्यम स्थापित करने के लिए परियोजना लागत पर 35% तक की सब्सिडी प्रदान करने वाली क्रेडिट-लिंक्ड योजना।',
  '{"enterprise_types": ["micro"], "sectors": ["Manufacturing", "Services"], "requires_udyam": true, "max_project_cost": 5000000}'::jsonb,
  1750000.00,
  'capital_subsidy',
  'https://www.kviconline.gov.in/pmegpeportal',
  NULL,
  TRUE
),
-- 2. Mudra Loan (PMMY)
(
  'CENTRAL_MUDRA',
  'Pradhan Mantri Mudra Yojana (PMMY) - Tarun Category',
  'प्रधानमंत्री मुद्रा योजना (PMMY) - तरुण श्रेणी',
  'Department of Financial Services, Ministry of Finance',
  'Collateral-free institutional credit up to ₹10 Lakhs for small business units for purchase of machinery, working capital, and business expansion.',
  'मशीनरी की खरीद, कार्यशील पूंजी और व्यापार विस्तार के लिए छोटे व्यवसायों को ₹10 लाख तक का बिना किसी गारंटी का संस्थागत ऋण।',
  '{"enterprise_types": ["micro", "small"], "requires_pan": true, "min_credit_score": 650}'::jsonb,
  1000000.00,
  'collateral_free_loan',
  'https://www.mudra.org.in',
  NULL,
  TRUE
),
-- 3. CGTMSE Credit Guarantee
(
  'CENTRAL_CGTMSE',
  'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
  'सूक्ष्म एवं लघु उद्यम क्रेडिट गारंटी फंड ट्रस्ट (CGTMSE)',
  'Ministry of MSME & SIDBI',
  'Provides 75% to 85% credit guarantee cover to scheduled commercial banks and NBFCs for collateral-free business loans up to ₹5 Crore.',
  'अनुसूचित वाणिज्यिक बैंकों और एनबीएफसी को ₹5 करोड़ तक के संपार्श्विक-मुक्त व्यापार ऋणों के लिए 75% से 85% क्रेडिट गारंटी कवर प्रदान करता है।',
  '{"enterprise_types": ["micro", "small"], "requires_udyam": true, "requires_gstin": true}'::jsonb,
  50000000.00,
  'collateral_free_loan',
  'https://www.cgtmse.in',
  NULL,
  TRUE
),
-- 4. UP MSME 25% Capital Investment Subsidy
(
  'UP_MSME_CAPITAL_SUBSIDY',
  'UP MSME Promotion Policy: Capital Investment Subsidy',
  'उत्तर प्रदेश एमएसएमई संवर्धन नीति: पूंजीगत निवेश सब्सिडी',
  'Directorate of Industries, Government of Uttar Pradesh',
  'Capital investment subsidy up to 25% (up to ₹4 Crore) on plant and machinery for micro and small manufacturing units established in Purvanchal and Bundelkhand districts.',
  'पूर्वांचल और बुंदेलखंड जिलों में स्थापित सूक्ष्म एवं लघु विनिर्माण इकाइयों के लिए संयंत्र एवं मशीनरी पर 25% (अधिकतम ₹4 करोड़) तक पूंजीगत निवेश सब्सिडी।',
  '{"jurisdiction_state": "UP", "enterprise_types": ["micro", "small"], "sectors": ["Manufacturing", "Food Processing & Confectionery", "Textiles & Apparel", "Leather & Footwear"], "requires_udyam": true}'::jsonb,
  40000000.00,
  'capital_subsidy',
  'https://upmsme.in',
  'UP',
  TRUE
),
-- 5. UP Interest Subvention Scheme
(
  'UP_INTEREST_SUBVENTION',
  'Uttar Pradesh MSME 5% Interest Subvention Scheme',
  'उत्तर प्रदेश एमएसएमई 5% ब्याज उपादान योजना',
  'MSME & Export Promotion Department, UP',
  'Provides 5% annual interest rebate on term loans taken from scheduled commercial banks for micro and small enterprises for a period of up to 5 years.',
  'सूक्ष्म और लघु उद्यमों के लिए 5 वर्षों तक की अवधि के लिए अनुसूचित वाणिज्यिक बैंकों से लिए गए सावधि ऋणों पर 5% वार्षिक ब्याज छूट प्रदान करता है।',
  '{"jurisdiction_state": "UP", "enterprise_types": ["micro", "small"], "requires_udyam": true, "requires_pan": true}'::jsonb,
  2500000.00,
  'interest_subvention',
  'https://niveshmitra.up.nic.in',
  'UP',
  TRUE
);



-- ═════════════════════════════════════════════════════════════════════
-- MIGRATION: 00011_compliance_health_score.sql
-- ═════════════════════════════════════════════════════════════════════

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



-- ═════════════════════════════════════════════════════════════════════
-- MIGRATION: 00012_supplier_marketplace.sql
-- ═════════════════════════════════════════════════════════════════════

-- Saarthi Database Migration: 00012_supplier_marketplace.sql
-- Tables for B2B Supplier Marketplace, RFQs, Quotes, and Escrow Orders with RLS.

-- ─── ENUMS ─────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.rfq_status AS ENUM ('open', 'quotes_received', 'awarded', 'closed', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.quote_status AS ENUM ('submitted', 'accepted', 'rejected', 'withdrawn');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.marketplace_escrow_status AS ENUM ('pending_deposit', 'held_in_escrow', 'released_to_supplier', 'refunded_to_buyer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ─── SUPPLIER_PRODUCTS TABLE ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.supplier_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_hi TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'packaging', 'raw_ingredients', 'machinery', 'chemicals', 'safety_gear'
  unit TEXT NOT NULL, -- 'kg', 'ton', 'box', 'piece', 'liter'
  unit_price NUMERIC(14, 2) NOT NULL,
  hsn_code TEXT,
  gst_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
  min_order_quantity INTEGER NOT NULL DEFAULT 1,
  lead_time_days INTEGER NOT NULL DEFAULT 7,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── MARKETPLACE_RFQS TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.marketplace_rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  required_quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  target_budget NUMERIC(14, 2),
  delivery_pincode TEXT NOT NULL,
  min_compliance_score INTEGER NOT NULL DEFAULT 600, -- Score gate (e.g. 700 for 30-day credit)
  status public.rfq_status NOT NULL DEFAULT 'open',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── MARKETPLACE_QUOTES TABLE ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.marketplace_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES public.marketplace_rfqs(id) ON DELETE CASCADE,
  supplier_business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  unit_price NUMERIC(14, 2) NOT NULL,
  total_amount NUMERIC(14, 2) NOT NULL,
  validity_days INTEGER NOT NULL DEFAULT 15,
  delivery_days INTEGER NOT NULL DEFAULT 7,
  notes TEXT,
  status public.quote_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── MARKETPLACE_ORDERS TABLE ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES public.marketplace_rfqs(id) ON DELETE RESTRICT,
  quote_id UUID NOT NULL REFERENCES public.marketplace_quotes(id) ON DELETE RESTRICT,
  buyer_business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  supplier_business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  amount NUMERIC(14, 2) NOT NULL,
  escrow_status public.marketplace_escrow_status NOT NULL DEFAULT 'held_in_escrow',
  payment_transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_supplier_products_cat ON public.supplier_products(category, is_active);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON public.marketplace_rfqs(status, category);
CREATE INDEX IF NOT EXISTS idx_quotes_rfq ON public.marketplace_quotes(rfq_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.marketplace_orders(buyer_business_id);
CREATE INDEX IF NOT EXISTS idx_orders_supplier ON public.marketplace_orders(supplier_business_id);

-- ─── ROW LEVEL SECURITY (RLS) POLICIES ─────────────────────────
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;

-- 1. Products: Public catalog readable by any authenticated user
CREATE POLICY "Public catalog viewable by authenticated users"
  ON public.supplier_products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Suppliers can manage own products"
  ON public.supplier_products FOR ALL
  USING (public.is_member_of_business(business_id));

-- 2. RFQs: Readable by all authenticated users
CREATE POLICY "RFQs viewable by authenticated users"
  ON public.marketplace_rfqs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Buyers can manage own RFQs"
  ON public.marketplace_rfqs FOR ALL
  USING (public.is_member_of_business(buyer_business_id));

-- 3. Quotes: Viewable by supplier who quoted or buyer of the RFQ
CREATE POLICY "Quotes viewable by buyer or quoting supplier"
  ON public.marketplace_quotes FOR SELECT
  USING (
    public.is_member_of_business(supplier_business_id) OR
    EXISTS (
      SELECT 1 FROM public.marketplace_rfqs r
      WHERE r.id = rfq_id AND public.is_member_of_business(r.buyer_business_id)
    )
  );

CREATE POLICY "Suppliers can submit quotes"
  ON public.marketplace_quotes FOR INSERT
  WITH CHECK (public.is_member_of_business(supplier_business_id));

-- 4. Orders: Viewable by buyer and supplier businesses
CREATE POLICY "Orders viewable by buyer or supplier"
  ON public.marketplace_orders FOR SELECT
  USING (
    public.is_member_of_business(buyer_business_id) OR
    public.is_member_of_business(supplier_business_id)
  );



-- ═════════════════════════════════════════════════════════════════════
-- MIGRATION: 00013_seed_supplier_catalog.sql
-- ═════════════════════════════════════════════════════════════════════

-- Saarthi Seed Migration: 00013_seed_supplier_catalog.sql
-- Seed industrial B2B products for verified UP suppliers.

DO $$
DECLARE
  v_biz_id UUID;
BEGIN
  SELECT id INTO v_biz_id FROM public.businesses LIMIT 1;

  IF v_biz_id IS NOT NULL THEN
    INSERT INTO public.supplier_products (
      business_id, title, title_hi, description, category, unit, unit_price, hsn_code, gst_rate, min_order_quantity, lead_time_days, is_active
    ) VALUES
    (
      v_biz_id,
      'Heavy Duty 5-Ply Corrugated Packaging Boxes',
      'मजबूत 5-प्लाई नालीदार पैकेजिंग बॉक्स',
      'Industrial grade 150 GSM corrugated cardboard shipping boxes for food and consumer electronics.',
      'packaging',
      'box',
      28.50,
      '48191010',
      18.00,
      500,
      5,
      true
    ),
    (
      v_biz_id,
      'Food Grade Multi-Layer Barrier Packaging Film (Roll)',
      'खाद्य ग्रेड मल्टी-लेयर पैकेजिंग फिल्म (रोल)',
      'High-barrier sealable laminate film for snacks, spices, and confectioneries. FSSAI & ISO certified.',
      'packaging',
      'kg',
      195.00,
      '39201019',
      18.00,
      100,
      7,
      true
    ),
    (
      v_biz_id,
      'Cold-Pressed Kacchi Ghani Mustard Oil Raw Base',
      'कोल्ड-प्रेस कच्ची घानी सरसों का तेल बेस',
      'Agmark certified bulk unrefined mustard oil for commercial food processing and pickling.',
      'raw_ingredients',
      'liter',
      135.00,
      '15149110',
      5.00,
      200,
      4,
      true
    ),
    (
      v_biz_id,
      'Organic Certified Sugarcane Jaggery Powder',
      'जैविक प्रमाणित गुड़ पाउडर (थोक)',
      'Pure organic sulfur-free jaggery powder processed from Muzaffarnagar sugarcane farms.',
      'raw_ingredients',
      'kg',
      52.00,
      '17011490',
      5.00,
      500,
      3,
      true
    ),
    (
      v_biz_id,
      'SS 304 Stainless Steel Industrial Mixing Tank (500L)',
      'एसएस 304 स्टेनलेस स्टील इंडस्ट्रियल मिक्सिंग टैंक (500 लीटर)',
      'Food-grade stainless steel mixing vessel with motorized agitator for dairy and liquid processing.',
      'machinery',
      'piece',
      85000.00,
      '84798200',
      18.00,
      1,
      14,
      true
    ),
    (
      v_biz_id,
      'Heavy Duty Industrial Nitrile Chemical Safety Gloves (Pack of 50)',
      'इंडस्ट्रियल नाइट्राइल केमिकल सेफ्टी ग्लव्स (50 का पैक)',
      'CE certified acid and solvent resistant safety gloves for factory shop-floor workers.',
      'safety_gear',
      'box',
      1450.00,
      '40151900',
      18.00,
      10,
      3,
      true
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;



-- ═════════════════════════════════════════════════════════════════════
-- MIGRATION: 00014_influencer_marketplace.sql
-- ═════════════════════════════════════════════════════════════════════

-- Saarthi Database Migration: 00014_influencer_marketplace.sql
-- Tables for Vernacular Creator Marketplace, Campaigns, Milestones, and ASCI Disclosures with RLS.

-- ─── ENUMS ─────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'in_progress', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.milestone_status AS ENUM ('pending_submission', 'submitted_for_review', 'approved_released', 'revision_requested');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ─── CREATOR_PROFILES TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.creator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  handle TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'youtube', -- 'youtube' | 'instagram' | 'moj' | 'josh'
  primary_language TEXT NOT NULL DEFAULT 'hi', -- 'hi' (Hindi), 'bho' (Bhojpuri), 'awa' (Awadhi), 'en'
  follower_count INTEGER NOT NULL DEFAULT 10000,
  niche TEXT NOT NULL, -- 'food_fmcg', 'agritech', 'handloom_crafts', 'manufacturing_sme', 'lifestyle'
  pan TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  bio TEXT,
  bio_hi TEXT,
  rate_card JSONB NOT NULL DEFAULT '{"reel_video": 5000, "dedicated_video": 15000}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CREATOR_CAMPAIGNS TABLE ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.creator_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget NUMERIC(14, 2) NOT NULL,
  platform TEXT NOT NULL DEFAULT 'youtube',
  target_language TEXT NOT NULL DEFAULT 'hi',
  status public.campaign_status NOT NULL DEFAULT 'active',
  escrow_status public.marketplace_escrow_status NOT NULL DEFAULT 'held_in_escrow',
  payment_transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CAMPAIGN_MILESTONES TABLE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.campaign_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.creator_campaigns(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  deliverable_type TEXT NOT NULL DEFAULT 'video_reel', -- 'video_reel' | 'dedicated_video' | 'post'
  amount NUMERIC(14, 2) NOT NULL,
  status public.milestone_status NOT NULL DEFAULT 'pending_submission',
  deliverable_url TEXT,
  asci_disclosure_verified BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  submitted_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_creators_lang_niche ON public.creator_profiles(primary_language, niche);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand ON public.creator_campaigns(brand_business_id, status);
CREATE INDEX IF NOT EXISTS idx_milestones_camp ON public.campaign_milestones(campaign_id, creator_id);

-- ─── ROW LEVEL SECURITY (RLS) POLICIES ─────────────────────────
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_milestones ENABLE ROW LEVEL SECURITY;

-- 1. Creator Profiles: Public directory readable by authenticated users
CREATE POLICY "Creator profiles viewable by authenticated users"
  ON public.creator_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Creators can manage own profile"
  ON public.creator_profiles FOR ALL
  USING (user_id = auth.uid());

-- 2. Campaigns: Viewable by brand members and collaborating creators
CREATE POLICY "Campaigns viewable by brand or creators"
  ON public.creator_campaigns FOR SELECT
  USING (
    public.is_member_of_business(brand_business_id) OR
    EXISTS (
      SELECT 1 FROM public.campaign_milestones m
      JOIN public.creator_profiles c ON c.id = m.creator_id
      WHERE m.campaign_id = public.creator_campaigns.id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Brand members can manage campaigns"
  ON public.creator_campaigns FOR ALL
  USING (public.is_member_of_business(brand_business_id));

-- 3. Milestones: Viewable by brand or creator
CREATE POLICY "Milestones viewable by brand or creator"
  ON public.campaign_milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_campaigns camp
      WHERE camp.id = campaign_id AND public.is_member_of_business(camp.brand_business_id)
    ) OR
    EXISTS (
      SELECT 1 FROM public.creator_profiles c
      WHERE c.id = creator_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Creators and brands can update milestones"
  ON public.campaign_milestones FOR ALL
  USING (true);



-- ═════════════════════════════════════════════════════════════════════
-- MIGRATION: 00015_seed_creator_profiles.sql
-- ═════════════════════════════════════════════════════════════════════

-- Saarthi Seed Migration: 00015_seed_creator_profiles.sql
-- Seed verified vernacular creators across Uttar Pradesh for MSME branding.

INSERT INTO public.creator_profiles (
  display_name, handle, platform, primary_language, follower_count, niche, pan, is_verified, bio, bio_hi, rate_card
) VALUES
(
  'Purvanchal Food & Zaika',
  '@purvanchal_zaika',
  'youtube',
  'bho',
  185000,
  'food_fmcg',
  'ABCDE1234F',
  true,
  'Exploring local street foods, spices, and packaged snacks across Varanasi, Gorakhpur & Eastern UP.',
  'वाराणसी, गोरखपुर और पूर्वांचल के प्रसिद्ध खाद्य पदार्थों, मसालों और स्नैक्स के प्रमाणित व्लॉगर।',
  '{"reel_video": 4500, "dedicated_video": 12000}'::jsonb
),
(
  'UP Kisan & Modern Agri Tech',
  '@up_kisan_tech',
  'youtube',
  'hi',
  320000,
  'agritech',
  'BCDEF2345G',
  true,
  'Demonstrating modern agricultural implements, bio-fertilizers, and food processing machinery for farmers.',
  'किसानों के लिए आधुनिक कृषि उपकरण, जैविक खाद और खाद्य प्रसंस्करण मशीनों के मार्गदर्शक।',
  '{"reel_video": 6000, "dedicated_video": 18000}'::jsonb
),
(
  'Lucknowi Chikankari & Artisans',
  '@lucknow_crafts',
  'instagram',
  'awa',
  140000,
  'handloom_crafts',
  'CDEFG3456H',
  true,
  'Promoting authentic ODOP handlooms, Zardozi crafts, and ethical artisan apparel from Lucknow and Sitapur.',
  'लखनऊ और सीतापुर के ओडीओपी (ODOP) हथकरघा, चिकनकारी और हस्तशिल्प को बढ़ावा देने वाला मंच।',
  '{"reel_video": 5000, "dedicated_video": 14000}'::jsonb
),
(
  'Desi SME & Industrial Machinery',
  '@desi_sme_factory',
  'youtube',
  'hi',
  210000,
  'manufacturing_sme',
  'DEFGH4567I',
  true,
  'Factory tours and raw material sourcing guide for small manufacturing units in Kanpur, Noida & Meerut.',
  'कानपुर, नोएडा और मेरठ के विनिर्माण कारखानों और कच्चा माल आपूर्तिकर्ताओं का व्यावहारिक विश्लेषण।',
  '{"reel_video": 7500, "dedicated_video": 20000}'::jsonb
),
(
  'Bundelkhand Dairy & Rural Organic',
  '@bundelkhand_dairy',
  'instagram',
  'hi',
  95000,
  'lifestyle',
  'EFGHI5678J',
  true,
  'Showcasing pure A2 desi ghee, organic honey, and rural dairy cooperatives from Jhansi and Lalitpur.',
  'झांसी और ललितपुर के शुद्ध देसी घी, जैविक शहद और ग्रामीण डेयरी उत्पादों का प्रामाणिक प्रचार।',
  '{"reel_video": 3500, "dedicated_video": 9000}'::jsonb
)
ON CONFLICT DO NOTHING;



-- ═════════════════════════════════════════════════════════════════════
-- MIGRATION: HOTFIX_TRIGGER_FIX.sql
-- ═════════════════════════════════════════════════════════════════════

-- =====================================================================
-- HOTFIX: Fix "Database error saving new user" on Google OAuth & Signup
-- Execute this snippet in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ijozkccvhwwzbowxremt/sql/new
-- =====================================================================

-- 1. Ensure extensions & types exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE locale_enum AS ENUM ('en', 'hi');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Ensure public.profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  locale locale_enum NOT NULL DEFAULT 'en',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_self_manage'
  ) THEN
    CREATE POLICY "profiles_self_manage" ON public.profiles
      FOR ALL
      TO authenticated
      USING ((select auth.uid()) = id)
      WITH CHECK ((select auth.uid()) = id);
  END IF;
END $$;

-- 3. Replace handle_new_user with bulletproof OAuth-compatible trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_locale locale_enum := 'en';
  v_full_name TEXT;
  v_avatar TEXT;
BEGIN
  -- Safe locale determination (Google OAuth sends 'en-US', 'en-GB', etc.)
  IF (NEW.raw_user_meta_data->>'locale') ILIKE 'hi%' THEN
    v_locale := 'hi';
  ELSE
    v_locale := 'en';
  END IF;

  -- Safe name resolution (Google OAuth sends 'name' or 'full_name')
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    ''
  );

  -- Safe avatar resolution (Google OAuth sends 'picture' or 'avatar_url')
  v_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NULL
  );

  INSERT INTO public.profiles (id, email, full_name, locale, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    v_full_name,
    v_locale,
    v_avatar
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never abort auth.users transaction; log warning and proceed safely
  RAISE WARNING 'handle_new_user trigger exception for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 4. Re-attach trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify
SELECT 'HOTFIX APPLIED SUCCESSFULLY' as status;


