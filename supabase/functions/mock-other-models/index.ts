
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { run_id } = await req.json();
    
    if (!run_id) {
      return new Response(JSON.stringify({ error: 'run_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log(`Creating mock answers for other models for run_id: ${run_id}`);

    // Get existing GPT-4o questions for this run
    const { data: questions, error: questionsError } = await supabase
      .from("answer")
      .select("question")
      .eq("llm_run_id", run_id)
      .eq("raw_json->>model", "gpt-4o");

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      throw questionsError;
    }

    if (!questions || questions.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No GPT-4o questions found for this run_id',
        run_id: run_id 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const models = ["claude-3-sonnet", "gemini-1.5-pro", "perplexity-llama3"];
    let totalInserted = 0;

    for (const model of models) {
      console.log(`Creating mock answers for ${model}`);
      
      for (const questionData of questions) {
        try {
          // Generate slightly different mock answers for variety
          const mockAnswers = {
            "claude-3-sonnet": "Analysis pending - Claude model response would appear here with detailed clinical insights.",
            "gemini-1.5-pro": "Comprehensive assessment - Gemini analysis would provide evidence-based medical information here.",
            "perplexity-llama3": "Real-time research - Perplexity would deliver current medical literature synthesis here."
          };

          const { error: insertError } = await supabase.from("answer").insert({
            llm_run_id: run_id,
            question: questionData.question,
            answer_text: mockAnswers[model as keyof typeof mockAnswers],
            raw_json: { 
              model: model,
              confidence: Math.random() * 0.3 + 0.6, // 0.6-0.9 range
              is_mock: true 
            },
            position: Math.floor(Math.random() * 20) + 1, // Random position 1-20
            latency_ms: Math.floor(Math.random() * 2000) + 1000, // 1-3 seconds
            tokens_prompt: 150 + Math.floor(Math.random() * 100),
            tokens_completion: 200 + Math.floor(Math.random() * 150)
          });

          if (insertError) {
            console.error(`Error inserting mock answer for ${model}:`, insertError);
          } else {
            totalInserted++;
          }
        } catch (error) {
          console.error(`Error processing question for ${model}:`, error);
        }
      }
    }

    console.log(`Mock data generation complete. Inserted ${totalInserted} mock answers.`);

    return new Response(JSON.stringify({
      success: true,
      run_id: run_id,
      models_mocked: models.length,
      questions_per_model: questions.length,
      total_mock_answers: totalInserted,
      message: `Successfully created ${totalInserted} mock answers for ${models.length} models`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in mock-other-models function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
