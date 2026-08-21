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
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('====================================================');
console.log('    SAARTHI SUPABASE FULL AUDIT & VERIFICATION     ');
console.log('====================================================');
console.log('Supabase Endpoint:', url);

const adminClient = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anonClient = createClient(url, anonKey);

async function checkDatabase() {
  console.log('\n--- 1. AUDITING ALL TABLES & RECORD COUNTS ---');

  const allTables = [
    // 00001 & 00002
    'businesses',
    'user_profiles',
    'user_roles',
    'roles',
    'permissions',
    'role_permissions',
    'audit_logs',
    // 00003
    'business_verifications',
    'team_invites',
    // 00004 & 00005
    'compliance_categories',
    'compliance_requirements',
    'compliance_instances',
    'compliance_evidence',
    // 00006 & 00007
    'regulatory_updates',
    'regulatory_documents',
    'regulatory_chunks',
    // 00008
    'notices',
    'notice_timeline',
    'notice_replies',
    // 00009 & 00010
    'government_schemes',
    'business_scheme_matches',
    'payment_orders',
    'payment_transactions',
    'escrow_accounts',
    'escrow_milestones',
    // 00011
    'health_scores',
    'health_score_history',
    'health_score_shares',
    // 00012 & 00013
    'supplier_profiles',
    'supplier_products',
    'rfqs',
    'quotes',
    'orders',
    // 00014 & 00015
    'creator_profiles',
    'creator_campaigns',
    'campaign_milestones',
  ];

  const results = { ready: [], missing: [], seeded: [] };

  for (const table of allTables) {
    const { count, data, error } = await adminClient
      .from(table)
      .select('*', { count: 'exact', head: false })
      .limit(3);

    if (error) {
      results.missing.push({ table, error: error.message });
      console.log(`  ❌ [MISSING/ERROR] ${table}: ${error.message}`);
    } else {
      results.ready.push({ table, count });
      if (count > 0) {
        results.seeded.push({ table, count });
      }
      console.log(`  ✅ [READY] ${table.padEnd(26)} => ${count} rows`);
    }
  }

  console.log(`\nTable Audit Summary: ${results.ready.length}/${allTables.length} tables active. Seeded tables: ${results.seeded.length}.`);
  return results;
}

async function checkAuth() {
  console.log('\n--- 2. VERIFYING SUPABASE AUTHENTICATION ---');

  // 1. Admin Auth API
  const { data: usersData, error: usersErr } = await adminClient.auth.admin.listUsers();
  if (usersErr) {
    console.error('  ❌ Admin Auth Failed:', usersErr.message);
  } else {
    console.log(`  ✅ Admin Auth API: Operational (${usersData.users.length} registered users)`);
  }

  // 2. Google OAuth Configuration Check
  console.log('\n--- 3. VERIFYING GOOGLE OAUTH URL GENERATION ---');
  const redirectUrl = `${env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`;
  const { data: oauthData, error: oauthErr } = await anonClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (oauthErr) {
    console.error('  ❌ Google OAuth Initialization Error:', oauthErr.message);
  } else if (oauthData?.url) {
    console.log('  ✅ Google OAuth Flow Initialized Successfully:');
    console.log('     Provider:', oauthData.provider);
    console.log('     OAuth URL:', oauthData.url);
    console.log('     Redirect URI configured:', redirectUrl);
  }

  // 3. Test Email/Password Auth Cycle
  console.log('\n--- 4. TESTING AUTH SIGNUP / SIGNIN CYCLE ---');
  const testEmail = `audit_test_${Date.now()}@saarthi-audit.internal`;
  const testPassword = 'TestPassword123!Secure';

  const { data: signUpData, error: signUpErr } = await adminClient.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Saarthi Verification Agent' },
  });

  if (signUpErr) {
    console.error('  ❌ Test User Creation Failed:', signUpErr.message);
  } else {
    console.log('  ✅ Test User Created via Admin API (ID:', signUpData.user.id, ')');

    // Test sign in with anon client
    const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInErr) {
      console.error('  ❌ User Password Sign In Failed:', signInErr.message);
    } else {
      console.log('  ✅ User Password Sign In SUCCESS! Token issued.');
      console.log('     Session User ID:', signInData.user.id);
      console.log('     Access Token Type:', signInData.session.token_type);
      console.log('     Expires At:', new Date(signInData.session.expires_at * 1000).toISOString());
    }

    // Clean up test user
    await adminClient.auth.admin.deleteUser(signUpData.user.id);
    console.log('  🧹 Cleaned up temporary verification user.');
  }
}

async function run() {
  const dbResults = await checkDatabase();
  await checkAuth();
  console.log('\n====================================================');
  console.log('      SAARTHI SUPABASE VERIFICATION COMPLETE        ');
  console.log('====================================================\n');
}

run().catch(console.error);
