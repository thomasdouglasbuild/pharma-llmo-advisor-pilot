
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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log('Starting pharmaceutical data search for top 25 companies...');

    // Search for top 25 pharmaceutical companies and ALL their key products
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a pharmaceutical industry data researcher. Provide comprehensive, accurate information about the top 25 pharmaceutical companies worldwide by revenue in 2024 and ALL their major marketed products. Focus on breadth - include as many products as possible for each company. Format your response as a JSON array with the following structure:
            {
              "companies": [
                {
                  "name": "Company Name",
                  "rank_2024": 1,
                  "hq_country": "Country",
                  "sales_2024_bn": 58.5,
                  "ticker": "TICKER",
                  "products": [
                    {
                      "brand_name": "Product Name",
                      "inn": "generic name",
                      "indication": "therapeutic indication",
                      "atc_level3": "ATC code",
                      "status": "Approved",
                      "approval_region": "Global",
                      "first_approval": "2020-01-15"
                    }
                  ]
                }
              ]
            }
            
            Include ALL major products for each company - aim for comprehensive coverage including blockbuster drugs, biosimilars, generics, and specialty medicines. Provide accurate ATC codes and approval dates where possible.`
          },
          {
            role: 'user',
            content: 'Please provide the most current data for the top 25 pharmaceutical companies worldwide by revenue in 2024, including ALL their major marketed products. I need comprehensive product coverage - include as many products as possible for each company, covering their full portfolio including blockbusters, specialty medicines, biosimilars, and key generics. Focus on breadth and accuracy.'
          }
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Received comprehensive pharma data from OpenAI');

    // Parse the JSON response
    let parsedData;
    try {
      // Extract JSON from the response (in case it's wrapped in markdown)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Update companies and products in database
    const companiesData = parsedData.companies || [];
    let updatedCompanies = 0;
    let updatedProducts = 0;

    for (const companyData of companiesData) {
      // Insert or update company
      const { data: company, error: companyError } = await supabase
        .from('company')
        .upsert({
          name: companyData.name,
          rank_2024: companyData.rank_2024,
          hq_country: companyData.hq_country,
          sales_2024_bn: companyData.sales_2024_bn,
          ticker: companyData.ticker,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'name'
        })
        .select()
        .single();

      if (companyError) {
        console.error(`Error updating company ${companyData.name}:`, companyError);
        continue;
      }

      updatedCompanies++;
      console.log(`Updated company: ${company.name} (${companyData.products?.length || 0} products)`);

      // Insert or update ALL products for this company
      if (companyData.products && Array.isArray(companyData.products)) {
        for (const productData of companyData.products) {
          const { error: productError } = await supabase
            .from('product')
            .upsert({
              brand_name: productData.brand_name,
              inn: productData.inn,
              company_id: company.id,
              indication: productData.indication,
              atc_level3: productData.atc_level3,
              status: productData.status || 'Approved',
              approval_region: productData.approval_region || 'Global',
              first_approval: productData.first_approval || null,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'brand_name,company_id'
            });

          if (productError) {
            console.error(`Error updating product ${productData.brand_name}:`, productError);
          } else {
            updatedProducts++;
          }
        }
      }
    }

    console.log(`Successfully updated ${updatedCompanies} companies and ${updatedProducts} products`);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully updated ${updatedCompanies} companies and ${updatedProducts} products from top 25 pharmaceutical companies`,
      companies_updated: updatedCompanies,
      products_updated: updatedProducts
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in search-pharma-data function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
