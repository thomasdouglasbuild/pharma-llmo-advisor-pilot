
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import type { Company, Product, LlmRun } from '@/types/PharmaTypes';

// Run competitor identification for a product
export const identifyCompetitors = async (productId: number): Promise<boolean> => {
  try {
    toast({
      title: 'Identifying Competitors',
      description: 'Analyzing therapeutic areas and finding similar products...',
    });
    
    const { data, error } = await supabase.functions.invoke('identify-competitors', {
      body: { productId }
    });
    
    if (error) {
      throw error;
    }
    
    toast({
      title: 'Competitors Identified',
      description: `Found ${data.identified_count} potential competitors for analysis.`,
    });
    
    return true;
  } catch (error: any) {
    toast({
      title: 'Error identifying competitors',
      description: error.message,
      variant: 'destructive',
    });
    return false;
  }
};

// Run LLM questioning for a product and its competitors
export const runLlmQuestions = async (productId: number, competitorIds?: number[]): Promise<{ success: boolean, runId?: number }> => {
  try {
    toast({
      title: 'LLM Analysis Started',
      description: 'Running questions against multiple LLM models...',
    });
    
    const { data, error } = await supabase.functions.invoke('run-llm-questions', {
      body: { 
        productId, 
        competitorIds: competitorIds || [] 
      }
    });
    
    if (error) {
      throw error;
    }
    
    toast({
      title: 'LLM Analysis Complete',
      description: `Successfully analyzed ${data.product_name} with LLM models.`,
    });
    
    return { success: true, runId: data.run_id };
  } catch (error: any) {
    toast({
      title: 'Error running LLM analysis',
      description: error.message,
      variant: 'destructive',
    });
    return { success: false };
  }
};

// Generate the report with scores, sentiment, etc.
export const generateReport = async (productId: number, llmRunId: number): Promise<{ success: boolean, reportData?: any }> => {
  try {
    toast({
      title: 'Report Generation',
      description: 'Creating your RepuScore™ report with detailed insights...',
    });
    
    const { data, error } = await supabase.functions.invoke('generate-report', {
      body: { 
        productId, 
        llmRunId 
      }
    });
    
    if (error) {
      throw error;
    }
    
    toast({
      title: 'Report Ready',
      description: 'Your RepuScore™ analysis is now available.',
    });
    
    return { success: true, reportData: data.report };
  } catch (error: any) {
    toast({
      title: 'Error generating report',
      description: error.message,
      variant: 'destructive',
    });
    return { success: false };
  }
};

// Run the complete analysis pipeline
export const runFullAnalysis = async (productId: number): Promise<{ success: boolean, reportData?: any }> => {
  try {
    // Step 1: Identify competitors
    const competitorsSuccess = await identifyCompetitors(productId);
    if (!competitorsSuccess) {
      throw new Error('Failed to identify competitors');
    }
    
    // Step 2: Run LLM questions
    const { success: llmSuccess, runId } = await runLlmQuestions(productId);
    if (!llmSuccess || !runId) {
      throw new Error('Failed to run LLM analysis');
    }
    
    // Step 3: Generate report
    const { success: reportSuccess, reportData } = await generateReport(productId, runId);
    if (!reportSuccess || !reportData) {
      throw new Error('Failed to generate report');
    }
    
    return { success: true, reportData };
  } catch (error: any) {
    toast({
      title: 'Analysis Pipeline Failed',
      description: error.message,
      variant: 'destructive',
    });
    return { success: false };
  }
};

// Get the latest report for a product
export const getLatestReport = async (productId: number): Promise<any | null> => {
  try {
    // Get the most recent LLM run for the product
    const { data: llmRun, error: llmError } = await supabase
      .from('llm_run')
      .select('*')
      .eq('product_id', productId)
      .order('run_started_at', { ascending: false })
      .limit(1)
      .single();
    
    if (llmError || !llmRun) {
      // No existing report found
      return null;
    }
    
    // Generate/retrieve report based on the LLM run
    const { success, reportData } = await generateReport(productId, llmRun.id);
    if (!success || !reportData) {
      return null;
    }
    
    return reportData;
  } catch (error) {
    console.error('Error getting latest report:', error);
    return null;
  }
};
