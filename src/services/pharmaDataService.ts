
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

export interface Company {
  id: number;
  name: string;
  ticker?: string;
  hq_country?: string;
  sales_2024_bn?: number;
  rank_2024?: number;
}

export interface Product {
  id: number;
  brand_name: string;
  inn?: string;
  indication?: string;
  atc_level3?: string;
  status?: string;
  approval_region?: string;
  first_approval?: string;
  company_id?: number;
  company?: Company;
}

export const getProducts = async (): Promise<Product[]> => {
  try {
    console.log('Fetching products from Supabase...');
    
    const { data, error } = await supabase
      .from('product')
      .select(`
        *,
        company (
          id,
          name,
          ticker,
          hq_country,
          sales_2024_bn,
          rank_2024
        )
      `)
      .order('brand_name', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    console.log('Products data result:', data);
    return data || [];
  } catch (error) {
    console.error('Error in getProducts:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch products from database',
      variant: 'destructive',
    });
    return [];
  }
};

export const getCompanies = async (): Promise<Company[]> => {
  try {
    console.log('Fetching companies from Supabase...');
    
    const { data, error } = await supabase
      .from('company')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }

    console.log('Companies data result:', data);
    return data || [];
  } catch (error) {
    console.error('Error in getCompanies:', error);
    return [];
  }
};

export const triggerIngestProducts = async (): Promise<boolean> => {
  try {
    console.log('Triggering product ingestion...');

    const { data, error } = await supabase.functions.invoke('ingest-products-csv', {
      body: {}
    });

    console.log('Ingest response:', data);

    if (error) {
      console.error('Error calling ingest function:', error);
      throw error;
    }

    if (data.success) {
      toast({
        title: 'Data Ingestion Complete',
        description: `Successfully processed ${data.total_processed} products`,
        duration: 6000,
      });
      return true;
    } else {
      throw new Error(data.error || 'Failed to ingest products');
    }
  } catch (error: any) {
    console.error('Error ingesting products:', error);
    toast({
      title: 'Ingestion Failed',
      description: error.message || 'Failed to ingest product data',
      variant: 'destructive',
    });
    return false;
  }
};
