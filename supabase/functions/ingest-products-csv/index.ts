
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

    console.log('Starting pharmaceutical blockbusters CSV data ingestion...');

    // Get existing companies
    const { data: companies } = await supabase.from('company').select('id, name');
    console.log('Found companies:', companies?.map(c => c.name));
    
    // Create comprehensive company mapping with exact name fixes
    const companyMap = new Map();
    companies?.forEach(company => {
      companyMap.set(company.name, company.id);
      
      // Handle exact variations from your data
      const variations = getCompanyVariations(company.name);
      variations.forEach(variation => {
        companyMap.set(variation, company.id);
      });
    });

    console.log('Company mapping created for:', Array.from(companyMap.keys()));

    // Enhanced products data matching your CSV format exactly
    const productsData = [
      { company_name: 'Johnson & Johnson', brand_name: 'Stelara', inn: 'ustekinumab', atc_level3: 'L04AC', indication: 'Moderate-to-severe Crohn\'s disease, plaque psoriasis, ulcerative colitis', approval_region: 'US/EU' },
      { company_name: 'Johnson & Johnson', brand_name: 'Darzalex', inn: 'daratumumab', atc_level3: 'L01XC', indication: 'Multiple myeloma', approval_region: 'US/EU' },
      { company_name: 'Roche', brand_name: 'Ocrevus', inn: 'ocrelizumab', atc_level3: 'L04AA', indication: 'Multiple sclerosis', approval_region: 'US/EU' },
      { company_name: 'Roche', brand_name: 'Hemlibra', inn: 'emicizumab', atc_level3: 'B02BX', indication: 'Hemophilia A', approval_region: 'US/EU' },
      { company_name: 'Merck & Co', brand_name: 'Keytruda', inn: 'pembrolizumab', atc_level3: 'L01XC', indication: 'Advanced or metastatic tumours (18 FDA-labelled cancer types)', approval_region: 'US/EU' },
      { company_name: 'Merck & Co', brand_name: 'Gardasil 9', inn: null, atc_level3: 'J07BM', indication: 'HPV prevention', approval_region: 'US/EU' },
      { company_name: 'Pfizer', brand_name: 'Paxlovid', inn: 'nirmatrelvir/ritonavir', atc_level3: 'J05AE', indication: 'Treatment of mild-to-moderate COVID-19 at high risk of progression', approval_region: 'US/EU' },
      { company_name: 'Pfizer', brand_name: 'Ibrance', inn: 'palbociclib', atc_level3: 'L01XE', indication: 'Breast cancer', approval_region: 'US/EU' },
      { company_name: 'AbbVie', brand_name: 'Humira', inn: 'adalimumab', atc_level3: 'L04AB', indication: 'RA, PsA, AS, Crohn\'s disease, UC, hidradenitis suppurativa', approval_region: 'US/EU' },
      { company_name: 'AbbVie', brand_name: 'Skyrizi', inn: 'risankizumab', atc_level3: 'L04AC', indication: 'Psoriasis / IBD', approval_region: 'US/EU' },
      { company_name: 'Novartis', brand_name: 'Cosentyx', inn: 'secukinumab', atc_level3: 'L04AC', indication: 'Psoriasis', approval_region: 'US/EU' },
      { company_name: 'Novartis', brand_name: 'Entresto', inn: 'sacubitril/valsartan', atc_level3: 'C09DX', indication: 'Heart failure', approval_region: 'US/EU' },
      { company_name: 'Bristol Myers Squibb', brand_name: 'Opdivo', inn: 'nivolumab', atc_level3: 'L01XC', indication: 'Oncology', approval_region: 'US/EU' },
      { company_name: 'Bristol Myers Squibb', brand_name: 'Eliquis', inn: 'apixaban', atc_level3: 'B01AF', indication: 'Anticoagulant', approval_region: 'US/EU' },
      { company_name: 'Sanofi', brand_name: 'Dupixent', inn: 'dupilumab', atc_level3: 'D11AX', indication: 'Atopic dermatitis', approval_region: 'US/EU' },
      { company_name: 'Sanofi', brand_name: 'Aubagio', inn: 'teriflunomide', atc_level3: 'L04AA', indication: 'Multiple sclerosis', approval_region: 'US/EU' },
      { company_name: 'AstraZeneca', brand_name: 'Tagrisso', inn: 'osimertinib', atc_level3: 'L01FE', indication: 'Lung cancer', approval_region: 'US/EU' },
      { company_name: 'AstraZeneca', brand_name: 'Farxiga', inn: 'dapagliflozin', atc_level3: 'A10BX', indication: 'Diabetes / Heart failure', approval_region: 'US/EU' },
      { company_name: 'GSK', brand_name: 'Shingrix', inn: null, atc_level3: 'J07BK', indication: 'Shingles vaccine', approval_region: 'US/EU' },
      { company_name: 'GSK', brand_name: 'Trelegy Ellipta', inn: null, atc_level3: 'R03AL', indication: 'COPD / Asthma', approval_region: 'US/EU' },
      { company_name: 'Eli Lilly', brand_name: 'Mounjaro', inn: 'tirzepatide', atc_level3: 'A10BX', indication: 'Diabetes / Obesity', approval_region: 'US/EU' },
      { company_name: 'Eli Lilly', brand_name: 'Verzenio', inn: 'abemaciclib', atc_level3: 'L01XE', indication: 'Breast cancer', approval_region: 'US/EU' },
      { company_name: 'Gilead Sciences', brand_name: 'Biktarvy', inn: null, atc_level3: 'J05AR', indication: 'HIV', approval_region: 'US/EU' },
      { company_name: 'Gilead Sciences', brand_name: 'Veklury', inn: 'remdesivir', atc_level3: 'J05AB', indication: 'COVID-19', approval_region: 'US/EU' },
      { company_name: 'Boehringer Ingelheim', brand_name: 'Jardiance', inn: 'empagliflozin', atc_level3: 'A10BX', indication: 'Diabetes / Heart failure', approval_region: 'US/EU' },
      { company_name: 'Boehringer Ingelheim', brand_name: 'Ofev', inn: 'nintedanib', atc_level3: 'L01EX', indication: 'Pulmonary fibrosis', approval_region: 'US/EU' },
      { company_name: 'Takeda', brand_name: 'Entyvio', inn: 'vedolizumab', atc_level3: 'L04AA', indication: 'Crohn\'s disease', approval_region: 'US/EU' },
      { company_name: 'Takeda', brand_name: 'Vyvanse', inn: 'lisdexamfetamine', atc_level3: 'N06BA', indication: 'ADHD', approval_region: 'US' },
      { company_name: 'Amgen', brand_name: 'Enbrel', inn: 'etanercept', atc_level3: 'L04AB', indication: 'Rheumatoid arthritis', approval_region: 'US/EU' },
      { company_name: 'Amgen', brand_name: 'Prolia', inn: 'denosumab', atc_level3: 'M05BX', indication: 'Osteoporosis', approval_region: 'US/EU' },
      { company_name: 'Bayer', brand_name: 'Xarelto', inn: 'rivaroxaban', atc_level3: 'B01AF', indication: 'Anticoagulant', approval_region: 'US/EU' },
      { company_name: 'Bayer', brand_name: 'Eylea', inn: 'aflibercept', atc_level3: 'S01LA', indication: 'AMD', approval_region: 'US/EU' },
      { company_name: 'Biogen', brand_name: 'Spinraza', inn: 'nusinersen', atc_level3: 'N07XX', indication: 'Spinal muscular atrophy', approval_region: 'US/EU' },
      { company_name: 'Biogen', brand_name: 'Tysabri', inn: 'natalizumab', atc_level3: 'L04AA', indication: 'Multiple sclerosis', approval_region: 'US/EU' },
      { company_name: 'Vertex Pharmaceuticals', brand_name: 'Trikafta', inn: null, atc_level3: 'R07AX', indication: 'Cystic fibrosis', approval_region: 'US/EU' },
      { company_name: 'Vertex Pharmaceuticals', brand_name: 'Kalydeco', inn: 'ivacaftor', atc_level3: 'R07AX', indication: 'Cystic fibrosis', approval_region: 'US/EU' },
      { company_name: 'Regeneron', brand_name: 'Eylea', inn: 'aflibercept', atc_level3: 'S01LA', indication: 'AMD', approval_region: 'US/EU' },
      { company_name: 'Regeneron', brand_name: 'Praluent', inn: 'alirocumab', atc_level3: 'C10AX', indication: 'Hypercholesterolemia', approval_region: 'US/EU' },
      { company_name: 'Novo Nordisk', brand_name: 'Ozempic', inn: 'semaglutide', atc_level3: 'A10BJ', indication: 'Type 2 diabetes; CV-risk reduction; weight-loss (off-label)', approval_region: 'US/EU' }
    ];

    // Insert products
    let productsAdded = 0;
    let productsUpdated = 0;
    let productsSkipped = 0;
    const missingCompanies = new Set();

    for (const product of productsData) {
      const companyId = findCompanyId(companyMap, product.company_name);
      
      if (companyId) {
        try {
          // Check if product exists
          const { data: existingProduct } = await supabase
            .from('product')
            .select('id')
            .eq('brand_name', product.brand_name)
            .eq('company_id', companyId)
            .maybeSingle();

          const productData = {
            brand_name: product.brand_name,
            inn: product.inn,
            company_id: companyId,
            atc_level3: product.atc_level3,
            indication: product.indication,
            approval_region: product.approval_region,
            status: 'Approved',
            updated_at: new Date().toISOString()
          };

          if (existingProduct) {
            const { error } = await supabase
              .from('product')
              .update(productData)
              .eq('id', existingProduct.id);

            if (error) {
              console.error(`Error updating product ${product.brand_name}:`, error);
            } else {
              productsUpdated++;
              console.log(`Updated: ${product.brand_name}`);
            }
          } else {
            const { error } = await supabase
              .from('product')
              .insert(productData);

            if (error) {
              console.error(`Error inserting product ${product.brand_name}:`, error);
            } else {
              productsAdded++;
              console.log(`Added: ${product.brand_name}`);
            }
          }
        } catch (error) {
          console.error(`Error processing product ${product.brand_name}:`, error);
          productsSkipped++;
        }
      } else {
        console.warn(`Company not found: "${product.company_name}" for product ${product.brand_name}`);
        missingCompanies.add(product.company_name);
        productsSkipped++;
      }
    }

    console.log(`Processing complete: ${productsAdded} added, ${productsUpdated} updated, ${productsSkipped} skipped`);
    
    if (missingCompanies.size > 0) {
      console.log('Missing companies:', Array.from(missingCompanies));
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully processed ${productsAdded} new products and updated ${productsUpdated} existing products. Skipped ${productsSkipped} products from missing companies.`,
      products_added: productsAdded,
      products_updated: productsUpdated,
      products_skipped: productsSkipped,
      missing_companies: Array.from(missingCompanies),
      total_processed: productsAdded + productsUpdated,
      available_companies: companies?.map(c => c.name) || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ingest-products-csv function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getCompanyVariations(name: string): string[] {
  const variations = [name];
  
  // Exact mappings based on your data
  const mappings: Record<string, string[]> = {
    'Merck & Co': ['Merck & Co.', 'Merck', 'MSD'],
    'Johnson & Johnson': ['J&J', 'Johnson and Johnson'],
    'Bristol Myers Squibb': ['BMS', 'Bristol-Myers Squibb'],
    'Vertex Pharmaceuticals': ['Vertex'],
    'Eli Lilly': ['Lilly', 'Eli Lilly and Company'],
    'Gilead Sciences': ['Gilead'],
    'Boehringer Ingelheim': ['BI'],
    'GSK': ['GlaxoSmithKline', 'GlaxoSmithKline plc'],
    'Novo Nordisk': ['Novo Nordisk A/S']
  };
  
  if (mappings[name]) {
    variations.push(...mappings[name]);
  }
  
  // Common variations
  if (name.includes('&')) {
    variations.push(name.replace('&', 'and'));
    variations.push(name.replace(' & ', ' and '));
  }
  
  if (name.includes(' and ')) {
    variations.push(name.replace(' and ', ' & '));
  }
  
  if (name.includes('.')) {
    variations.push(name.replace(/\./g, ''));
  }
  
  return [...new Set(variations)];
}

function findCompanyId(companyMap: Map<string, number>, companyName: string): number | null {
  // Try exact match first
  if (companyMap.has(companyName)) {
    return companyMap.get(companyName)!;
  }
  
  // Try fuzzy matching
  for (const [mappedName, id] of companyMap.entries()) {
    if (mappedName.toLowerCase().includes(companyName.toLowerCase()) ||
        companyName.toLowerCase().includes(mappedName.toLowerCase())) {
      return id;
    }
  }
  
  return null;
}
