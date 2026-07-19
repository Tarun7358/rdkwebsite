// Run once: node seed-demo-accounts.mjs
// Creates 4 demo users in Supabase Auth + sets their roles in the profiles table

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load .env manually
const env = Object.fromEntries(
  readFileSync('.env', 'utf-8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.trim().split('=').map(p => p.trim()))
);

const supabaseUrl  = env.SUPABASE_URL;
const serviceKey   = env.SUPABASE_SERVICE_ROLE_KEY;   // needs service_role for admin ops

if (!supabaseUrl || !serviceKey) {
  console.error('❌  Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEMO_PASS = 'rdk@demo2026';

const demoUsers = [
  { email: 'client@rdk.com',     name: 'Demo Client',     role: 'client'     },
  { email: 'employee@rdk.com',   name: 'Demo Employee',   role: 'employee'   },
  { email: 'freelancer@rdk.com', name: 'Demo Freelancer', role: 'freelancer' },
  { email: 'admin@rdk.com',      name: 'Demo Admin',      role: 'admin'      },
];

for (const u of demoUsers) {
  console.log(`Creating ${u.role} → ${u.email} …`);

  // 1. Create Supabase Auth user (idempotent via listUsers check)
  const { data: list } = await supabase.auth.admin.listUsers();
  const exists = list?.users?.find(x => x.email === u.email);

  let userId;
  if (exists) {
    console.log(`  ↳ Already exists (${exists.id}), skipping auth creation`);
    userId = exists.id;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: DEMO_PASS,
      email_confirm: true,
      user_metadata: { full_name: u.name },
    });
    if (error) { console.error(`  ✗ Auth error: ${error.message}`); continue; }
    userId = data.user.id;
    console.log(`  ✓ Auth user created (${userId})`);
  }

  // 2. Upsert profile row
  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: userId,
    email: u.email,
    name: u.name,
    role: u.role,
    details: `${u.name} — demo account`,
  });
  if (profileErr) {
    console.error(`  ✗ Profile error: ${profileErr.message}`);
  } else {
    console.log(`  ✓ Profile upserted with role=${u.role}`);
  }
}

console.log('\n✅ Done! Demo accounts ready.\n');
console.log('  client@rdk.com     / rdk@demo2026  → Client portal');
console.log('  employee@rdk.com   / rdk@demo2026  → Employee console');
console.log('  freelancer@rdk.com / rdk@demo2026  → Freelancer portal');
console.log('  admin@rdk.com      / rdk@demo2026  → Admin panel');
