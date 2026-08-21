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
