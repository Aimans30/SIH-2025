// supabase.js - Supabase client configuration
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client using environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Please make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = supabase;
