
import { Database } from "./db";

export type Company = Database["public"]["Tables"]["company"]["Row"];
export type Product = Database["public"]["Tables"]["product"]["Row"] & {
  company?: Company;
};
export type Competitor = Database["public"]["Tables"]["competitor"]["Row"] & {
  product_a_data?: Product;
  product_b_data?: Product;
};
export type LlmRun = Database["public"]["Tables"]["llm_run"]["Row"] & {
  product?: Product;
};
