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
