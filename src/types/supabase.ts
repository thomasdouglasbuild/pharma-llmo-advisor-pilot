
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      company: {
        Row: {
          id: number
          rank_2024: number | null
          name: string
          hq_country: string | null
          sales_2024_bn: number | null
          ticker: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          rank_2024?: number | null
          name: string
          hq_country?: string | null
          sales_2024_bn?: number | null
          ticker?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          rank_2024?: number | null
          name?: string
          hq_country?: string | null
          sales_2024_bn?: number | null
          ticker?: string | null
          updated_at?: string | null
        }
      }
      product: {
        Row: {
          id: number
          company_id: number | null
          inn: string | null
          brand_name: string | null
          atc_level3: string | null
          indication: string | null
          approval_region: string | null
          first_approval: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          company_id?: number | null
          inn?: string | null
          brand_name?: string | null
          atc_level3?: string | null
          indication?: string | null
          approval_region?: string | null
          first_approval?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          company_id?: number | null
          inn?: string | null
          brand_name?: string | null
          atc_level3?: string | null
          indication?: string | null
          approval_region?: string | null
          first_approval?: string | null
          status?: string | null
          updated_at?: string | null
        }
      }
      competitor: {
        Row: {
          id: number
          product_a: number | null
          product_b: number | null
          shared_atc: string | null
          indication_score: number | null
          created_at: string | null
        }
        Insert: {
          id?: number
          product_a?: number | null
          product_b?: number | null
          shared_atc?: string | null
          indication_score?: number | null
          created_at?: string | null
        }
        Update: {
          id?: number
          product_a?: number | null
          product_b?: number | null
          shared_atc?: string | null
          indication_score?: number | null
          created_at?: string | null
        }
      }
      llm_run: {
        Row: {
          id: number
          product_id: number | null
          model_name: string | null
          question_set_id: string | null
          run_started_at: string | null
          json_result: Json | null
        }
        Insert: {
          id?: number
          product_id?: number | null
          model_name?: string | null
          question_set_id?: string | null
          run_started_at?: string | null
          json_result?: Json | null
        }
        Update: {
          id?: number
          product_id?: number | null
          model_name?: string | null
          question_set_id?: string | null
          run_started_at?: string | null
          json_result?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
