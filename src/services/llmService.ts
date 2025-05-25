
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { LlmRun } from '@/types/PharmaTypes';

// Run LLM analysis on a specific product
export const runLlmAnalysis = async (productId: number): Promise<boolean> => {
  try {
    console.log(`Starting LLM analysis for product ID: ${productId}`);
    
    toast({
      title: 'Starting Analysis',
      description: 'Running AI analysis on the selected product...',
    });

    const { data, error } = await supabase.functions.invoke('run-llm-questions', {
      body: { 
        productId: productId,
        competitorIds: [] // We'll add competitor detection later
      }
    });

    if (error) {
      console.error('Error calling run-llm-questions function:', error);
      throw error;
    }

    console.log('LLM analysis response:', data);

    if (data.success) {
      toast({
        title: 'Analysis Complete',
        description: `Successfully analyzed product with ${data.results?.length || 0} questions`,
      });
      return true;
    } else {
      throw new Error(data.error || 'Unknown error occurred');
    }
  } catch (error: any) {
    console.error('Error running LLM analysis:', error);
    toast({
      title: 'Analysis Failed',
      description: error.message || 'Failed to run AI analysis on product',
      variant: 'destructive',
    });
    return false;
  }
};

// Get LLM runs for a product
export const getLlmRunsForProduct = async (productId: number): Promise<LlmRun[]> => {
  try {
    const { data, error } = await supabase
      .from('llm_run')
      .select('*, product(*, company(*))')
      .eq('product_id', productId)
      .order('run_started_at', { ascending: false });
    
    if (error) {
      console.error('[Supabase] Error fetching LLM runs for product:', error);
      return [];
    }
    return data ?? [];
  } catch (error: any) {
    console.error('[Supabase] Exception fetching LLM runs for product:', error);
    return [];
  }
};

// Get latest LLM run for a product
export const getLatestLlmRun = async (productId: number): Promise<LlmRun | null> => {
  try {
    const { data, error } = await supabase
      .from('llm_run')
      .select('*, product(*, company(*))')
      .eq('product_id', productId)
      .order('run_started_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('[Supabase] Error fetching latest LLM run:', error);
      return null;
    }
    return data;
  } catch (error: any) {
    console.error('[Supabase] Exception fetching latest LLM run:', error);
    return null;
  }
};
