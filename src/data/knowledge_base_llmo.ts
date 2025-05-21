
import { KnowledgeBase } from "@/types/KnowledgeBase";

export const knowledgeBaseLLMO: KnowledgeBase = {
  content_success_pyramid: {
    content_structure: [
      "write_concise_first_answer",
      "conversational_tone",
      "H2/H3_question_headings",
      "FAQ_block_plus_FAQ_schema",
      "semantic_keyword_clusters"
    ],
    authority_signals: [
      "cite_authoritative_sources",
      "digital_PR_original_data",
      "wikipedia_reddit_presence",
      "expert_quotes_HARO"
    ],
    technical_infrastructure: [
      "schema_markup_FAQ_HowTo",
      "fast_load_JS_light",
      "internal_linking_descriptive_anchor",
      "https_mobile",
      "common_crawl_inclusion"
    ]
  },
  cape_framework: {
    content: ["concise", "chunked", "upfront_summary"],
    authority: ["backlinks_DR60+", "entity_consistency", "proprietary_stats"],
    performance: ["schema", "crawlability", "RAG_chunking"],
    entity: ["brand_topic_association", "about_page_optimized"]
  },
  best_practices_top10: [
    "write_conversationally",
    "clear_headings",
    "include_faq",
    "concise_answers",
    "semantic_keywords",
    "accuracy_credibility",
    "context_examples",
    "rich_media_alt_text",
    "internal_linking",
    "multimodal_ready"
  ],
  off_page_tactics_fast: [
    "data_driven_mentions",
    "expert_quotes",
    "reddit_AMA",
    "wikipedia_wikidata"
  ],
  metrics_to_track: [
    "ai_referrals",
    "llm_inclusion_rate",
    "corpus_presence",
    "topical_vector_coverage",
    "brand_entity_strength"
  ]
};
