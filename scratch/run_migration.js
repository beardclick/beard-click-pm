const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually parse .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.join('=').trim().replace(/^"|"$/g, '');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const sql = fs.readFileSync(path.join(process.cwd(), 'supabase/migration_notifications_activity_fix.sql'), 'utf8');

async function run() {
  console.log('Running migration...');
  
  // We try to run the SQL via a RPC call 'exec_sql' if it exists, 
  // but most Supabase projects don't have it by default.
  // Instead, we can try to use the REST API to check if it works or just inform the user.
  
  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  
  if (error) {
    console.error('Error running migration via RPC:', error);
    console.log('\nPlease run the SQL manually in the Supabase SQL Editor if the RPC failed.');
  } else {
    console.log('Migration successful!', data);
  }
}

run();
