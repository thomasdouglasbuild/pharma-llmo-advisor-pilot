
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log('Starting sample data seeding...');

    // Sample data with real OpenAI answers
    const sampleData = [
      {
        product: "Stelara",
        question: "What is the indication of Stelara?",
        answer: "Stelara® (ustekinumab) is approved for adults and children ≥6 y with moderate-to-severe plaque psoriasis, for psoriatic arthritis, for adults with moderate-to-severe Crohn's disease and ulcerative colitis who have failed conventional therapy.",
        sources: ["https://www.stelarainfo.com/crohns-disease/about-stelara"]
      },
      {
        product: "Stelara",
        question: "What are the most common side-effects of Stelara?",
        answer: "The most frequently reported AEs are upper-respiratory infections, headache, fatigue and injection-site erythema; serious infections are uncommon but possible.",
        sources: ["https://www.stelarainfo.com/crohns-disease/"]
      },
      {
        product: "Stelara",
        question: "Is Stelara safe during pregnancy?",
        answer: "Data are limited; the FDA label lists Stelara as pregnancy category B. Registry follow-up shows no clear teratogenic signal, but prescribers usually switch to anti-TNF with more data. Use only if benefits outweigh risks.",
        sources: ["https://www.stelarainfo.com/crohns-disease/"]
      },
      {
        product: "Stelara",
        question: "How does Stelara compare with Humira in efficacy?",
        answer: "In anti-TNF-naïve Crohn's disease patients, head-to-head SEAVUE (2021) showed similar 52-wk clinical remission (Stelara 61% vs Humira 57%). Stelara had fewer injection-site reactions.",
        sources: ["https://www.stelarainfo.com/crohns-disease/about-stelara"]
      },
      {
        product: "Stelara",
        question: "Which clinical trials led to Stelara's approval?",
        answer: "Key trials include PHOENIX 1/2 (plaque psoriasis), PSUMMIT 1/2 (PsA), UNITI-1 and UNITI-2 + IM-UNITI (Crohn's), UNIFI (UC).",
        sources: ["https://www.stelarainfo.com/crohns-disease/about-stelara"]
      },
      {
        product: "Keytruda",
        question: "What is the indication of Keytruda?",
        answer: "Keytruda® (pembrolizumab) is an anti-PD-1 antibody approved across 18 malignancies incl. NSCLC, melanoma, RCC, HNSCC, MSI-H tumours and adjuvant settings.",
        sources: ["https://www.keytruda.com/"]
      },
      {
        product: "Paxlovid",
        question: "What is the indication of Paxlovid?",
        answer: "Paxlovid (nirmatrelvir + ritonavir) is indicated for treatment of mild-to-moderate COVID-19 in adults and children ≥12 y at high risk of progressing to severe disease, to be started within 5 days of symptom onset.",
        sources: ["https://www.yalemedicine.org/news/13-things-to-know-paxlovid-covid-19"]
      },
      {
        product: "Humira",
        question: "What are the most common side-effects of Humira?",
        answer: "Upper-respiratory infections, injection-site pain, headache and rash are common; serious risks include TB reactivation and malignancy (black-box).",
        sources: ["https://www.humira.com/"]
      },
      {
        product: "Ozempic",
        question: "Is Ozempic more effective than other GLP-1s for weight loss?",
        answer: "Semaglutide 2 mg (Ozempic) achieves ~15% weight loss in STEP-2 vs liraglutide's 6-8%; upcoming tirzepatide outperforms semaglutide but Ozempic leads current GLP-1 monotherapies.",
        sources: ["https://www.wsj.com/health/pharma/glp-1-drugs-health-benefits-4014d7d5"]
      }
    ];

    // Find or create a sample product (Stelara)
    const { data: stelara } = await supabase
      .from('product')
      .select('id')
      .eq('brand_name', 'Stelara')
      .maybeSingle();

    if (!stelara) {
      return new Response(JSON.stringify({
        error: 'Stelara product not found. Please import products first.',
        success: false
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create a sample LLM run
    const { data: llmRun, error: runError } = await supabase
      .from('llm_run')
      .insert({
        product_id: stelara.id,
        model_name: 'gpt-4o-mini',
        question_set_id: 'sample-demo-v1',
        run_started_at: new Date().toISOString(),
        json_result: { 
          status: 'completed',
          type: 'sample_data',
          questions: sampleData.length 
        }
      })
      .select()
      .single();

    if (runError) {
      console.error('Error creating LLM run:', runError);
      throw runError;
    }

    console.log(`Created sample LLM run with ID: ${llmRun.id}`);

    // Insert sample answers
    let answersInserted = 0;
    let sourcesInserted = 0;

    for (const item of sampleData) {
      const { data: answerData, error: answerError } = await supabase
        .from('answer')
        .insert({
          llm_run_id: llmRun.id,
          question: item.question,
          answer_text: item.answer,
          raw_json: {
            model: 'gpt-4o',
            confidence: 0.85 + Math.random() * 0.1, // 0.85-0.95
            product: item.product
          },
          position: Math.floor(Math.random() * 5) + 1, // Position 1-5 (good visibility)
          latency_ms: 1200 + Math.floor(Math.random() * 800), // 1.2-2.0 seconds
          tokens_prompt: 180 + Math.floor(Math.random() * 80),
          tokens_completion: 150 + Math.floor(Math.random() * 100)
        })
        .select()
        .single();

      if (answerError) {
        console.error('Error inserting answer:', answerError);
        continue;
      }

      answersInserted++;

      // Insert sources for each answer
      for (const sourceUrl of item.sources) {
        const { error: sourceError } = await supabase
          .from('source')
          .insert({
            answer_id: answerData.id,
            url: sourceUrl,
            domain: new URL(sourceUrl).hostname,
            title: `${item.product} - Medical Information`,
            authority_score: 0.8 + Math.random() * 0.15, // 0.8-0.95
            sentiment: 0.6 + Math.random() * 0.3 // 0.6-0.9
          });

        if (!sourceError) {
          sourcesInserted++;
        }
      }
    }

    // Compute scores for the run
    const { error: scoreError } = await supabase.rpc('compute_scores', { 
      p_run_id: llmRun.id 
    });

    if (scoreError) {
      console.error('Error computing scores:', scoreError);
    }

    // Apply recommendations
    const { error: recError } = await supabase.rpc('apply_recommendations', { 
      p_run_id: llmRun.id 
    });

    if (recError) {
      console.error('Error applying recommendations:', recError);
    }

    console.log(`Sample data seeding complete. Inserted ${answersInserted} answers and ${sourcesInserted} sources.`);

    return new Response(JSON.stringify({
      success: true,
      run_id: llmRun.id,
      product_name: 'Stelara',
      answers_inserted: answersInserted,
      sources_inserted: sourcesInserted,
      message: `Successfully seeded ${answersInserted} sample answers with ${sourcesInserted} sources`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in seed-sample-data function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
