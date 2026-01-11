// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseUrl = "https://bytahasdffzxoobewnbq.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5dGFzaWRmZnZ6eG9ib2V3bmJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzY2NjY2NjcsImV4cCI6MTk5MjY0MjY2N30.0W0W0W0W0W0W0W0W0W0W0W0W0W0W0W0W0W0W0W0W"

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;