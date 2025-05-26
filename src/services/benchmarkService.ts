
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

export interface ScoreData {
  id: number;
  llm_run_id: number;
  visibility: number;
  accuracy: number;
  sentiment: number;
  reference_quality: number;
  total_score: number;
  created_at: string;
}

export interface RecommendationData {
  id: number;
  llm_run_id: number;
  tip: string;
  category: string;
  priority: number;
  created_at: string;
}

export const runLlmBenchmark = async (productId: number): Promise<boolean> => {
  try {
    toast({
      title: 'Starting AI Benchmark',
      description: 'Running comprehensive analysis with multiple AI models...',
    });

    console.log('Starting LLM benchmark for product:', productId);

    // First run ChatGPT benchmark
    const { data: chatgptData, error: chatgptError } = await supabase.functions.invoke('run-chatgpt-benchmark', {
      body: { product_id: productId }
    });

    console.log('ChatGPT benchmark response:', chatgptData);

    if (chatgptError) {
      console.error('Error calling run-chatgpt-benchmark function:', chatgptError);
      throw chatgptError;
    }

    if (chatgptData.success) {
      // After successful ChatGPT benchmark, add mock data for other models
      console.log('Adding mock data for other models...');
      
      const { data: mockData, error: mockError } = await supabase.functions.invoke('mock-other-models', {
        body: { run_id: chatgptData.run_id }
      });

      if (mockError) {
        console.warn('Warning: Could not add mock data for other models:', mockError);
        // Don't fail the whole process if mock data fails
      } else if (mockData.success) {
        console.log('Mock data added successfully:', mockData);
      }

      toast({
        title: 'Benchmark Complete',
        description: `Successfully analyzed ${chatgptData.product_name} with ${chatgptData.answers_processed} questions processed across multiple AI models.`,
        duration: 6000,
      });

      return true;
    } else {
      throw new Error(chatgptData.error || 'Failed to run LLM benchmark');
    }
  } catch (error: any) {
    console.error('Error running LLM benchmark:', error);
    toast({
      title: 'Benchmark Failed',
      description: error.message || 'Failed to run AI benchmark analysis',
      variant: 'destructive',
    });
    return false;
  }
};

export const getBenchmarkScores = async (productId: number): Promise<ScoreData[]> => {
  try {
    const { data, error } = await supabase
      .from('score')
      .select(`
        *,
        llm_run!inner(product_id)
      `)
      .eq('llm_run.product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching benchmark scores:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getBenchmarkScores:', error);
    return [];
  }
};

export const getBenchmarkRecommendations = async (productId: number): Promise<RecommendationData[]> => {
  try {
    const { data, error } = await supabase
      .from('recommendation')
      .select(`
        *,
        llm_run!inner(product_id)
      `)
      .eq('llm_run.product_id', productId)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching benchmark recommendations:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getBenchmarkRecommendations:', error);
    return [];
  }
};

export const getLatestBenchmarkRun = async (productId: number) => {
  try {
    const { data, error } = await supabase
      .from('llm_run')
      .select('*')
      .eq('product_id', productId)
      .order('run_started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching latest benchmark run:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getLatestBenchmarkRun:', error);
    return null;
  }
};
