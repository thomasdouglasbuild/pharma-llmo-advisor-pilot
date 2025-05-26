
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

    console.log('Starting CSV data ingestion...');

    // Companies data
    const companiesData = [
      { rank_2024: 1, name: 'Johnson & Johnson', hq_country: 'USA', sales_2024_bn: 53.46, ticker: 'JNJ' },
      { rank_2024: 2, name: 'Roche', hq_country: 'CHE', sales_2024_bn: 48.29, ticker: 'ROG' },
      { rank_2024: 3, name: 'Merck & Co.', hq_country: 'USA', sales_2024_bn: 47.44, ticker: 'MRK' },
      { rank_2024: 4, name: 'Pfizer', hq_country: 'USA', sales_2024_bn: 44.40, ticker: 'PFE' },
      { rank_2024: 5, name: 'AbbVie', hq_country: 'USA', sales_2024_bn: 42.89, ticker: 'ABBV' },
      { rank_2024: 6, name: 'Novartis', hq_country: 'CHE', sales_2024_bn: 41.88, ticker: 'NOVN' },
      { rank_2024: 7, name: 'Bristol Myers Squibb', hq_country: 'USA', sales_2024_bn: 37.55, ticker: 'BMY' },
      { rank_2024: 8, name: 'Sanofi', hq_country: 'FRA', sales_2024_bn: 33.20, ticker: 'SAN' },
      { rank_2024: 9, name: 'AstraZeneca', hq_country: 'GBR', sales_2024_bn: 32.78, ticker: 'AZN' },
      { rank_2024: 10, name: 'GSK', hq_country: 'GBR', sales_2024_bn: 30.31, ticker: 'GSK' },
      { rank_2024: 11, name: 'Eli Lilly', hq_country: 'USA', sales_2024_bn: 29.22, ticker: 'LLY' },
      { rank_2024: 12, name: 'Gilead Sciences', hq_country: 'USA', sales_2024_bn: 22.80, ticker: 'GILD' },
      { rank_2024: 13, name: 'Boehringer Ingelheim', hq_country: 'DEU', sales_2024_bn: 22.42, ticker: null },
      { rank_2024: 14, name: 'Takeda', hq_country: 'JPN', sales_2024_bn: 22.13, ticker: '4502' },
      { rank_2024: 15, name: 'Amgen', hq_country: 'USA', sales_2024_bn: 22.00, ticker: 'AMGN' },
      { rank_2024: 16, name: 'Novo Nordisk', hq_country: 'DNK', sales_2024_bn: 21.51, ticker: 'NOVO-B' },
      { rank_2024: 17, name: 'Bayer', hq_country: 'DEU', sales_2024_bn: 20.00, ticker: 'BAYN' },
      { rank_2024: 18, name: 'Otsuka', hq_country: 'JPN', sales_2024_bn: 13.42, ticker: '4578' },
      { rank_2024: 19, name: 'Teva', hq_country: 'ISR', sales_2024_bn: 13.00, ticker: 'TEVA' },
      { rank_2024: 20, name: 'CSL', hq_country: 'AUS', sales_2024_bn: 10.50, ticker: 'CSL' },
      { rank_2024: 21, name: 'Regeneron', hq_country: 'USA', sales_2024_bn: 10.40, ticker: 'REGN' },
      { rank_2024: 22, name: 'Servier', hq_country: 'FRA', sales_2024_bn: 9.80, ticker: null },
      { rank_2024: 23, name: 'Astellas', hq_country: 'JPN', sales_2024_bn: 9.60, ticker: '4503' },
      { rank_2024: 24, name: 'Vertex', hq_country: 'USA', sales_2024_bn: 9.30, ticker: 'VRTX' },
      { rank_2024: 25, name: 'Biogen', hq_country: 'USA', sales_2024_bn: 9.20, ticker: 'BIIB' },
      { rank_2024: 26, name: 'Daiichi Sankyo', hq_country: 'JPN', sales_2024_bn: 8.90, ticker: '4568' },
      { rank_2024: 27, name: 'Almirall', hq_country: 'ESP', sales_2024_bn: 8.20, ticker: 'ALM' },
      { rank_2024: 28, name: 'Grünenthal', hq_country: 'DEU', sales_2024_bn: 7.80, ticker: null },
      { rank_2024: 29, name: 'CSL Vifor', hq_country: 'CHE', sales_2024_bn: 7.60, ticker: null },
      { rank_2024: 30, name: 'Sumitomo Pharma', hq_country: 'JPN', sales_2024_bn: 7.30, ticker: '4506' },
      { rank_2024: 31, name: 'UCB', hq_country: 'BEL', sales_2024_bn: 7.10, ticker: 'UCB' },
      { rank_2024: 32, name: 'Organon', hq_country: 'USA', sales_2024_bn: 6.90, ticker: 'OGN' },
      { rank_2024: 33, name: 'Seagen', hq_country: 'USA', sales_2024_bn: 6.70, ticker: 'SGEN' },
      { rank_2024: 34, name: 'Moderna', hq_country: 'USA', sales_2024_bn: 6.60, ticker: 'MRNA' },
      { rank_2024: 35, name: 'BioNTech', hq_country: 'DEU', sales_2024_bn: 6.50, ticker: 'BNTX' },
      { rank_2024: 36, name: 'BeiGene', hq_country: 'CHN', sales_2024_bn: 6.30, ticker: 'BGNE' },
      { rank_2024: 37, name: 'Sun Pharma', hq_country: 'IND', sales_2024_bn: 6.10, ticker: 'SUNPHARMA' },
      { rank_2024: 38, name: 'Horizon Therapeutics', hq_country: 'IRL', sales_2024_bn: 5.95, ticker: 'HZNP' },
      { rank_2024: 39, name: 'Ipsen', hq_country: 'FRA', sales_2024_bn: 5.80, ticker: 'IPN' },
      { rank_2024: 40, name: 'Alexion Pharmaceuticals', hq_country: 'USA', sales_2024_bn: 5.60, ticker: null },
      { rank_2024: 41, name: 'Cipla', hq_country: 'IND', sales_2024_bn: 5.40, ticker: 'CIPLA' },
      { rank_2024: 42, name: 'Chugai', hq_country: 'CHE', sales_2024_bn: 5.30, ticker: '4519' },
      { rank_2024: 43, name: 'Zai Lab', hq_country: 'CHN', sales_2024_bn: 5.15, ticker: null },
      { rank_2024: 44, name: 'Galderma', hq_country: 'CHE', sales_2024_bn: 5.00, ticker: null },
      { rank_2024: 45, name: 'Lundbeck', hq_country: 'DNK', sales_2024_bn: 4.90, ticker: 'HLUN' },
      { rank_2024: 46, name: 'Ferring Pharma', hq_country: 'CHE', sales_2024_bn: 4.75, ticker: null },
      { rank_2024: 47, name: "Dr Reddy's", hq_country: 'IND', sales_2024_bn: 4.60, ticker: 'DRREDDY' },
      { rank_2024: 48, name: 'Leonardos Bio', hq_country: 'USA', sales_2024_bn: 4.50, ticker: null },
      { rank_2024: 49, name: 'Alnylam', hq_country: 'USA', sales_2024_bn: 4.40, ticker: 'ALNY' },
      { rank_2024: 50, name: 'Evotec', hq_country: 'DEU', sales_2024_bn: 4.30, ticker: 'EVT' }
    ];

    // Insert companies
    let companiesAdded = 0;
    for (const company of companiesData) {
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

    console.log(`Inserted ${companiesAdded} companies`);

    // Get companies for mapping
    const { data: companies } = await supabase.from('company').select('id, name');
    const companyMap = new Map(companies?.map(c => [c.name, c.id]) || []);

    // Products data
    const productsData = [
      { company_name: 'Johnson & Johnson', brand_name: 'Stelara', inn: 'ustekinumab', atc_level3: 'L04AC', indication: 'Psoriasis / Crohn', approval_region: 'US/EU' },
      { company_name: 'Johnson & Johnson', brand_name: 'Darzalex', inn: 'daratumumab', atc_level3: 'L01XC', indication: 'Myélome multiple', approval_region: 'US/EU' },
      { company_name: 'Roche', brand_name: 'Ocrevus', inn: 'ocrelizumab', atc_level3: 'L04AA', indication: 'Sclérose en plaques', approval_region: 'US/EU' },
      { company_name: 'Roche', brand_name: 'Hemlibra', inn: 'emicizumab', atc_level3: 'B02BX', indication: 'Hémophilie A', approval_region: 'US/EU' },
      { company_name: 'Merck & Co.', brand_name: 'Keytruda', inn: 'pembrolizumab', atc_level3: 'L01XC', indication: 'Cancers solides', approval_region: 'US/EU' },
      { company_name: 'Merck & Co.', brand_name: 'Gardasil 9', inn: null, atc_level3: 'J07BM', indication: 'Prévention HPV', approval_region: 'US/EU' },
      { company_name: 'Pfizer', brand_name: 'Paxlovid', inn: 'nirmatrelvir/ritonavir', atc_level3: 'J05AE', indication: 'COVID-19', approval_region: 'US/EU' },
      { company_name: 'Pfizer', brand_name: 'Ibrance', inn: 'palbociclib', atc_level3: 'L01XE', indication: 'Cancer du sein', approval_region: 'US/EU' },
      { company_name: 'AbbVie', brand_name: 'Humira', inn: 'adalimumab', atc_level3: 'L04AB', indication: 'Maladies auto-immunes', approval_region: 'US/EU' },
      { company_name: 'AbbVie', brand_name: 'Skyrizi', inn: 'risankizumab', atc_level3: 'L04AC', indication: 'Psoriasis / IBD', approval_region: 'US/EU' },
      { company_name: 'Novartis', brand_name: 'Cosentyx', inn: 'secukinumab', atc_level3: 'L04AC', indication: 'Psoriasis', approval_region: 'US/EU' },
      { company_name: 'Novartis', brand_name: 'Entresto', inn: 'sacubitril/valsartan', atc_level3: 'C09DX', indication: 'Insuffisance cardiaque', approval_region: 'US/EU' },
      { company_name: 'Bristol Myers Squibb', brand_name: 'Opdivo', inn: 'nivolumab', atc_level3: 'L01XC', indication: 'Oncologie', approval_region: 'US/EU' },
      { company_name: 'Bristol Myers Squibb', brand_name: 'Eliquis', inn: 'apixaban', atc_level3: 'B01AF', indication: 'Anticoagulant', approval_region: 'US/EU' },
      { company_name: 'Sanofi', brand_name: 'Dupixent', inn: 'dupilumab', atc_level3: 'D11AX', indication: 'Dermatite atopique', approval_region: 'US/EU' },
      { company_name: 'Sanofi', brand_name: 'Aubagio', inn: 'teriflunomide', atc_level3: 'L04AA', indication: 'Sclérose en plaques', approval_region: 'US/EU' },
      { company_name: 'AstraZeneca', brand_name: 'Tagrisso', inn: 'osimertinib', atc_level3: 'L01FE', indication: 'Cancer pulmonaire', approval_region: 'US/EU' },
      { company_name: 'AstraZeneca', brand_name: 'Farxiga', inn: 'dapagliflozin', atc_level3: 'A10BX', indication: 'Diabète / IC', approval_region: 'US/EU' },
      { company_name: 'GSK', brand_name: 'Shingrix', inn: null, atc_level3: 'J07BK', indication: 'Vaccin zona', approval_region: 'US/EU' },
      { company_name: 'GSK', brand_name: 'Trelegy Ellipta', inn: null, atc_level3: 'R03AL', indication: 'BPCO / Asthme', approval_region: 'US/EU' },
      { company_name: 'Eli Lilly', brand_name: 'Mounjaro', inn: 'tirzepatide', atc_level3: 'A10BX', indication: 'Diabète / Obésité', approval_region: 'US/EU' },
      { company_name: 'Eli Lilly', brand_name: 'Verzenio', inn: 'abemaciclib', atc_level3: 'L01XE', indication: 'Cancer du sein', approval_region: 'US/EU' },
      { company_name: 'Gilead Sciences', brand_name: 'Biktarvy', inn: null, atc_level3: 'J05AR', indication: 'VIH', approval_region: 'US/EU' },
      { company_name: 'Gilead Sciences', brand_name: 'Veklury', inn: 'remdesivir', atc_level3: 'J05AB', indication: 'COVID-19', approval_region: 'US/EU' },
      { company_name: 'Boehringer Ingelheim', brand_name: 'Jardiance', inn: 'empagliflozin', atc_level3: 'A10BX', indication: 'Diabète / IC', approval_region: 'US/EU' },
      { company_name: 'Boehringer Ingelheim', brand_name: 'Ofev', inn: 'nintedanib', atc_level3: 'L01EX', indication: 'Fibrose pulmonaire', approval_region: 'US/EU' },
      { company_name: 'Takeda', brand_name: 'Entyvio', inn: 'vedolizumab', atc_level3: 'L04AA', indication: 'Maladie de Crohn', approval_region: 'US/EU' },
      { company_name: 'Takeda', brand_name: 'Vyvanse', inn: 'lisdexamfetamine', atc_level3: 'N06BA', indication: 'TDAH', approval_region: 'US' },
      { company_name: 'Amgen', brand_name: 'Enbrel', inn: 'etanercept', atc_level3: 'L04AB', indication: 'Polyarthrite rhumatoïde', approval_region: 'US/EU' },
      { company_name: 'Amgen', brand_name: 'Prolia', inn: 'denosumab', atc_level3: 'M05BX', indication: 'Ostéoporose', approval_region: 'US/EU' },
      { company_name: 'Novo Nordisk', brand_name: 'Ozempic', inn: 'semaglutide', atc_level3: 'A10BJ', indication: 'Diabète / Obésité', approval_region: 'US/EU' },
      { company_name: 'Novo Nordisk', brand_name: 'Levemir', inn: 'insulin detemir', atc_level3: 'A10AE', indication: 'Diabète', approval_region: 'US/EU' },
      { company_name: 'Bayer', brand_name: 'Xarelto', inn: 'rivaroxaban', atc_level3: 'B01AF', indication: 'Anticoagulant', approval_region: 'US/EU' },
      { company_name: 'Bayer', brand_name: 'Eylea', inn: 'aflibercept', atc_level3: 'S01LA', indication: 'DMLA', approval_region: 'US/EU' },
      { company_name: 'Otsuka', brand_name: 'Abilify', inn: 'aripiprazole', atc_level3: 'N05AX', indication: 'Schizophrénie', approval_region: 'US/EU' },
      { company_name: 'Otsuka', brand_name: 'Samsca', inn: 'tolvaptan', atc_level3: 'C03', indication: 'Hyponatrémie', approval_region: 'US' },
      { company_name: 'Teva', brand_name: 'Copaxone', inn: 'glatiramer acetate', atc_level3: 'L03AX', indication: 'Sclérose en plaques', approval_region: 'US/EU' },
      { company_name: 'Teva', brand_name: 'Austedo', inn: 'deutetrabenazine', atc_level3: 'N07', indication: 'Mouvements involontaires', approval_region: 'US' },
      { company_name: 'CSL', brand_name: 'Hizentra', inn: null, atc_level3: 'J06BD', indication: 'Déficit immunitaire', approval_region: 'US/EU' },
      { company_name: 'CSL', brand_name: 'Hemgenix', inn: null, atc_level3: 'B02BD', indication: 'Thérapie génique hémophilie B', approval_region: 'US/EU' },
      { company_name: 'Regeneron', brand_name: 'Eylea', inn: 'aflibercept', atc_level3: 'S01LA', indication: 'DMLA', approval_region: 'US/EU' },
      { company_name: 'Regeneron', brand_name: 'Praluent', inn: 'alirocumab', atc_level3: 'C10AX', indication: 'Hypercholestérolémie', approval_region: 'US/EU' },
      { company_name: 'Servier', brand_name: 'Januvia', inn: 'sitagliptin', atc_level3: 'A10BH', indication: 'Diabète T2', approval_region: 'EU' },
      { company_name: 'Servier', brand_name: 'Oncaspar', inn: 'pegaspargase', atc_level3: 'L01XX', indication: 'Leucémie aigüe', approval_region: 'EU' },
      { company_name: 'Astellas', brand_name: 'Padcev', inn: 'enfortumab vedotin', atc_level3: 'L01XC', indication: 'Cancer urothélial', approval_region: 'US' },
      { company_name: 'Astellas', brand_name: 'Xtandi', inn: 'apalutamide', atc_level3: 'L02BB', indication: 'Cancer prostate', approval_region: 'US/EU' },
      { company_name: 'Vertex', brand_name: 'Trikafta', inn: null, atc_level3: 'R07AX', indication: 'Mucoviscidose', approval_region: 'US/EU' },
      { company_name: 'Vertex', brand_name: 'Kalydeco', inn: 'ivacaftor', atc_level3: 'R07AX', indication: 'Mucoviscidose', approval_region: 'US/EU' },
      { company_name: 'Biogen', brand_name: 'Spinraza', inn: 'nusinersen', atc_level3: 'N07XX', indication: 'Atrophie spinale', approval_region: 'US/EU' },
      { company_name: 'Biogen', brand_name: 'Tysabri', inn: 'natalizumab', atc_level3: 'L04AA', indication: 'Sclérose en plaques', approval_region: 'US/EU' },
      { company_name: 'Daiichi Sankyo', brand_name: 'Enhertu', inn: 'trastuzumab deruxtecan', atc_level3: 'L01XC', indication: 'Cancer sein', approval_region: 'US/EU' },
      { company_name: 'Daiichi Sankyo', brand_name: 'Edoxaban', inn: 'edoxaban', atc_level3: 'B01AF', indication: 'Anticoagulant', approval_region: 'US/EU' },
      { company_name: 'Almirall', brand_name: 'Ilumetri', inn: 'tildrakizumab', atc_level3: 'L04AC', indication: 'Psoriasis', approval_region: 'EU' },
      { company_name: 'Almirall', brand_name: 'Skilarence', inn: 'dimethyl fumarate', atc_level3: 'L04AX', indication: 'Psoriasis', approval_region: 'EU' },
      { company_name: 'Grünenthal', brand_name: 'Palexia', inn: 'tapentadol', atc_level3: 'N02AX', indication: 'Douleur chronique', approval_region: 'EU' },
      { company_name: 'Grünenthal', brand_name: 'Qutenza', inn: 'capsaicin', atc_level3: 'M02AB', indication: 'Neuropathie', approval_region: 'EU' },
      { company_name: 'CSL Vifor', brand_name: 'Ferinject', inn: 'feric carboxymaltose', atc_level3: 'B03AC', indication: 'Carence martiale', approval_region: 'US/EU' },
      { company_name: 'CSL Vifor', brand_name: 'Veltassa', inn: 'patiromer', atc_level3: 'V03AE', indication: 'Hyperkaliémie', approval_region: 'US/EU' },
      { company_name: 'Sumitomo Pharma', brand_name: 'Latuda', inn: 'lurasidone', atc_level3: 'N05AE', indication: 'Schizophrénie/THAB', approval_region: 'US/EU' },
      { company_name: 'Sumitomo Pharma', brand_name: 'Trulicity', inn: 'dulaglutide', atc_level3: 'A10BJ', indication: 'Diabète T2', approval_region: 'US/EU' },
      { company_name: 'UCB', brand_name: 'Cimzia', inn: 'certolizumab pegol', atc_level3: 'L04AB', indication: 'Maladies inflammatoires', approval_region: 'US/EU' },
      { company_name: 'UCB', brand_name: 'Vimpat', inn: 'brivaracetam', atc_level3: 'N03AX', indication: 'Épilepsie', approval_region: 'US/EU' },
      { company_name: 'Organon', brand_name: 'NuvaRing', inn: null, atc_level3: 'G02BB', indication: 'Contraception', approval_region: 'US/EU' },
      { company_name: 'Organon', brand_name: 'Follistim', inn: 'follitropin beta', atc_level3: 'G03GA', indication: 'Fertilité', approval_region: 'US/EU' },
      { company_name: 'Seagen', brand_name: 'Adcetris', inn: 'brentuximab vedotin', atc_level3: 'L01XC', indication: 'Lymphome', approval_region: 'US/EU' },
      { company_name: 'Seagen', brand_name: 'Padcev', inn: 'enfortumab vedotin', atc_level3: 'L01XC', indication: 'Cancer urothélial', approval_region: 'US/EU' },
      { company_name: 'Moderna', brand_name: 'Spikevax', inn: null, atc_level3: 'J07BX', indication: 'vaccin COVID-19', approval_region: 'US/EU' },
      { company_name: 'Moderna', brand_name: 'Flu-mRNA', inn: null, atc_level3: 'J07BB', indication: 'vaccin grippe (phase III)', approval_region: 'US/EU' },
      { company_name: 'BioNTech', brand_name: 'Comirnaty', inn: null, atc_level3: 'J07BX', indication: 'vaccin COVID-19', approval_region: 'US/EU' },
      { company_name: 'BioNTech', brand_name: 'BNT211', inn: null, atc_level3: 'L01XY', indication: 'Car T (essai)', approval_region: 'US' },
      { company_name: 'BeiGene', brand_name: 'Brukinsa', inn: 'zanubrutinib', atc_level3: 'L01EE', indication: 'Lymphome', approval_region: 'US/EU' },
      { company_name: 'BeiGene', brand_name: 'Tislelizumab', inn: 'tislelizumab', atc_level3: 'L01XC', indication: 'Cancers solides', approval_region: 'CN' },
      { company_name: 'Sun Pharma', brand_name: 'Ilumya', inn: 'tildrakizumab', atc_level3: 'L04AC', indication: 'Psoriasis', approval_region: 'US/EU' },
      { company_name: 'Sun Pharma', brand_name: 'Cequa', inn: 'cyclosporine', atc_level3: 'S01XA', indication: 'Sécheresse oculaire', approval_region: 'US' },
      { company_name: 'Horizon Therapeutics', brand_name: 'Tepezza', inn: 'teprotumumab', atc_level3: 'L04AC', indication: 'Ophtalmopathie TED', approval_region: 'US' },
      { company_name: 'Horizon Therapeutics', brand_name: 'Krystexxa', inn: 'pegloticase', atc_level3: 'M04AX', indication: 'Goutte tophacée', approval_region: 'US' },
      { company_name: 'Ipsen', brand_name: 'Decapeptyl', inn: 'triptorelin', atc_level3: 'L02AE', indication: 'Cancer prostate', approval_region: 'EU' },
      { company_name: 'Ipsen', brand_name: 'Cabot', inn: 'cabozantinib', atc_level3: 'L01XE', indication: 'Cancer thyroïde', approval_region: 'EU' },
      { company_name: 'Alexion Pharmaceuticals', brand_name: 'Soliris', inn: 'eculizumab', atc_level3: 'L04AA', indication: 'HPN aHUS', approval_region: 'US/EU' },
      { company_name: 'Alexion Pharmaceuticals', brand_name: 'Ultomiris', inn: 'ravilizumab', atc_level3: 'L04AA', indication: 'HPN aHUS', approval_region: 'US/EU' },
      { company_name: 'Cipla', brand_name: 'Abraxane', inn: 'paclitaxel', atc_level3: 'L01CD', indication: 'Oncologie', approval_region: 'IN' },
      { company_name: 'Cipla', brand_name: 'Duovir', inn: 'lamivudine/zidovudine', atc_level3: 'J05AR', indication: 'VIH', approval_region: 'IN' },
      { company_name: 'Chugai', brand_name: 'Actemra', inn: 'tocilizumab', atc_level3: 'L04AC', indication: 'Polyarthrite', approval_region: 'JP' },
      { company_name: 'Chugai', brand_name: 'Evrysdi', inn: 'risdiplam', atc_level3: 'N07XX', indication: 'Atrophie spinale', approval_region: 'US/EU' },
      { company_name: 'Zai Lab', brand_name: 'Zephyr', inn: 'zefrelimab', atc_level3: 'L04AC', indication: 'Inflammation', approval_region: 'CN' },
      { company_name: 'Zai Lab', brand_name: 'Repotrectinib', inn: 'repotrectinib', atc_level3: 'L01EX', indication: 'Cancer pulmonaire', approval_region: 'CN' },
      { company_name: 'Galderma', brand_name: 'Epiduo', inn: 'adapalene/benzoyl peroxide', atc_level3: 'D10AX', indication: 'Acné', approval_region: 'US/EU' },
      { company_name: 'Galderma', brand_name: 'Soolantra', inn: 'ivermectin', atc_level3: 'D11AX', indication: 'Rosacée', approval_region: 'US/EU' },
      { company_name: 'Lundbeck', brand_name: 'Brintellix', inn: 'vortioxetine', atc_level3: 'N06AX', indication: 'Dépression', approval_region: 'US/EU' },
      { company_name: 'Lundbeck', brand_name: 'Rexulti', inn: 'brexpiprazole', atc_level3: 'N05AX', indication: 'Schizophrénie', approval_region: 'US/EU' },
      { company_name: 'Ferring Pharma', brand_name: 'Rekovelle', inn: 'follitropin delta', atc_level3: 'G03GA', indication: 'Fertilité', approval_region: 'EU' },
      { company_name: 'Ferring Pharma', brand_name: 'Minirin', inn: 'desmopressin', atc_level3: 'H01BA', indication: 'Diabète insipide', approval_region: 'EU' },
      { company_name: "Dr Reddy's", brand_name: 'Revlimid', inn: 'lenalidomide', atc_level3: 'L04AX', indication: 'Onco générique', approval_region: 'IN' },
      { company_name: "Dr Reddy's", brand_name: 'Sputnik V', inn: null, atc_level3: 'J07BX', indication: 'Vaccin COVID-19', approval_region: 'IN' },
      { company_name: 'Leonardos Bio', brand_name: 'Leqbate', inn: 'pemivibart', atc_level3: 'L01XX', indication: 'Tumor-agnostic', approval_region: 'US' },
      { company_name: 'Leonardos Bio', brand_name: 'Resvimod', inn: 'resvimod', atc_level3: 'L04AX', indication: 'Hépatite auto-immune', approval_region: 'US' },
      { company_name: 'Alnylam', brand_name: 'Onpattro', inn: 'patisiran', atc_level3: 'N07XX', indication: 'ATTR amyloïdose', approval_region: 'US/EU' },
      { company_name: 'Alnylam', brand_name: 'Givlaari', inn: 'givosiran', atc_level3: 'B06AX', indication: 'Porphyrie', approval_region: 'US/EU' },
      { company_name: 'Evotec', brand_name: 'EVT601', inn: null, atc_level3: 'L04AC', indication: 'Auto-immune (phase II)', approval_region: 'EU' },
      { company_name: 'Evotec', brand_name: 'EVT801', inn: null, atc_level3: 'L01EX', indication: 'Onco (phase II)', approval_region: 'EU' }
    ];

    // Insert products
    let productsAdded = 0;
    for (const product of productsData) {
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
            approval_region: product.approval_region,
            status: 'Approved',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'brand_name,company_id'
          });

        if (error) {
          console.error(`Error inserting product ${product.brand_name}:`, error);
        } else {
          productsAdded++;
        }
      } else {
        console.warn(`Company not found: ${product.company_name}`);
      }
    }

    console.log(`Successfully ingested ${companiesAdded} companies and ${productsAdded} products`);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully ingested ${companiesAdded} companies and ${productsAdded} products`,
      companies_added: companiesAdded,
      products_added: productsAdded
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ingest-csv-data function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
