import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.mjs';
import fs from 'fs';
import path from 'path';

// Read .env
const envPath = path.resolve(process.cwd(), '../../.env');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch {
  envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
}

const env = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const exactTables = [
    'profiles',
    'businesses',
    'roles',
    'permissions',
    'role_permissions',
    'business_memberships',
    'audit_logs',
    'business_verifications',
    'team_invites',
    'compliance_requirements',
    'business_compliance_instances',
    'compliance_filing_records',
    'regulatory_updates',
    'regulatory_document_chunks',
    'rag_queries',
    'documents',
    'compliance_notices',
    'whatsapp_conversations',
    'government_schemes',
    'scheme_applications',
    'payment_transactions',
    'compliance_health_scores',
    'score_consent_grants',
    'supplier_products',
    'marketplace_rfqs',
    'marketplace_quotes',
    'marketplace_orders',
    'creator_profiles',
    'creator_campaigns',
    'campaign_milestones',
  ];

  console.log('Checking tables in Supabase:');
  for (const t of exactTables) {
    const { count, error } = await adminClient.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`  [MISSING] ${t}: ${error.message}`);
    } else {
      console.log(`  [FOUND]   ${t} (rows: ${count})`);
    }
  }
}

main().catch(console.error);
