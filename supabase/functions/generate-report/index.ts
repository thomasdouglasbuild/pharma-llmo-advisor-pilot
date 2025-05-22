
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { productId, llmRunId } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get product details
    const { data: product, error: productError } = await supabaseClient
      .from('product')
      .select('*, company(*)')
      .eq('id', productId)
      .single();
    
    if (productError) {
      throw new Error(`Error fetching product: ${productError.message}`);
    }

    // Get LLM run data
    const { data: llmRun, error: llmRunError } = await supabaseClient
      .from('llm_run')
      .select('*')
      .eq('id', llmRunId)
      .single();
    
    if (llmRunError) {
      throw new Error(`Error fetching LLM run: ${llmRunError.message}`);
    }

    // Get competitors
    const { data: competitors, error: competitorsError } = await supabaseClient
      .from('competitor')
      .select('*, product_a_data:product!product_a(*, company(*)), product_b_data:product!product_b(*, company(*))')
      .or(`product_a.eq.${productId},product_b.eq.${productId}`);
    
    if (competitorsError) {
      throw new Error(`Error fetching competitors: ${competitorsError.message}`);
    }

    // Format competitors data
    const formattedCompetitors = competitors.map(c => {
      const isProductA = c.product_a === Number(productId);
      const competitor = isProductA ? c.product_b_data : c.product_a_data;
      return {
        id: competitor.id,
        name: competitor.brand_name,
        company: competitor.company?.name || 'Unknown',
        similarity_score: c.indication_score,
        shared_atc: c.shared_atc
      };
    });

    // Calculate RepuScore and other metrics based on LLM run data
    const results = llmRun.json_result?.results || [];
    const confidenceScores = results.map((r: any) => r.confidence_score || 0);
    const sentimentScores = results.map((r: any) => r.sentiment_score || 0);
    
    const avgConfidence = confidenceScores.length > 0 ? 
      confidenceScores.reduce((sum: number, score: number) => sum + score, 0) / confidenceScores.length : 0;
    
    const avgSentiment = sentimentScores.length > 0 ? 
      sentimentScores.reduce((sum: number, score: number) => sum + score, 0) / sentimentScores.length : 0;
    
    // Calculate RepuScore - weighted combination of confidence and sentiment
    const repuScore = (avgConfidence * 0.6) + (avgSentiment * 0.4);
    
    // Extract sources from LLM responses
    const allSources = results.flatMap((r: any) => r.sources || []);
    const uniqueSources = [...new Set(allSources)];

    // Generate mock recommendations
    const recommendations = [
      {
        title: "Improve Scientific Evidence",
        description: "Add more clinical trial data and scientific publications to strengthen the evidence base.",
        impact: "high",
        category: "content"
      },
      {
        title: "Address Side Effect Concerns",
        description: "Provide more balanced information about side effects and their management.",
        impact: "medium",
        category: "content"
      },
      {
        title: "Enhance Online Presence",
        description: "Increase visibility on medical forums and professional networks.",
        impact: "medium",
        category: "authority"
      }
    ];

    // Compile final report
    const report = {
      product: {
        id: product.id,
        name: product.brand_name,
        inn: product.inn,
        company: product.company?.name
      },
      metrics: {
        repuScore: repuScore.toFixed(2),
        confidenceScore: avgConfidence.toFixed(2),
        sentimentScore: avgSentiment.toFixed(2),
        sourcesCount: uniqueSources.length
      },
      sources: uniqueSources,
      competitors: formattedCompetitors,
      recommendations,
      analysis_timestamp: new Date().toISOString(),
      llm_run_id: llmRunId
    };

    // Return the generated report
    return new Response(
      JSON.stringify({ 
        success: true, 
        report
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-report function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
