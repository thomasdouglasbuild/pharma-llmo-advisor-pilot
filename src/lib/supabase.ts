
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// For development and testing, we'll provide fallback values
// In production, these should be set as environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create a dummy client for development purposes if real credentials are missing
const isUsingDummyClient = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

if (isUsingDummyClient) {
  console.warn(
    'Using a dummy Supabase client with mock data. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables for real data.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Mock data response function to use when no real credentials are available
export const getMockResponse = <T>(mockData: T): Promise<{ data: T; error: null }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ data: mockData, error: null });
    }, 500);
  });
};

// Helper function that returns either a real Supabase query or mock data
export const safeSupabaseQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
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
