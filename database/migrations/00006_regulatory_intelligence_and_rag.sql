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

