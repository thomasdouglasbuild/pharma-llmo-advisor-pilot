
import { supabase } from '@/integrations/supabase/client';
import type { Company, Product, Competitor, LlmRun } from '@/types/PharmaTypes';
import { toast } from '@/hooks/use-toast';

// Mock data for development fallback
const mockCompanies: Company[] = [
  { id: 1, name: 'Pfizer', rank_2024: 1, hq_country: 'USA', sales_2024_bn: 88.2, ticker: 'PFE', updated_at: new Date().toISOString() },
  { id: 2, name: 'Johnson & Johnson', rank_2024: 2, hq_country: 'USA', sales_2024_bn: 82.1, ticker: 'JNJ', updated_at: new Date().toISOString() },
  { id: 3, name: 'Roche', rank_2024: 3, hq_country: 'Switzerland', sales_2024_bn: 68.7, ticker: 'RHHBY', updated_at: new Date().toISOString() },
  { id: 4, name: 'Novartis', rank_2024: 4, hq_country: 'Switzerland', sales_2024_bn: 52.5, ticker: 'NVS', updated_at: new Date().toISOString() },
  { id: 5, name: 'Merck & Co', rank_2024: 5, hq_country: 'USA', sales_2024_bn: 59.8, ticker: 'MRK', updated_at: new Date().toISOString() },
];

const mockProducts: Product[] = [
  { id: 1, brand_name: 'Lipitor', inn: 'atorvastatin', company_id: 1, company: mockCompanies[0], atc_level3: 'C10A', indication: 'Hypercholesterolemia', approval_region: 'Global', first_approval: '1996-12-17', status: 'Approved', updated_at: new Date().toISOString() },
  { id: 2, brand_name: 'Crestor', inn: 'rosuvastatin', company_id: 3, company: mockCompanies[2], atc_level3: 'C10A', indication: 'Hypercholesterolemia', approval_region: 'Global', first_approval: '2003-08-12', status: 'Approved', updated_at: new Date().toISOString() },
  { id: 3, brand_name: 'Zocor', inn: 'simvastatin', company_id: 5, company: mockCompanies[4], atc_level3: 'C10A', indication: 'Hypercholesterolemia', approval_region: 'Global', first_approval: '1991-12-23', status: 'Approved', updated_at: new Date().toISOString() },
  { id: 4, brand_name: 'Humira', inn: 'adalimumab', company_id: 2, company: mockCompanies[1], atc_level3: 'L04A', indication: 'Rheumatoid arthritis', approval_region: 'Global', first_approval: '2002-12-31', status: 'Approved', updated_at: new Date().toISOString() },
  { id: 5, brand_name: 'Keytruda', inn: 'pembrolizumab', company_id: 5, company: mockCompanies[4], atc_level3: 'L01X', indication: 'Melanoma', approval_region: 'Global', first_approval: '2014-09-04', status: 'Approved', updated_at: new Date().toISOString() },
];

// Company Services
export const getCompanies = async (): Promise<Company[]> => {
  try {
    console.log('Fetching companies from Supabase...');
    const { data, error } = await supabase
      .from('company')
      .select('*')
      .order('rank_2024', { ascending: true });
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Companies data from Supabase:', data);
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Error fetching companies, falling back to mock data:', error);
    toast({
      title: 'Using mock data',
      description: 'Could not connect to database, using sample data',
      variant: 'default',
    });
    return mockCompanies;
  }
};

export const getCompanyById = async (id: number): Promise<Company | null> => {
  try {
    const { data, error } = await supabase
      .from('company')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching company:', error);
    return mockCompanies.find(c => c.id === id) || null;
  }
};

// Product Services
export const getProducts = async (): Promise<Product[]> => {
  try {
    console.log('Fetching products from Supabase...');
    const { data, error } = await supabase
      .from('product')
      .select('*, company(*)');
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Products data from Supabase:', data);
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Error fetching products, falling back to mock data:', error);
    toast({
      title: 'Using mock data',
      description: 'Could not connect to database, using sample data',
      variant: 'default',
    });
    return mockProducts;
  }
};

export const getProductsByCompany = async (companyId: number): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('product')
      .select('*, company(*)')
      .eq('company_id', companyId);
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return mockProducts.filter(p => p.company_id === companyId);
  }
};

export const getProductById = async (id: number): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('product')
      .select('*, company(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return mockProducts.find(p => p.id === id) || null;
  }
};

// Competitor Services
export const getCompetitors = async (productId: number): Promise<Competitor[]> => {
  try {
    const { data, error } = await supabase
      .from('competitor')
      .select('*, product_a_data:product!product_a(*, company(*)), product_b_data:product!product_b(*, company(*))')
      .or(`product_a.eq.${productId},product_b.eq.${productId}`);
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Error fetching competitors:', error);
    return [];
  }
};

// LLM Run Services
export const getLlmRuns = async (productId?: number): Promise<LlmRun[]> => {
  try {
    let query = supabase.from('llm_run').select('*, product(*, company(*))');
    if (productId) {
      query = query.eq('product_id', productId);
    }
    const { data, error } = await query;
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Error fetching LLM runs:', error);
    return [];
  }
};

// Trigger edge functions manually
export const triggerIngestTop100 = async () => {
  try {
    toast({
      title: 'Info',
      description: 'This is a mock operation in development mode. In production, it would trigger the ingest_top100 function.',
    });
    return true;
  } catch (error: any) {
    toast({
      title: 'Error triggering ingest',
      description: error.message,
      variant: 'destructive',
    });
    return false;
  }
};

export const triggerIngestProducts = async () => {
  try {
    toast({
      title: 'Info',
      description: 'This is a mock operation in development mode. In production, it would trigger the ingest_products function.',
    });
    return true;
  } catch (error: any) {
    toast({
      title: 'Error triggering ingest',
      description: error.message,
      variant: 'destructive',
    });
    return false;
  }
};

export const triggerRebuildCompetitors = async () => {
  try {
    toast({
      title: 'Info',
      description: 'This is a mock operation in development mode. In production, it would trigger the rebuild_competitors function.',
    });
    return true;
  } catch (error: any) {
    toast({
      title: 'Error triggering rebuild',
      description: error.message,
      variant: 'destructive',
    });
    return false;
  }
};
