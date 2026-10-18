import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
    // Return mock-friendly client placeholder or null when running in local offline demo mode
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
