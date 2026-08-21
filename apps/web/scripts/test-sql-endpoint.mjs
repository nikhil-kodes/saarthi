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

async function testEndpoints() {
  console.log('Testing SQL execution endpoints on:', url);

  // Endpoint 1: /pg/query (Supabase internal)
  try {
    const res = await fetch(`${url}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: 'SELECT 1 as test;' }),
    });
    console.log('/pg/query status:', res.status, await res.text());
  } catch (err) {
    console.log('/pg/query error:', err.message);
  }

  // Endpoint 2: /database/query
  try {
    const res = await fetch(`${url}/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: 'SELECT 1 as test;' }),
    });
    console.log('/database/query status:', res.status, await res.text());
  } catch (err) {
    console.log('/database/query error:', err.message);
  }

  // Endpoint 3: /v1/query
  try {
    const res = await fetch(`${url}/v1/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: 'SELECT 1 as test;' }),
    });
    console.log('/v1/query status:', res.status, await res.text());
  } catch (err) {
    console.log('/v1/query error:', err.message);
  }
}

testEndpoints();
