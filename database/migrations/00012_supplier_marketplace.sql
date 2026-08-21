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
