
export interface Company {
  id: number;
  rank_2024: number;
  name: string;
  hq_country: string;
  sales_2024_bn: number;
  ticker: string;
  updated_at: string;
}

export interface Product {
  id: number;
  company_id: number;
  inn: string;
  brand_name: string;
  atc_level3: string;
  indication: string;
  approval_region: string;
  first_approval: string;
  status: string;
  updated_at: string;
  company?: Company;
}

export interface Competitor {
  id: number;
  product_a: number;
  product_b: number;
  shared_atc: string;
  indication_score: number;
  created_at: string;
  product_a_data?: Product;
  product_b_data?: Product;
}

export interface LlmRun {
  id: number;
  product_id: number;
  model_name: string;
  question_set_id: string;
  run_started_at: string;
  json_result: any;
  product?: Product;
}
