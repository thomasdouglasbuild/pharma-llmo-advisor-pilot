
import { supabase } from '@/lib/supabaseClient';
import type { Company, Product, Competitor, LlmRun } from '@/types/PharmaTypes';
import { toast } from '@/hooks/use-toast';

// Company Services
export const getCompanies = async (): Promise<Company[]> => {
  console.log('Fetching companies from Supabase...');
  const { data, error } = await supabase
    .from('company')
    .select('*')
    .order('rank_2024', { ascending: true, nullsFirst: false });
  
  if (error) {
    console.error('[Supabase] Error fetching companies:', error);
    throw error;
  }
  
  console.log('Companies data result:', data);
  return data || [];
};

export const getCompanyById = async (id: number): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('company')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('[Supabase] Error fetching company by id:', error);
    throw error;
  }
  return data;
};

// Product Services
export const getProducts = async (): Promise<Product[]> => {
  console.log('Fetching products from Supabase...');
  const { data, error } = await supabase
    .from('product')
    .select('*, company(*)')
    .order('brand_name', { ascending: true, nullsFirst: false });
  
  if (error) {
    console.error('[Supabase] Error fetching products:', error);
    throw error;
  }
  
  console.log('Products data result:', data);
  return data || [];
};

export const getProductsByCompany = async (companyId: number): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('product')
    .select('*, company(*)')
    .eq('company_id', companyId)
    .order('brand_name', { ascending: true, nullsFirst: false });
  
  if (error) {
    console.error('[Supabase] Error fetching products by company:', error);
    throw error;
  }
  return data || [];
};

export const getProductById = async (id: number): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('product')
    .select('*, company(*)')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('[Supabase] Error fetching product by id:', error);
    throw error;
  }
  return data;
};

// Competitor Services
export const getCompetitors = async (productId: number): Promise<Competitor[]> => {
  const { data, error } = await supabase
    .from('competitor')
    .select('*, product_a_data:product!product_a(*, company(*)), product_b_data:product!product_b(*, company(*))')
    .or(`product_a.eq.${productId},product_b.eq.${productId}`);
  
  if (error) {
    console.error('[Supabase] Error fetching competitors:', error);
    throw error;
  }
  return data || [];
};

// LLM Run Services
export const getLlmRuns = async (productId?: number): Promise<LlmRun[]> => {
  let query = supabase.from('llm_run').select('*, product(*, company(*))');
  if (productId) {
    query = query.eq('product_id', productId);
  }
  const { data, error } = await query;
  
  if (error) {
    console.error('[Supabase] Error fetching LLM runs:', error);
    throw error;
  }
  return data || [];
};

// Data ingestion functions for the dashboard
export const triggerIngestTop100 = async (): Promise<boolean> => {
  try {
    toast({
      title: 'Ingesting Top 100',
      description: 'Fetching top pharmaceutical companies...',
    });

    const { data, error } = await supabase.functions.invoke('seed-top50', {
      body: {}
    });

    if (error) {
      console.error('Error calling seed-top50 function:', error);
      throw error;
    }

    if (data.success) {
      toast({
        title: 'Ingest Complete',
        description: `Successfully ingested ${data.companies} companies`,
      });
      return true;
    } else {
      throw new Error(data.error || 'Failed to ingest companies');
    }
  } catch (error: any) {
    console.error('Error ingesting top 100:', error);
    toast({
      title: 'Ingest Failed',
      description: error.message || 'Failed to ingest companies',
      variant: 'destructive',
    });
    return false;
  }
};

export const triggerIngestProducts = async (): Promise<boolean> => {
  try {
    toast({
      title: 'Ingesting Products',
      description: 'Fetching product catalogues...',
    });

    const { data, error } = await supabase.functions.invoke('search-pharma-data', {
      body: { type: 'products' }
    });

    if (error) {
      console.error('Error calling search-pharma-data function:', error);
      throw error;
    }

    if (data.success) {
      toast({
        title: 'Products Ingested',
        description: `Successfully processed ${data.products_updated} products`,
      });
      return true;
    } else {
      throw new Error(data.error || 'Failed to ingest products');
    }
  } catch (error: any) {
    console.error('Error ingesting products:', error);
    toast({
      title: 'Product Ingest Failed',
      description: error.message || 'Failed to ingest products',
      variant: 'destructive',
    });
    return false;
  }
};

export const triggerRebuildCompetitors = async (): Promise<boolean> => {
  try {
    toast({
      title: 'Rebuilding Competitors',
      description: 'Analyzing therapeutic areas and building competitor graph...',
    });

    const { data, error } = await supabase.functions.invoke('identify-competitors', {
      body: {}
    });

    if (error) {
      console.error('Error calling identify-competitors function:', error);
      throw error;
    }

    if (data.success) {
      toast({
        title: 'Competitor Graph Rebuilt',
        description: `Identified ${data.competitor_pairs} competitor relationships`,
      });
      return true;
    } else {
      throw new Error(data.error || 'Failed to rebuild competitors');
    }
  } catch (error: any) {
    console.error('Error rebuilding competitors:', error);
    toast({
      title: 'Rebuild Failed',
      description: error.message || 'Failed to rebuild competitor graph',
      variant: 'destructive',
    });
    return false;
  }
};

// Search and update pharmaceutical data using ChatGPT
export const searchAndUpdatePharmaData = async (): Promise<boolean> => {
  try {
    console.log('Starting pharmaceutical data update with ChatGPT...');
    
    toast({
      title: 'Updating Data',
      description: 'Searching for latest pharmaceutical company and product data...',
    });

    const { data, error } = await supabase.functions.invoke('search-pharma-data', {
      body: {}
    });

    if (error) {
      console.error('Error calling search-pharma-data function:', error);
      throw error;
    }

    console.log('Search pharma data response:', data);

    if (data.success) {
      toast({
        title: 'Data Updated Successfully',
        description: `Updated ${data.companies_updated} companies and ${data.products_updated} products`,
      });
      return true;
    } else {
      throw new Error(data.error || 'Unknown error occurred');
    }
  } catch (error: any) {
    console.error('Error updating pharma data:', error);
    toast({
      title: 'Error updating data',
      description: error.message || 'Failed to update pharmaceutical data',
      variant: 'destructive',
    });
    return false;
  }
};

// Seed initial data
export const seedInitialData = async (): Promise<boolean> => {
  try {
    toast({
      title: 'Seeding Data',
      description: 'Populating database with initial pharmaceutical data...',
    });

    const { data, error } = await supabase.functions.invoke('seed-top50', {
      body: {}
    });

    if (error) {
      console.error('Error calling seed-top50 function:', error);
      throw error;
    }

    if (data.success) {
      toast({
        title: 'Data Seeded Successfully',
        description: `Added ${data.companies} companies and ${data.products} products`,
      });
      return true;
    } else {
      throw new Error(data.error || 'Failed to seed data');
    }
  } catch (error: any) {
    console.error('Error seeding data:', error);
    toast({
      title: 'Error seeding data',
      description: error.message || 'Failed to seed initial data',
      variant: 'destructive',
    });
    return false;
  }
};
