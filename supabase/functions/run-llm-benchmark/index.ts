
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MODELS = [
  { name: "gpt-4o-mini", provider: "openai", endpoint: "gpt-4o-mini" },
  { name: "gpt-4o", provider: "openai", endpoint: "gpt-4o" }
];

const QUESTION_SET = {
  "question_set_id": "pharma_analysis_v1",
  "version": "2025-05-26",
  "questions": [
    { "id": "p1", "type": "patient", "text": "What is {drug_name} used for?" },
    { "id": "p2", "type": "patient", "text": "What are the common side effects of {drug_name}?" },
    { "id": "p3", "type": "patient", "text": "Is {drug_name} safe during pregnancy?" },
    { "id": "hcp1", "type": "hcp", "text": "What is the recommended starting dose of {drug_name} in adults?" },
    { "id": "hcp2", "type": "hcp", "text": "Does {drug_name} require liver function monitoring?" },
    { "id": "hcp3", "type": "hcp", "text": "List the key phase III trials supporting {drug_name} approval" },
    { "id": "cmp1", "type": "comparative", "text": "How does {drug_name} compare to competitor drugs in efficacy?" },
    { "id": "cmp2", "type": "comparative", "text": "What are the cost differences between {drug_name} and alternatives?" },
    { "id": "guid1", "type": "guideline", "text": "Is {drug_name} included in current treatment guidelines?" },
    { "id": "guid2", "type": "guideline", "text": "Does NICE recommend {drug_name} for first-line therapy?" }
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { product_id } = await req.json();
    console.log(`Starting comprehensive LLM benchmark for product ID: ${product_id}`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // 1. Load product details
    const { data: product, error: productError } = await supabaseClient
      .from('product')
      .select('*, company(*)')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      throw new Error(`Product not found: ${productError?.message}`);
    }

    console.log(`Analyzing product: ${product.brand_name} (${product.inn})`);

    // 2. Load competitors
    const { data: competitors } = await supabaseClient
      .from('competitor')
      .select('product_b_data:product!product_b(*, company(*))')
      .eq('product_a', product_id);

    const competitorsList = competitors?.map(c => c.product_b_data?.brand_name).filter(Boolean).join(', ') || 'No competitors found';

    // 3. Create new LLM run
    const { data: runData, error: runError } = await supabaseClient
      .from('llm_run')
      .insert({
        product_id: product_id,
        model_name: MODELS.map(m => m.name).join(','),
        question_set_id: QUESTION_SET.question_set_id,
        run_started_at: new Date().toISOString(),
        json_result: { status: 'started', models: MODELS.length, questions: QUESTION_SET.questions.length }
      })
      .select()
      .single();

    if (runError) {
      throw new Error(`Failed to create LLM run: ${runError.message}`);
    }

    console.log(`Created LLM run with ID: ${runData.id}`);

    // 4. Process each model and question
    const allAnswers = [];
    
    for (const model of MODELS) {
      console.log(`Processing model: ${model.name}`);
      
      for (const question of QUESTION_SET.questions) {
        const startTime = Date.now();
        
        // Replace placeholders in question
        let questionText = question.text
          .replace(/{drug_name}/g, product.brand_name)
          .replace(/{indication}/g, product.indication || 'the approved indication')
          .replace(/{competitor_name}/g, competitorsList);

        const prompt = buildPrompt(questionText, product, competitors);
        
        try {
          const response = await callOpenAI(OPENAI_API_KEY, model.endpoint, prompt);
          const latency = Date.now() - startTime;
          
          // Store answer
          const { data: answerData, error: answerError } = await supabaseClient
            .from('answer')
            .insert({
              llm_run_id: runData.id,
              question: questionText,
              answer_text: response.answer,
              raw_json: {
                model: model.name,
                question_type: question.type,
                accuracy: response.confidence || 0.75,
                sources: response.sources || []
              },
              latency_ms: latency,
              tokens_prompt: response.usage?.prompt_tokens || 0,
              tokens_completion: response.usage?.completion_tokens || 0,
              position: computeVisibilityPosition(response.answer, product.brand_name)
            })
            .select()
            .single();

          if (answerError) {
            console.error(`Error storing answer: ${answerError.message}`);
            continue;
          }

          allAnswers.push(answerData);

          // Store sources if available
          if (response.sources && response.sources.length > 0) {
            for (const source of response.sources) {
              await supabaseClient.from('source').insert({
                answer_id: answerData.id,
                url: source.url || 'https://example.com',
                domain: extractDomain(source.url || 'https://example.com'),
                title: source.title || 'Medical Reference',
                authority_score: source.authority || Math.random() * 0.5 + 0.5,
                sentiment: analyzeSentiment(source.title || response.answer)
              });
            }
          }

        } catch (error) {
          console.error(`Error processing question "${questionText}" with model ${model.name}:`, error);
          
          // Store error response
          await supabaseClient.from('answer').insert({
            llm_run_id: runData.id,
            question: questionText,
            answer_text: `Error: ${error.message}`,
            raw_json: { error: error.message, model: model.name },
            latency_ms: Date.now() - startTime,
            position: 100 // Low visibility for errors
          });
        }
      }
    }

    // 5. Compute aggregate scores
    console.log('Computing aggregate scores...');
    await supabaseClient.rpc('compute_scores', { p_run_id: runData.id });

    // 6. Apply recommendations
    console.log('Applying recommendations...');
    await supabaseClient.rpc('apply_recommendations', { p_run_id: runData.id });

    // 7. Mark run as completed
    await supabaseClient
      .from('llm_run')
      .update({ 
        run_finished_at: new Date().toISOString(),
        json_result: { 
          status: 'completed', 
          models: MODELS.length, 
          questions: QUESTION_SET.questions.length,
          answers_processed: allAnswers.length 
        }
      })
      .eq('id', runData.id);

    console.log(`Benchmark completed successfully. Processed ${allAnswers.length} answers.`);

    return new Response(
      JSON.stringify({ 
        success: true,
        run_id: runData.id,
        product_name: product.brand_name,
        answers_processed: allAnswers.length,
        models_used: MODELS.length,
        questions_asked: QUESTION_SET.questions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in run-llm-benchmark function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function buildPrompt(question: string, product: any, competitors: any[]) {
  const competitorsList = competitors?.map(c => c.product_b_data?.brand_name).filter(Boolean).join(', ') || 'various competing products';
  
  return `You are an evidence-based pharmaceutical information specialist. Please provide accurate, factual information based on clinical data and medical literature.

Product: ${product.brand_name} (${product.inn || 'Active ingredient not specified'})
Company: ${product.company?.name || 'Unknown'}
Indication: ${product.indication || 'Multiple indications'}
Competitors: ${competitorsList}

Question: ${question}

Please provide:
1. A comprehensive, factual answer (maximum 200 words)
2. Your confidence level in the information (0.0-1.0)
3. Key sources that support this information

Format your response as JSON:
{
  "answer": "detailed answer here",
  "confidence": 0.85,
  "sources": [
    {"title": "source title", "url": "https://example.com", "authority": 0.9}
  ]
}`;
}

async function callOpenAI(apiKey: string, model: string, prompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: 'You are a pharmaceutical information expert. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 800
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (parseError) {
    return {
      answer: content,
      confidence: 0.7,
      sources: [{ title: "Medical literature", url: "https://pubmed.ncbi.nlm.nih.gov/", authority: 0.8 }],
      usage: data.usage
    };
  }
}

function computeVisibilityPosition(answer: string, productName: string): number {
  const lowerAnswer = answer.toLowerCase();
  const lowerProduct = productName.toLowerCase();
  
  if (lowerAnswer.indexOf(lowerProduct) === -1) return 100; // Not mentioned
  if (lowerAnswer.indexOf(lowerProduct) < 50) return Math.floor(Math.random() * 10) + 1; // Early mention
  if (lowerAnswer.indexOf(lowerProduct) < 100) return Math.floor(Math.random() * 20) + 10; // Mid mention
  return Math.floor(Math.random() * 30) + 30; // Late mention
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown-domain.com';
  }
}

function analyzeSentiment(text: string): number {
  const positiveWords = ['effective', 'safe', 'approved', 'beneficial', 'recommended', 'first-line'];
  const negativeWords = ['side effects', 'contraindicated', 'warning', 'risk', 'adverse', 'caution'];
  
  const lowerText = text.toLowerCase();
  let score = 0.5; // neutral baseline
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 0.1;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 0.1;
  });
  
  return Math.max(0, Math.min(1, score));
}
