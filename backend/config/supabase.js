// supabase.js - Supabase client configuration
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client using environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
// Prefer service role for server-side upload/delete if available
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || (!SUPABASE_ANON_KEY && !SUPABASE_SERVICE_ROLE_KEY)) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Please set SUPABASE_URL and one of SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in backend/.env');
  throw new Error('Missing Supabase credentials');
}

const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
if (SUPABASE_SERVICE_ROLE_KEY) {
  console.log('Supabase: using SERVICE_ROLE key for server-side operations');
} else {
  console.warn('Supabase: SERVICE_ROLE key not set; falling back to ANON key');
}

const supabase = createClient(SUPABASE_URL, key);

module.exports = supabase;
