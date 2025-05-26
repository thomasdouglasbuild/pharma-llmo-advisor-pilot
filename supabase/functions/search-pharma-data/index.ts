
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to wait for a specified time
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry function with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Check if it's a rate limit error (429)
      if (error instanceof Error && error.message.includes('Too Many Requests')) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited. Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
        await wait(delay);
      } else {
        // For other errors, throw immediately
        throw error;
      }
    }
  }
  
  throw lastError!;
}

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

    // Create the OpenAI API call function
    const makeOpenAICall = async () => {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a pharmaceutical industry data researcher. Provide comprehensive, accurate information about the top 25 pharmaceutical companies worldwide by revenue in 2024 and their major marketed products. Focus on including multiple products per company. Format your response as a JSON array with the following structure:
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
              
              Include multiple major products for each company - aim for 5-10 products per company including blockbuster drugs, biosimilars, and specialty medicines.`
            },
            {
              role: 'user',
              content: 'Please provide data for the top 25 pharmaceutical companies worldwide by revenue in 2024, including 5-10 major marketed products for each company. Focus on accuracy and include their full portfolio of key products.'
            }
          ],
          temperature: 0.1,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return response;
    };

    // Call OpenAI with retry logic
    const response = await retryWithBackoff(makeOpenAICall, 3, 2000);
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
    
    // Return more detailed error information
    let errorMessage = 'Unknown error occurred';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific error types
      if (error.message.includes('Too Many Requests')) {
        errorMessage = 'OpenAI API rate limit exceeded. Please try again in a few minutes.';
        statusCode = 429;
      } else if (error.message.includes('OpenAI API key not configured')) {
        errorMessage = 'OpenAI API key is not configured in environment variables.';
        statusCode = 401;
      }
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
