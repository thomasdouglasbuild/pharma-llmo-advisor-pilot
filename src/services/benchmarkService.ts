
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

export interface BenchmarkResult {
  run_id: number;
  product_name: string;
  answers_processed: number;
  models_used: number;
  questions_asked: number;
}

export interface ScoreData {
  id: string;
  llm_run_id: number;
  visibility: number;
  accuracy: number;
  sentiment: number;
  reference_quality: number;
  total_score: number;
  created_at: string;
}

export interface RecommendationData {
  id: string;
  llm_run_id: number;
  tip: string;
  category: string;
  priority: number;
}

export interface AnswerData {
  id: string;
  question: string;
  answer_text: string;
  raw_json: any;
  latency_ms: number;
  position: number;
}

// Run comprehensive LLM benchmark for a product
export const runLlmBenchmark = async (productId: number): Promise<BenchmarkResult | null> => {
  try {
    console.log(`Starting comprehensive LLM benchmark for product ID: ${productId}`);
    
    toast({
      title: 'Starting Benchmark',
      description: 'Running comprehensive AI analysis across multiple LLMs...',
    });

    const { data, error } = await supabase.functions.invoke('run-llm-benchmark', {
      body: { product_id: productId }
    });

    if (error) {
      console.error('Error calling run-llm-benchmark function:', error);
      throw error;
    }

    console.log('LLM benchmark response:', data);

    if (data.success) {
      toast({
        title: 'Benchmark Complete',
        description: `Successfully analyzed product across ${data.models_used} LLMs with ${data.questions_asked} questions`,
      });
      return data as BenchmarkResult;
    } else {
      throw new Error(data.error || 'Unknown error occurred');
    }
  } catch (error: any) {
    console.error('Error running LLM benchmark:', error);
    toast({
      title: 'Benchmark Failed',
      description: error.message || 'Failed to run comprehensive LLM analysis',
      variant: 'destructive',
    });
    return null;
  }
};

// Get benchmark scores for a product
export const getBenchmarkScores = async (productId: number): Promise<ScoreData[]> => {
  const { data, error } = await supabase
    .from('score')
    .select(`
      *,
      llm_run!inner(
        id,
        product_id,
        run_started_at,
        run_finished_at
      )
    `)
    .eq('llm_run.product_id', productId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('[Supabase] Error fetching benchmark scores:', error);
    throw error;
  }
  return data || [];
};

// Get recommendations for a product
export const getBenchmarkRecommendations = async (productId: number): Promise<RecommendationData[]> => {
  const { data, error } = await supabase
    .from('recommendation')
    .select(`
      *,
      llm_run!inner(
        id,
        product_id,
        run_started_at
      )
    `)
    .eq('llm_run.product_id', productId)
    .order('priority', { ascending: true });
  
  if (error) {
    console.error('[Supabase] Error fetching benchmark recommendations:', error);
    throw error;
  }
  return data || [];
};

// Get detailed answers for a run
export const getBenchmarkAnswers = async (runId: number): Promise<AnswerData[]> => {
  const { data, error } = await supabase
    .from('answer')
    .select('*')
    .eq('llm_run_id', runId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('[Supabase] Error fetching benchmark answers:', error);
    throw error;
  }
  return data || [];
};

// Get latest benchmark run for a product
export const getLatestBenchmarkRun = async (productId: number) => {
  const { data, error } = await supabase
    .from('llm_run')
    .select('*')
    .eq('product_id', productId)
    .order('run_started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error('[Supabase] Error fetching latest benchmark run:', error);
    throw error;
  }
  return data;
};
