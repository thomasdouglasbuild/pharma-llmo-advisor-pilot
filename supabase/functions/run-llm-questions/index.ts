
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

    // Get OpenAI API key
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Get product details
    const { data: product, error: productError } = await supabaseClient
      .from('product')
      .select('*, company(*)')
      .eq('id', productId)
      .single();
    
    if (productError) {
      throw new Error(`Error fetching product: ${productError.message}`);
    }

    console.log(`Starting LLM analysis for product: ${product.brand_name} (${product.inn})`);

    // Define comprehensive question set for pharmaceutical analysis
    const questions = [
      `What are the main clinical indications for ${product.brand_name} (${product.inn})?`,
      `What are the most common side effects and safety profile of ${product.brand_name}?`,
      `How does ${product.brand_name} compare to other treatments in its therapeutic class for ${product.indication}?`,
      `What is the current market position and competitive landscape for ${product.brand_name}?`,
      `What are the latest clinical trial results and efficacy data for ${product.brand_name}?`,
      `What are the dosing recommendations and administration guidelines for ${product.brand_name}?`,
      `Are there any recent regulatory updates or approvals for ${product.brand_name}?`,
      `What are the main contraindications and drug interactions for ${product.brand_name}?`
    ];

    // Function to analyze content with OpenAI
    const analyzeWithOpenAI = async (question: string, productName: string, inn: string) => {
      const prompt = `You are a pharmaceutical intelligence analyst. Analyze the following question about ${productName} (${inn}):

Question: ${question}

Please provide:
1. A comprehensive, factual answer based on medical literature and clinical data
2. Identify 3-5 authoritative sources that would contain this information
3. Rate the confidence level of this information (0.0-1.0)
4. Rate the sentiment/perception of this drug aspect (0.0-1.0, where 0.5 is neutral)

Format your response as JSON:
{
  "answer": "detailed answer here",
  "sources": ["source1", "source2", "source3"],
  "confidence_score": 0.85,
  "sentiment_score": 0.72
}`;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a pharmaceutical intelligence expert. Always respond with valid JSON only.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 1000
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        try {
          // Try to parse the JSON response
          const parsedResponse = JSON.parse(content);
          return {
            question,
            answer: parsedResponse.answer || content,
            sources: parsedResponse.sources || [`Medical literature for ${productName}`, `Clinical databases`, `Regulatory documents`],
            confidence_score: parsedResponse.confidence_score || 0.75,
            sentiment_score: parsedResponse.sentiment_score || 0.6
          };
        } catch (parseError) {
          // Fallback if JSON parsing fails
          console.warn('Failed to parse OpenAI JSON response, using fallback');
          return {
            question,
            answer: content,
            sources: [`Medical literature for ${productName}`, `Clinical databases`, `FDA/EMA documents`],
            confidence_score: 0.7,
            sentiment_score: 0.6
          };
        }
      } catch (error) {
        console.error(`Error calling OpenAI for question: ${question}`, error);
        // Return a fallback response
        return {
          question,
          answer: `Analysis not available for this question about ${productName}.`,
          sources: [`Clinical databases`, `Medical literature`],
          confidence_score: 0.3,
          sentiment_score: 0.5,
          error: error.message
        };
      }
    };

    // Run analysis for all questions
    console.log(`Running AI analysis for ${questions.length} questions...`);
    const analysisPromises = questions.map(question => 
      analyzeWithOpenAI(question, product.brand_name, product.inn)
    );

    const results = await Promise.all(analysisPromises);
    
    // Log results for debugging
    console.log(`Completed analysis. Results summary:`, {
      total_questions: results.length,
      avg_confidence: results.reduce((sum, r) => sum + r.confidence_score, 0) / results.length,
      avg_sentiment: results.reduce((sum, r) => sum + r.sentiment_score, 0) / results.length,
      errors: results.filter(r => r.error).length
    });

    // Store the run in the database
    const { data: runData, error: runError } = await supabaseClient
      .from('llm_run')
      .insert({
        product_id: productId,
        model_name: 'gpt-4o-mini',
        question_set_id: 'pharma-analysis-v2',
        run_started_at: new Date().toISOString(),
        json_result: {
          questions: questions,
          results: results,
          metadata: {
            product_id: productId,
            product_name: product.brand_name,
            company_name: product.company?.name,
            run_date: new Date().toISOString(),
            analysis_type: 'comprehensive_pharmaceutical_analysis'
          }
        }
      })
      .select()
      .single();
    
    if (runError) {
      console.error('Error storing LLM run:', runError);
      throw new Error(`Error storing LLM run: ${runError.message}`);
    }

    console.log(`Successfully stored LLM run with ID: ${runData.id}`);

    // Return the LLM results
    return new Response(
      JSON.stringify({ 
        success: true, 
        run_id: runData.id,
        product_name: product.brand_name,
        results: results,
        summary: {
          questions_analyzed: results.length,
          avg_confidence: (results.reduce((sum, r) => sum + r.confidence_score, 0) / results.length).toFixed(3),
          avg_sentiment: (results.reduce((sum, r) => sum + r.sentiment_score, 0) / results.length).toFixed(3)
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in run-llm-questions function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
