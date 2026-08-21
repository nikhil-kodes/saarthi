import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.mjs';
import fs from 'fs';
import path from 'path';

// Read .env file from root
const envPath = path.resolve(process.cwd(), '../../.env');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch {
  envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
}

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Connecting to Supabase project:', url);

const adminClient = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const anonClient = createClient(url, anonKey);

async function main() {
  console.log('\n--- 1. Testing Admin Auth (List Users) ---');
  const { data: users, error: userError } = await adminClient.auth.admin.listUsers();
  if (userError) {
    console.error('Admin Auth Error:', userError);
  } else {
    console.log('Admin Auth SUCCESS! User count:', users.users.length);
  }

  console.log('\n--- 2. Testing Anon Client Auth Settings ---');
  const { data: authConfig, error: configError } = await anonClient.auth.getSession();
  console.log('Anon Client Session State:', { session: authConfig?.session, error: configError });

  console.log('\n--- 3. Testing Database Tables Availability via REST API ---');
  const tables = ['businesses', 'user_profiles', 'compliance_requirements', 'compliance_instances', 'notices'];
  for (const table of tables) {
    const { data, error } = await adminClient.from(table).select('count', { count: 'exact', head: true });
    if (error) {
      console.log(`Table '${table}': NOT FOUND or NOT ACCESSIBLE (${error.message})`);
    } else {
      console.log(`Table '${table}': READY (Row count: ${data ?? 0})`);
    }
  }
}

main().catch(console.error);
