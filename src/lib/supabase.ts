
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// For development and testing, we'll provide fallback values
// In production, these should be set as environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we have valid credentials
export const isUsingDummyClient = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a supabase client - it will be a dummy client if credentials are missing
export const supabase = isUsingDummyClient 
  ? {} as ReturnType<typeof createClient<Database>> // Type cast for TypeScript
  : createClient<Database>(supabaseUrl, supabaseAnonKey);

if (isUsingDummyClient) {
  console.warn(
    'Using a dummy Supabase client with mock data. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables for real data.'
  );
}

// Mock data response function to use when no real credentials are available
export const getMockResponse = <T>(mockData: T): Promise<{ data: T; error: null }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ data: mockData, error: null });
    }, 500);
  });
};

// Helper function that returns either real data or mock data
export const safeSupabaseQuery = async <T>(
  queryFn: () => any, // Changed to 'any' to accommodate Supabase's return types
  mockData: T
): Promise<T> => {
  if (isUsingDummyClient) {
    const { data } = await getMockResponse(mockData);
    return data;
  }
  
  try {
    const { data, error } = await queryFn();
    if (error) throw error;
    return data as T;
  } catch (error) {
    console.error('Supabase query error:', error);
    return mockData;
  }
};
