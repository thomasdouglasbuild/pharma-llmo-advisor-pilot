export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      answer: {
        Row: {
          answer_text: string | null
          created_at: string | null
          id: number
          latency_ms: number | null
          llm_run_id: number | null
          position: number | null
          question: string
          raw_json: Json | null
          tokens_completion: number | null
          tokens_prompt: number | null
        }
        Insert: {
          answer_text?: string | null
          created_at?: string | null
          id?: number
          latency_ms?: number | null
          llm_run_id?: number | null
          position?: number | null
          question: string
          raw_json?: Json | null
          tokens_completion?: number | null
          tokens_prompt?: number | null
        }
        Update: {
          answer_text?: string | null
          created_at?: string | null
          id?: number
          latency_ms?: number | null
          llm_run_id?: number | null
          position?: number | null
          question?: string
          raw_json?: Json | null
          tokens_completion?: number | null
          tokens_prompt?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "answer_llm_run_id_fkey"
            columns: ["llm_run_id"]
            isOneToOne: false
            referencedRelation: "llm_run"
            referencedColumns: ["id"]
          },
        ]
      }
      company: {
        Row: {
          hq_country: string | null
          id: number
          name: string
          rank_2024: number | null
          sales_2024_bn: number | null
          ticker: string | null
          updated_at: string | null
        }
        Insert: {
          hq_country?: string | null
          id?: number
          name: string
          rank_2024?: number | null
          sales_2024_bn?: number | null
          ticker?: string | null
          updated_at?: string | null
        }
        Update: {
          hq_country?: string | null
          id?: number
          name?: string
          rank_2024?: number | null
          sales_2024_bn?: number | null
          ticker?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      competitor: {
        Row: {
          created_at: string | null
          id: number
          indication_score: number | null
          product_a: number | null
          product_b: number | null
          shared_atc: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          indication_score?: number | null
          product_a?: number | null
          product_b?: number | null
          shared_atc?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          indication_score?: number | null
          product_a?: number | null
          product_b?: number | null
          shared_atc?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_product_a_fkey"
            columns: ["product_a"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_product_b_fkey"
            columns: ["product_b"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_run: {
        Row: {
          id: number
          json_result: Json | null
          model_name: string | null
          product_id: number | null
          question_set_id: string | null
          run_started_at: string | null
        }
        Insert: {
          id?: number
          json_result?: Json | null
          model_name?: string | null
          product_id?: number | null
          question_set_id?: string | null
          run_started_at?: string | null
        }
        Update: {
          id?: number
          json_result?: Json | null
          model_name?: string | null
          product_id?: number | null
          question_set_id?: string | null
          run_started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "llm_run_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product: {
        Row: {
          approval_region: string | null
          atc_level3: string | null
          brand_name: string | null
          company_id: number | null
          first_approval: string | null
          id: number
          indication: string | null
          inn: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approval_region?: string | null
          atc_level3?: string | null
          brand_name?: string | null
          company_id?: number | null
          first_approval?: string | null
          id?: number
          indication?: string | null
          inn?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_region?: string | null
          atc_level3?: string | null
          brand_name?: string | null
          company_id?: number | null
          first_approval?: string | null
          id?: number
          indication?: string | null
          inn?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation: {
        Row: {
          category: string | null
          created_at: string | null
          id: number
          llm_run_id: number | null
          priority: number | null
          tip: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: number
          llm_run_id?: number | null
          priority?: number | null
          tip: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: number
          llm_run_id?: number | null
          priority?: number | null
          tip?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_llm_run_id_fkey"
            columns: ["llm_run_id"]
            isOneToOne: false
            referencedRelation: "llm_run"
            referencedColumns: ["id"]
          },
        ]
      }
      score: {
        Row: {
          accuracy: number | null
          created_at: string | null
          id: number
          llm_run_id: number | null
          reference_quality: number | null
          sentiment: number | null
          total_score: number | null
          visibility: number | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          id?: number
          llm_run_id?: number | null
          reference_quality?: number | null
          sentiment?: number | null
          total_score?: number | null
          visibility?: number | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          id?: number
          llm_run_id?: number | null
          reference_quality?: number | null
          sentiment?: number | null
          total_score?: number | null
          visibility?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "score_llm_run_id_fkey"
            columns: ["llm_run_id"]
            isOneToOne: false
            referencedRelation: "llm_run"
            referencedColumns: ["id"]
          },
        ]
      }
      source: {
        Row: {
          answer_id: number | null
          authority_score: number | null
          created_at: string | null
          domain: string | null
          id: number
          sentiment: number | null
          title: string | null
          url: string | null
        }
        Insert: {
          answer_id?: number | null
          authority_score?: number | null
          created_at?: string | null
          domain?: string | null
          id?: number
          sentiment?: number | null
          title?: string | null
          url?: string | null
        }
        Update: {
          answer_id?: number | null
          authority_score?: number | null
          created_at?: string | null
          domain?: string | null
          id?: number
          sentiment?: number | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answer"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_recommendations: {
        Args: { p_run_id: number }
        Returns: undefined
      }
      compute_scores: {
        Args: { p_run_id: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
