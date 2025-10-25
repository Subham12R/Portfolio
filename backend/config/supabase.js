const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client for public operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create Supabase client for admin operations (with service role key)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

module.exports = {
  supabase,
  supabaseAdmin
};
