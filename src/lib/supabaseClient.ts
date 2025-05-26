
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/db';

const supabaseUrl = 'https://scpnwbsynrxnqlcvwnln.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjcG53YnN5bnJ4bnFsY3Z3bmxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MzU5ODUsImV4cCI6MjA2MzQxMTk4NX0.cm06fopj1yp_M4V9K79ZUCl-sk-nHs9dGLz-r_jZ7fA';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
