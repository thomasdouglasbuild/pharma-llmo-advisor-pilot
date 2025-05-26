import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import type { Company, Product } from '@/types/PharmaTypes';

export const getProducts = async (): Promise<Product[]> => {
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
        rank_2024,
        updated_at
      )
    `)
    .order('brand_name', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch products from database',
      variant: 'destructive',
    });
    throw error;
  }

  console.log('Products data result:', data);
  return data || [];
};

export const getCompanies = async (): Promise<Company[]> => {
  console.log('Fetching companies from Supabase...');
  
  const { data, error } = await supabase
    .from('company')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching companies:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch companies from database',
      variant: 'destructive',
    });
    throw error;
  }

  console.log('Companies data result:', data);
  return data || [];
};

export const getProductsByCompany = async (companyId: number): Promise<Product[]> => {
  console.log('Fetching products for company:', companyId);
  
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
        rank_2024,
        updated_at
      )
    `)
    .eq('company_id', companyId)
    .order('brand_name', { ascending: true });

  if (error) {
    console.error('Error fetching products by company:', error);
    throw error;
  }

  return data || [];
};

export const getProductById = async (productId: number): Promise<Product | null> => {
  console.log('Fetching product by ID:', productId);
  
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
        rank_2024,
        updated_at
      )
    `)
    .eq('id', productId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }

  return data;
};

export const getCompanyById = async (companyId: number): Promise<Company | null> => {
  console.log('Fetching company by ID:', companyId);
  
  const { data, error } = await supabase
    .from('company')
    .select('*')
    .eq('id', companyId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching company by ID:', error);
    throw error;
  }

  return data;
};

export const seedInitialData = async (): Promise<boolean> => {
  try {
    toast({
      title: 'Seeding Database',
      description: 'Loading initial pharmaceutical companies...',
    });

    console.log('Starting initial data seeding...');

    const { data, error } = await supabase.functions.invoke('seed-top50', {
      body: {}
    });

    console.log('Seed response:', data);

    if (error) {
      console.error('Error calling seed-top50 function:', error);
      throw error;
    }

    if (data.success) {
      toast({
        title: 'Database Seeded',
        description: `Successfully added ${data.companies_inserted} companies to the database.`,
        duration: 6000,
      });

      return true;
    } else {
      throw new Error(data.error || 'Failed to seed initial data');
    }
  } catch (error: any) {
    console.error('Error seeding initial data:', error);
    toast({
      title: 'Seeding Failed',
      description: error.message || 'Failed to seed initial data',
      variant: 'destructive',
    });
    return false;
  }
};

export const searchAndUpdatePharmaData = async (): Promise<boolean> => {
  try {
    toast({
      title: 'Updating Pharma Data',
      description: 'Searching for products using AI...',
    });

    console.log('Starting pharma data update...');

    const { data, error } = await supabase.functions.invoke('search-pharma-data', {
      body: {}
    });

    console.log('Search response:', data);

    if (error) {
      console.error('Error calling search-pharma-data function:', error);
      throw error;
    }

    if (data.success) {
      toast({
        title: 'Data Updated',
        description: `Successfully updated pharmaceutical data.`,
        duration: 6000,
      });

      return true;
    } else {
      throw new Error(data.error || 'Failed to update pharma data');
    }
  } catch (error: any) {
    console.error('Error updating pharma data:', error);
    toast({
      title: 'Update Failed',
      description: error.message || 'Failed to update pharma data',
      variant: 'destructive',
    });
    return false;
  }
};

export const ingestCsvData = async (): Promise<boolean> => {
  try {
    toast({
      title: 'Ingesting CSV Data',
      description: 'Loading companies and products from CSV...',
    });

    console.log('Starting CSV data ingestion...');

    const { data, error } = await supabase.functions.invoke('ingest-csv-data', {
      body: {}
    });

    console.log('CSV ingest response:', data);

    if (error) {
      console.error('Error calling ingest-csv-data function:', error);
      throw error;
    }

    if (data.success) {
      toast({
        title: 'CSV Data Ingested',
        description: `Successfully loaded ${data.companies_added || 0} companies and ${data.products_added || 0} products.`,
        duration: 6000,
      });

      return true;
    } else {
      throw new Error(data.error || 'Failed to ingest CSV data');
    }
  } catch (error: any) {
    console.error('Error ingesting CSV data:', error);
    toast({
      title: 'CSV Ingestion Failed',
      description: error.message || 'Failed to ingest CSV data',
      variant: 'destructive',
    });
    return false;
  }
};

export const ingestBlockbusterProducts = async (): Promise<boolean> => {
  try {
    toast({
      title: 'Ingesting Blockbuster Products',
      description: 'Loading pharmaceutical blockbusters...',
    });

    console.log('Starting blockbuster products ingestion...');

    const { data, error } = await supabase.functions.invoke('ingest-products-csv', {
      body: {}
    });

    console.log('Blockbuster ingest response:', data);

    if (error) {
      console.error('Error calling ingest-products-csv function:', error);
      throw error;
    }

    if (data.success) {
      toast({
        title: 'Blockbuster Products Ingested',
        description: `Successfully processed ${data.total_processed || 0} products.`,
        duration: 6000,
      });

      return true;
    } else {
      throw new Error(data.error || 'Failed to ingest blockbuster products');
    }
  } catch (error: any) {
    console.error('Error ingesting blockbuster products:', error);
    toast({
      title: 'Ingestion Failed',
      description: error.message || 'Failed to ingest blockbuster products',
      variant: 'destructive',
    });
    return false;
  }
};

export const triggerIngestTop100 = async (): Promise<boolean> => {
  try {
    console.log('Triggering top 100 companies ingestion...');

    const { data, error } = await supabase.functions.invoke('seed-top50', {
      body: {}
    });

    console.log('Top 100 ingest response:', data);

    if (error) {
      console.error('Error calling seed-top50 function:', error);
      throw error;
    }

    if (data.success) {
      toast({
        title: 'Top Companies Ingested',
        description: `Successfully processed ${data.companies_inserted} companies`,
        duration: 6000,
      });
      return true;
    } else {
      throw new Error(data.error || 'Failed to ingest top companies');
    }
  } catch (error: any) {
    console.error('Error ingesting top companies:', error);
    toast({
      title: 'Ingestion Failed',
      description: error.message || 'Failed to ingest top companies',
      variant: 'destructive',
    });
    return false;
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

export const triggerRebuildCompetitors = async (): Promise<boolean> => {
  try {
    console.log('Triggering competitor rebuild...');

    const { data, error } = await supabase.functions.invoke('identify-competitors', {
      body: {}
    });

    console.log('Competitor rebuild response:', data);

    if (error) {
      console.error('Error calling identify-competitors function:', error);
      throw error;
    }

    if (data.success) {
      toast({
        title: 'Competitors Rebuilt',
        description: `Successfully rebuilt competitor relationships`,
        duration: 6000,
      });
      return true;
    } else {
      throw new Error(data.error || 'Failed to rebuild competitors');
    }
  } catch (error: any) {
    console.error('Error rebuilding competitors:', error);
    toast({
      title: 'Rebuild Failed',
      description: error.message || 'Failed to rebuild competitor data',
      variant: 'destructive',
    });
    return false;
  }
};
