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
