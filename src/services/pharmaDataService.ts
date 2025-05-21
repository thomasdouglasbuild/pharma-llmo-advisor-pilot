
import { supabase } from '@/lib/supabase';
import type { Company, Product, Competitor, LlmRun } from '@/types/PharmaTypes';
import { toast } from '@/hooks/use-toast';

// Company Services
export const getCompanies = async (): Promise<Company[]> => {
  const { data, error } = await supabase
    .from('company')
    .select('*')
    .order('rank_2024', { ascending: true });

  if (error) {
    toast({
      title: 'Error fetching companies',
      description: error.message,
      variant: 'destructive',
    });
    return [];
  }

  return data as Company[];
};

export const getCompanyById = async (id: number): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('company')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    toast({
      title: 'Error fetching company',
      description: error.message,
      variant: 'destructive',
    });
    return null;
  }

  return data as Company;
};

// Product Services
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('product')
    .select('*, company(*)');

  if (error) {
    toast({
      title: 'Error fetching products',
      description: error.message,
      variant: 'destructive',
    });
    return [];
  }

  return data.map(item => ({
    ...item,
    company: item.company
  })) as Product[];
};

export const getProductsByCompany = async (companyId: number): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('product')
    .select('*, company(*)')
    .eq('company_id', companyId);

  if (error) {
    toast({
      title: 'Error fetching products',
      description: error.message,
      variant: 'destructive',
    });
    return [];
  }

  return data.map(item => ({
    ...item,
    company: item.company
  })) as Product[];
};

export const getProductById = async (id: number): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('product')
    .select('*, company(*)')
    .eq('id', id)
    .single();

  if (error) {
    toast({
      title: 'Error fetching product',
      description: error.message,
      variant: 'destructive',
    });
    return null;
  }

  return {
    ...data,
    company: data.company
  } as Product;
};

// Competitor Services
export const getCompetitors = async (productId: number): Promise<Competitor[]> => {
  // Get competitors where the product is either product_a or product_b
  const { data, error } = await supabase
    .from('competitor')
    .select('*, product_a_data:product!product_a(*, company(*)), product_b_data:product!product_b(*, company(*))')
    .or(`product_a.eq.${productId},product_b.eq.${productId}`);

  if (error) {
    toast({
      title: 'Error fetching competitors',
      description: error.message,
      variant: 'destructive',
    });
    return [];
  }

  return data as unknown as Competitor[];
};

// LLM Run Services
export const getLlmRuns = async (productId?: number): Promise<LlmRun[]> => {
  let query = supabase
    .from('llm_run')
    .select('*, product(*, company(*))');
  
  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data, error } = await query;

  if (error) {
    toast({
      title: 'Error fetching LLM runs',
      description: error.message,
      variant: 'destructive',
    });
    return [];
  }

  return data.map(item => ({
    ...item,
    product: item.product
  })) as LlmRun[];
};

// Trigger edge functions manually
export const triggerIngestTop100 = async () => {
  try {
    const { error } = await supabase.functions.invoke('ingest_top100');
    if (error) throw error;
    
    toast({
      title: 'Success',
      description: 'Top 100 companies ingestion has been triggered',
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
    const { error } = await supabase.functions.invoke('ingest_products');
    if (error) throw error;
    
    toast({
      title: 'Success',
      description: 'Products ingestion has been triggered',
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
    const { error } = await supabase.functions.invoke('rebuild_competitors');
    if (error) throw error;
    
    toast({
      title: 'Success',
      description: 'Competitors rebuild has been triggered',
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
