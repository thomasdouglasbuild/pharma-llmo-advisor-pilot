
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

    console.log('Starting initial data seeding...');

    // Seed top 50 pharmaceutical companies
    const companyData = [
      { name: 'Pfizer', rank_2024: 1, hq_country: 'USA', sales_2024_bn: 88.2, ticker: 'PFE' },
      { name: 'Johnson & Johnson', rank_2024: 2, hq_country: 'USA', sales_2024_bn: 82.1, ticker: 'JNJ' },
      { name: 'Roche', rank_2024: 3, hq_country: 'Switzerland', sales_2024_bn: 68.7, ticker: 'RHHBY' },
      { name: 'Novartis', rank_2024: 4, hq_country: 'Switzerland', sales_2024_bn: 52.5, ticker: 'NVS' },
      { name: 'Merck & Co', rank_2024: 5, hq_country: 'USA', sales_2024_bn: 59.8, ticker: 'MRK' },
      { name: 'AbbVie', rank_2024: 6, hq_country: 'USA', sales_2024_bn: 54.3, ticker: 'ABBV' },
      { name: 'Sanofi', rank_2024: 7, hq_country: 'France', sales_2024_bn: 43.2, ticker: 'SNY' },
      { name: 'GSK', rank_2024: 8, hq_country: 'UK', sales_2024_bn: 39.4, ticker: 'GSK' },
      { name: 'AstraZeneca', rank_2024: 9, hq_country: 'UK', sales_2024_bn: 37.8, ticker: 'AZN' },
      { name: 'Bristol Myers Squibb', rank_2024: 10, hq_country: 'USA', sales_2024_bn: 36.2, ticker: 'BMY' },
      { name: 'Eli Lilly', rank_2024: 11, hq_country: 'USA', sales_2024_bn: 34.1, ticker: 'LLY' },
      { name: 'Gilead Sciences', rank_2024: 12, hq_country: 'USA', sales_2024_bn: 27.3, ticker: 'GILD' },
      { name: 'Amgen', rank_2024: 13, hq_country: 'USA', sales_2024_bn: 26.4, ticker: 'AMGN' },
      { name: 'Boehringer Ingelheim', rank_2024: 14, hq_country: 'Germany', sales_2024_bn: 22.6, ticker: null },
      { name: 'Takeda', rank_2024: 15, hq_country: 'Japan', sales_2024_bn: 19.8, ticker: '4502.T' },
      { name: 'Bayer', rank_2024: 16, hq_country: 'Germany', sales_2024_bn: 18.9, ticker: 'BAYN.DE' },
      { name: 'Biogen', rank_2024: 17, hq_country: 'USA', sales_2024_bn: 15.7, ticker: 'BIIB' },
      { name: 'Celgene', rank_2024: 18, hq_country: 'USA', sales_2024_bn: 15.2, ticker: null },
      { name: 'Vertex Pharmaceuticals', rank_2024: 19, hq_country: 'USA', sales_2024_bn: 14.8, ticker: 'VRTX' },
      { name: 'Regeneron', rank_2024: 20, hq_country: 'USA', sales_2024_bn: 13.9, ticker: 'REGN' }
    ];

    let companiesAdded = 0;
    for (const company of companyData) {
      const { error } = await supabase
        .from('company')
        .upsert({
          ...company,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'name'
        });

      if (error) {
        console.error(`Error inserting company ${company.name}:`, error);
      } else {
        companiesAdded++;
      }
    }

    // Seed some key products
    const { data: companies } = await supabase.from('company').select('id, name');
    const companyMap = new Map(companies?.map(c => [c.name, c.id]) || []);

    const productData = [
      { brand_name: 'Lipitor', inn: 'atorvastatin', company_name: 'Pfizer', atc_level3: 'C10A', indication: 'Hypercholesterolemia', status: 'Approved', approval_region: 'Global' },
      { brand_name: 'Crestor', inn: 'rosuvastatin', company_name: 'AstraZeneca', atc_level3: 'C10A', indication: 'Hypercholesterolemia', status: 'Approved', approval_region: 'Global' },
      { brand_name: 'Humira', inn: 'adalimumab', company_name: 'AbbVie', atc_level3: 'L04A', indication: 'Rheumatoid arthritis', status: 'Approved', approval_region: 'Global' },
      { brand_name: 'Keytruda', inn: 'pembrolizumab', company_name: 'Merck & Co', atc_level3: 'L01X', indication: 'Melanoma', status: 'Approved', approval_region: 'Global' },
      { brand_name: 'Revlimid', inn: 'lenalidomide', company_name: 'Bristol Myers Squibb', atc_level3: 'L04A', indication: 'Multiple myeloma', status: 'Approved', approval_region: 'Global' },
      { brand_name: 'Opdivo', inn: 'nivolumab', company_name: 'Bristol Myers Squibb', atc_level3: 'L01X', indication: 'Lung cancer', status: 'Approved', approval_region: 'Global' },
      { brand_name: 'Herceptin', inn: 'trastuzumab', company_name: 'Roche', atc_level3: 'L01X', indication: 'Breast cancer', status: 'Approved', approval_region: 'Global' },
      { brand_name: 'Avastin', inn: 'bevacizumab', company_name: 'Roche', atc_level3: 'L01X', indication: 'Colorectal cancer', status: 'Approved', approval_region: 'Global' },
      { brand_name: 'Rituxan', inn: 'rituximab', company_name: 'Roche', atc_level3: 'L01X', indication: 'Non-Hodgkin lymphoma', status: 'Approved', approval_region: 'Global' },
      { brand_name: 'Enbrel', inn: 'etanercept', company_name: 'Pfizer', atc_level3: 'L04A', indication: 'Rheumatoid arthritis', status: 'Approved', approval_region: 'Global' },
      { brand_name: 'Remicade', inn: 'infliximab', company_name: 'Johnson & Johnson', atc_level3: 'L04A', indication: 'Crohn\'s disease', status: 'Approved', approval_region: 'Global' },
      { brand_name: 'Soliris', inn: 'eculizumab', company_name: 'AstraZeneca', atc_level3: 'L04A', indication: 'Paroxysmal nocturnal hemoglobinuria', status: 'Approved', approval_region: 'Global' }
    ];

    let productsAdded = 0;
    for (const product of productData) {
      const companyId = companyMap.get(product.company_name);
      if (companyId) {
        const { error } = await supabase
          .from('product')
          .upsert({
            brand_name: product.brand_name,
            inn: product.inn,
            company_id: companyId,
            atc_level3: product.atc_level3,
            indication: product.indication,
            status: product.status,
            approval_region: product.approval_region,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'brand_name,company_id'
          });

        if (error) {
          console.error(`Error inserting product ${product.brand_name}:`, error);
        } else {
          productsAdded++;
        }
      }
    }

    console.log(`Seeded ${companiesAdded} companies and ${productsAdded} products`);

    return new Response(JSON.stringify({
      success: true,
      companies: companiesAdded,
      products: productsAdded,
      message: `Successfully seeded ${companiesAdded} companies and ${productsAdded} products`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in seed-top50 function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
