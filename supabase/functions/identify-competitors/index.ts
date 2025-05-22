
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
    const { productId } = await req.json();
    
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

    // Mock API call to VIDAL & FDA - in a real implementation, we would call their APIs here
    console.log(`Fetching external data for ${product.brand_name} from VIDAL & FDA`);
    
    // Find potential competitors based on ATC level3 code and indication
    const { data: competitors, error: competitorsError } = await supabaseClient
      .from('product')
      .select('*, company(*)')
      .neq('id', productId)
      .eq('atc_level3', product.atc_level3)
      .limit(10);
    
    if (competitorsError) {
      throw new Error(`Error finding competitors: ${competitorsError.message}`);
    }
    
    // Calculate similarity scores based on indication match
    const scoredCompetitors = competitors.map(comp => {
      // Simple matching algorithm - in production would use NLP for better matching
      const indicationMatch = comp.indication && product.indication ? 
        calculateSimilarity(comp.indication, product.indication) : 0;
      
      return {
        competitor: comp,
        scores: {
          indication_match: indicationMatch,
        }
      };
    });

    // For each identified competitor, create or update a competitor entry
    for (const scored of scoredCompetitors) {
      const comp = scored.competitor;
      const shared_atc = product.atc_level3;
      
      // Check if competitor relationship exists
      const { data: existing } = await supabaseClient
        .from('competitor')
        .select()
        .or(`and(product_a.eq.${productId},product_b.eq.${comp.id}),and(product_a.eq.${comp.id},product_b.eq.${productId})`)
        .maybeSingle();

      if (!existing) {
        // Create new competitor relationship
        await supabaseClient
          .from('competitor')
          .insert({
            product_a: productId,
            product_b: comp.id,
            shared_atc,
            indication_score: scored.scores.indication_match
          });
      }
    }

    // Return the identified competitors with their scores
    return new Response(
      JSON.stringify({ 
        success: true, 
        product,
        competitors: scoredCompetitors,
        identified_count: scoredCompetitors.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in identify-competitors function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Text similarity function using cosine similarity of term frequency
function calculateSimilarity(text1: string, text2: string): number {
  // Simple implementation for demo purposes
  // Convert to lowercase and split into words
  const words1 = text1.toLowerCase().split(/\W+/);
  const words2 = text2.toLowerCase().split(/\W+/);
  
  // Count word occurrences
  const freq1: Record<string, number> = {};
  const freq2: Record<string, number> = {};
  
  words1.forEach(word => {
    freq1[word] = (freq1[word] || 0) + 1;
  });
  
  words2.forEach(word => {
    freq2[word] = (freq2[word] || 0) + 1;
  });
  
  // Get all unique words
  const allWords = new Set([...Object.keys(freq1), ...Object.keys(freq2)]);
  
  // Calculate dot product
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  allWords.forEach(word => {
    const count1 = freq1[word] || 0;
    const count2 = freq2[word] || 0;
    
    dotProduct += count1 * count2;
    magnitude1 += count1 * count1;
    magnitude2 += count2 * count2;
  });
  
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);
  
  // Avoid division by zero
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  // Return cosine similarity (0 to 1)
  return dotProduct / (magnitude1 * magnitude2);
}
