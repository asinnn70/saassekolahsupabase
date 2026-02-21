import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'student';

export interface Profile {
  id: string;
  tenant_id: string | null;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  logo_url: string | null;
}
