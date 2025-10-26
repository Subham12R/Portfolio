const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Warn if using placeholder values
if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder_key') {
  console.warn('⚠️  Using placeholder Supabase credentials. Please set up your .env file with real Supabase values.');
  console.warn('   Create a .env file in the backend directory with:');
  console.warn('   SUPABASE_URL=your_supabase_project_url');
  console.warn('   SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.warn('   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key');
}

// Create Supabase client for public operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create Supabase client for admin operations (with service role key)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

module.exports = {
  supabase,
  supabaseAdmin
};
