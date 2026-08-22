-- Migration 00016: Personal Details, Business Documents, Chat & Memory
-- Extends profiles with personal fields, adds document management and AI memory tables

-- ============================================================================
-- 1. Extend profiles with personal details
-- ============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'UP',
  ADD COLUMN IF NOT EXISTS aadhaar_last_four TEXT;

-- ============================================================================
-- 2. Business Documents (uploaded to R2, referenced in DB)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.business_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL, -- 'gst_certificate', 'udyam_certificate', 'pan_card', 'incorporation_doc', 'fssai_license', 'rent_agreement', 'electricity_bill', 'other'
  file_name TEXT NOT NULL,
  file_key TEXT NOT NULL, -- R2 object key
  file_url TEXT NOT NULL, -- public or presigned URL
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  ocr_text TEXT, -- extracted text from document
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.business_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view business documents"
  ON public.business_documents FOR SELECT
  USING (public.is_member_of_business(business_id));
CREATE POLICY "Members can upload business documents"
  ON public.business_documents FOR INSERT
  WITH CHECK (public.is_member_of_business(business_id));

-- ============================================================================
-- 3. Document Vector Chunks (for user-uploaded docs in pgvector)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.business_documents(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  chunk_text TEXT NOT NULL,
  embedding vector(384),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vector similarity search for user documents
CREATE OR REPLACE FUNCTION public.match_document_chunks(
  p_business_id UUID,
  query_embedding vector(384),
  match_threshold float DEFAULT 0.4,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_text TEXT,
  similarity float,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.document_id,
    c.chunk_text,
    (1 - (c.embedding <=> query_embedding))::float AS similarity,
    c.metadata
  FROM public.document_chunks c
  WHERE c.business_id = p_business_id
    AND c.embedding IS NOT NULL
    AND (1 - (c.embedding <=> query_embedding)) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- 4. Chat Conversations (per-customer persistent threads)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  message_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own conversations"
  ON public.chat_conversations FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can create own conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. Chat Messages (individual messages with role)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb, -- RAG citation sources
  confidence_score NUMERIC(4, 3),
  latency_ms INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in own conversations"
  ON public.chat_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert messages in own conversations"
  ON public.chat_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
  ));

-- ============================================================================
-- 6. Customer Memory Chunks (vectorized per-customer context)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.customer_memory_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL DEFAULT 'conversation', -- 'conversation', 'document', 'filing', 'notice', 'profile'
  content TEXT NOT NULL,
  embedding vector(384),
  source_id TEXT, -- reference to the source record (conversation_id, document_id, etc.)
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vector similarity search for customer memory
CREATE OR REPLACE FUNCTION public.match_customer_memory(
  p_user_id UUID,
  p_business_id UUID,
  query_embedding vector(384),
  match_threshold float DEFAULT 0.35,
  match_count int DEFAULT 8
)
RETURNS TABLE (
  id UUID,
  memory_type TEXT,
  content TEXT,
  similarity float,
  metadata JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.memory_type,
    m.content,
    (1 - (m.embedding <=> query_embedding))::float AS similarity,
    m.metadata,
    m.created_at
  FROM public.customer_memory_chunks m
  WHERE m.user_id = p_user_id
    AND m.business_id = p_business_id
    AND m.embedding IS NOT NULL
    AND (1 - (m.embedding <=> query_embedding)) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- 7. Payment Claims (MSMED Act delayed payment tracking)
-- ============================================================================
CREATE TYPE public.payment_claim_status AS ENUM (
  'pending', 'acknowledged', 'partially_paid', 'paid', 'disputed', 'escalated_samadhan'
);

CREATE TABLE IF NOT EXISTS public.payment_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_gstin TEXT,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  invoice_amount NUMERIC(15, 2) NOT NULL,
  due_date DATE NOT NULL,
  payment_received_date DATE,
  amount_received NUMERIC(15, 2) DEFAULT 0.00,
  delay_days INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN payment_received_date IS NOT NULL THEN
        GREATEST(0, payment_received_date - due_date)
      ELSE
        GREATEST(0, CURRENT_DATE - due_date)
    END
  ) STORED,
  interest_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00, -- 3x RBI bank rate
  interest_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  status public.payment_claim_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payment_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view payment claims"
  ON public.payment_claims FOR SELECT
  USING (public.is_member_of_business(business_id));
CREATE POLICY "Members can manage payment claims"
  ON public.payment_claims FOR INSERT
  WITH CHECK (public.is_member_of_business(business_id));

-- ============================================================================
-- 8. License Tracking (extended compliance statuses)
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'license_status_enum') THEN
    CREATE TYPE public.license_status_enum AS ENUM (
      'not_applied', 'applied', 'approved', 'renewal_due', 'expired', 'not_required'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.business_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES public.compliance_requirements(id) ON DELETE RESTRICT,
  license_number TEXT,
  status public.license_status_enum NOT NULL DEFAULT 'not_applied',
  issued_date DATE,
  expiry_date DATE,
  applied_date DATE,
  portal_url TEXT, -- NSWS or specific portal URL
  application_ref TEXT, -- application reference number
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, requirement_id)
);

ALTER TABLE public.business_licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view business licenses"
  ON public.business_licenses FOR SELECT
  USING (public.is_member_of_business(business_id));
CREATE POLICY "Members can manage business licenses"
  ON public.business_licenses FOR INSERT
  WITH CHECK (public.is_member_of_business(business_id));
CREATE POLICY "Members can update business licenses"
  ON public.business_licenses FOR UPDATE
  USING (public.is_member_of_business(business_id));

-- ============================================================================
-- 9. Update score constraint to 0-900
-- ============================================================================
ALTER TABLE public.compliance_health_scores
  DROP CONSTRAINT IF EXISTS compliance_health_scores_score_check;
ALTER TABLE public.compliance_health_scores
  ADD CONSTRAINT compliance_health_scores_score_check CHECK (score >= 0 AND score <= 900);
