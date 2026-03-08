const { createClient } = require('@supabase/supabase-js');

// In Vercel, env vars are injected directly - dotenv not needed
// Only use dotenv for local development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use SERVICE_ROLE_KEY for backend

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ Missing Supabase environment variables!');
  console.error('SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓ Set' : '✗ Missing');
  // Don't throw in production - let the server start and show the error in health check
}

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

module.exports = supabase;
