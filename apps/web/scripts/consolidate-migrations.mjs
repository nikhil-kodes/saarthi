import fs from 'fs';
import path from 'path';

const migrationsDir = path.resolve(process.cwd(), 'database/migrations');
const files = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql') && f !== 'ALL_MIGRATIONS.sql')
  .sort();

console.log(`Found ${files.length} migration files to consolidate:`);
files.forEach(f => console.log('  -', f));

let combined = `-- =====================================================================
-- SAARTHI COMPLETE DATABASE SCHEMA & SEED DATA MIGRATION
-- Project: https://ijozkccvhwwzbowxremt.supabase.co
-- Generated: ${new Date().toISOString()}
-- Contains all 15 migrations in exact chronological dependency order.
-- =====================================================================

`;

files.forEach(f => {
  const content = fs.readFileSync(path.join(migrationsDir, f), 'utf8');
  combined += `\n-- ═════════════════════════════════════════════════════════════════════\n`;
  combined += `-- MIGRATION: ${f}\n`;
  combined += `-- ═════════════════════════════════════════════════════════════════════\n\n`;
  combined += content;
  combined += `\n\n`;
});

const outputPath = path.join(migrationsDir, 'ALL_MIGRATIONS.sql');
fs.writeFileSync(outputPath, combined, 'utf8');
console.log(`\nSuccessfully wrote ${combined.length} bytes to: ${outputPath}`);
