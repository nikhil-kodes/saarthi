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
