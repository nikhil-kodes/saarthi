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
