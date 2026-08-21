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
  const tables = [
    'roles',
    'permissions',
    'role_permissions',
    'compliance_requirements',
    'regulatory_updates',
    'government_schemes',
    'supplier_products',
    'creator_profiles',
    'businesses',
    'profiles',
  ];

  console.log('--- SEED DATA AUDIT ---');
  for (const t of tables) {
    const { data, count, error } = await adminClient
      .from(t)
      .select('*', { count: 'exact' });

    if (error) {
      console.log(`  ❌ ${t.padEnd(25)}: Error (${error.message})`);
    } else {
      console.log(`  ✅ ${t.padEnd(25)}: ${count} rows recorded`);
      if (data && data.length > 0) {
        console.log(`     Sample:`, JSON.stringify(data[0]).substring(0, 100) + '...');
      }
    }
  }
}

main().catch(console.error);
