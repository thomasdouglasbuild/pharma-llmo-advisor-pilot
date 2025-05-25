
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
      console.warn('Error fetching competitors:', competitorsError.message);
    }

    console.log(`Generating report for product: ${product.brand_name}, LLM run: ${llmRunId}`);

    // Extract and analyze LLM results
    const results = llmRun.json_result?.results || [];
    
    if (results.length === 0) {
      throw new Error('No LLM analysis results found');
    }

    // Calculate comprehensive metrics from real AI analysis
    const confidenceScores = results.map((r: any) => r.confidence_score || 0);
    const sentimentScores = results.map((r: any) => r.sentiment_score || 0);
    
    const avgConfidence = confidenceScores.length > 0 ? 
      confidenceScores.reduce((sum: number, score: number) => sum + score, 0) / confidenceScores.length : 0;
    
    const avgSentiment = sentimentScores.length > 0 ? 
      sentimentScores.reduce((sum: number, score: number) => sum + score, 0) / sentimentScores.length : 0;
    
    // Calculate RepuScore™ - weighted combination of confidence, sentiment, and source quality
    const repuScore = (avgConfidence * 0.4) + (avgSentiment * 0.3) + (0.3); // Base score for having sources
    
    // Extract and deduplicate sources from all LLM responses
    const allSources = results.flatMap((r: any) => r.sources || []);
    const uniqueSources = [...new Set(allSources)];

    // Count questions with high confidence (>0.8)
    const highConfidenceCount = confidenceScores.filter((score: number) => score > 0.8).length;
    const accuracyScore = highConfidenceCount / confidenceScores.length;

    // Analyze sentiment trends
    const positiveSentimentCount = sentimentScores.filter((score: number) => score > 0.6).length;
    const negativeSentimentCount = sentimentScores.filter((score: number) => score < 0.4).length;

    // Generate intelligent recommendations based on analysis
    const generateRecommendations = () => {
      const recommendations = [];

      if (avgConfidence < 0.7) {
        recommendations.push({
          title: "Improve Information Accuracy",
          description: `AI analysis shows lower confidence in available information. Consider publishing more clinical data and peer-reviewed studies about ${product.brand_name}.`,
          impact: "high",
          category: "content",
          kbSources: ["clinical-trials", "medical-literature"]
        });
      }

      if (avgSentiment < 0.5) {
        recommendations.push({
          title: "Address Perception Issues",
          description: `Sentiment analysis indicates potential concerns about ${product.brand_name}. Focus on transparent communication about benefits and safety profile.`,
          impact: "high", 
          category: "content",
          kbSources: ["safety-data", "patient-education"]
        });
      }

      if (uniqueSources.length < 10) {
        recommendations.push({
          title: "Expand Source Diversity",
          description: "Limited authoritative sources found. Increase presence in medical journals, clinical databases, and professional forums.",
          impact: "medium",
          category: "authority",
          kbSources: ["medical-journals", "clinical-databases"]
        });
      }

      if (accuracyScore < 0.6) {
        recommendations.push({
          title: "Enhance Technical Documentation",
          description: "Inconsistent information detected across sources. Standardize technical documentation and dosing guidelines.",
          impact: "medium",
          category: "technical",
          kbSources: ["prescribing-info", "technical-docs"]
        });
      }

      // Always include at least one positive recommendation
      if (recommendations.length === 0 || avgConfidence > 0.8) {
        recommendations.push({
          title: "Maintain Information Quality",
          description: `${product.brand_name} shows strong AI representation. Continue regular updates and monitor for new clinical developments.`,
          impact: "low",
          category: "content",
          kbSources: ["ongoing-monitoring"]
        });
      }

      return recommendations;
    };

    // Format competitors data
    const formattedCompetitors = (competitors || []).map(c => {
      const isProductA = c.product_a === Number(productId);
      const competitor = isProductA ? c.product_b_data : c.product_a_data;
      return {
        id: competitor.id,
        name: competitor.brand_name,
        company: competitor.company?.name || 'Unknown',
        similarity_score: c.indication_score || 0.5,
        shared_atc: c.shared_atc
      };
    });

    // Generate insights summary
    const generateInsightsSummary = () => {
      const insights = [];
      
      if (repuScore >= 0.8) {
        insights.push(`${product.brand_name} demonstrates excellent AI representation with high confidence and positive sentiment.`);
      } else if (repuScore >= 0.6) {
        insights.push(`${product.brand_name} shows moderate AI representation with room for improvement in key areas.`);
      } else {
        insights.push(`${product.brand_name} requires significant attention to improve its AI representation and information quality.`);
      }

      insights.push(`Analysis based on ${results.length} comprehensive questions with ${uniqueSources.length} unique authoritative sources identified.`);
      
      if (formattedCompetitors.length > 0) {
        insights.push(`Competitive analysis includes ${formattedCompetitors.length} similar products in the same therapeutic area.`);
      }

      return insights;
    };

    // Compile comprehensive report
    const report = {
      product: {
        id: product.id,
        name: product.brand_name,
        inn: product.inn,
        company: product.company?.name,
        indication: product.indication
      },
      metrics: {
        repuScore: repuScore.toFixed(2),
        confidenceScore: avgConfidence.toFixed(2),
        sentimentScore: avgSentiment.toFixed(2),
        accuracyScore: accuracyScore.toFixed(2),
        sourcesCount: uniqueSources.length
      },
      analysis_summary: {
        questions_analyzed: results.length,
        high_confidence_responses: highConfidenceCount,
        positive_sentiment_responses: positiveSentimentCount,
        negative_sentiment_responses: negativeSentimentCount,
        insights: generateInsightsSummary()
      },
      sources: uniqueSources,
      competitors: formattedCompetitors,
      recommendations: generateRecommendations(),
      detailed_results: results, // Include full AI responses for detailed view
      analysis_timestamp: new Date().toISOString(),
      llm_run_id: llmRunId,
      model_used: llmRun.model_name
    };

    console.log(`Report generated successfully:`, {
      repuScore: report.metrics.repuScore,
      sourcesFound: uniqueSources.length,
      recommendationsCount: report.recommendations.length,
      competitorsFound: formattedCompetitors.length
    });

    // Return the comprehensive report
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
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Check function logs for detailed error information'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
