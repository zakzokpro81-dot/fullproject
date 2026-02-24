import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Make sure VITE_APP_SUPABASE_URL and VITE_APP_SUPABASE_KEY are set in your .env file.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;