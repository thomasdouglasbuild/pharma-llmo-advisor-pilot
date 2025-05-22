
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { productId, competitorIds } = await req.json();

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

    // Define standard questions for all products
    const questions = [
      `What are the main indications for ${product.brand_name} (${product.inn})?`,
      `What are the most common side effects of ${product.brand_name}?`,
      `How effective is ${product.brand_name} compared to other treatments in its class?`,
      `What is the recommended dosage for ${product.brand_name}?`,
      `Are there any contraindications for ${product.brand_name}?`
    ];

    // Mock LLM responses - in a real implementation, we would call actual LLM APIs here
    const mockLLMResponse = (question: string, productName: string) => {
      return {
        answer: `This is a simulated response about ${productName} for the question: ${question}`,
        sources: [
          `https://example.com/medical-journal/${productName.toLowerCase().replace(/\s+/g, '-')}`,
          `https://example.com/clinical-trials/${productName.toLowerCase().replace(/\s+/g, '-')}`
        ],
        confidence_score: Math.random() * 0.3 + 0.7, // Random score between 0.7 and 1.0
        sentiment_score: Math.random() * 0.6 + 0.2, // Random score between 0.2 and 0.8
      };
    };

    // Run questions for the main product
    const mainProductResults = questions.map(question => {
      return {
        question,
        ...mockLLMResponse(question, product.brand_name)
      };
    });

    // Store the run in the database
    const { data: runData, error: runError } = await supabaseClient
      .from('llm_run')
      .insert({
        product_id: productId,
        model_name: 'gpt-4-simulation',
        question_set_id: 'standard-pharma-v1',
        run_started_at: new Date().toISOString(),
        json_result: {
          questions: questions,
          results: mainProductResults,
          metadata: {
            product_id: productId,
            product_name: product.brand_name,
            company_name: product.company?.name,
            run_date: new Date().toISOString()
          }
        }
      })
      .select()
      .single();
    
    if (runError) {
      throw new Error(`Error storing LLM run: ${runError.message}`);
    }

    // Return the LLM results
    return new Response(
      JSON.stringify({ 
        success: true, 
        run_id: runData.id,
        product_name: product.brand_name,
        results: mainProductResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in run-llm-questions function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
