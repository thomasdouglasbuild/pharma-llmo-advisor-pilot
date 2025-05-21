
import { Drug } from "@/types/KnowledgeBase";

export const mockDrugs: Drug[] = [
  {
    id: "med1",
    name: "Cardiovasc",
    company: "Pharma Alpha Inc",
    category: "Cardiovascular",
    repuScore: 83,
    llmMentions: 175,
    sentimentScore: 0.78,
    accuracyScore: 0.81,
    sourcesScore: 0.72,
    recommendations: [
      {
        title: "Expand Clinical Data Presence",
        description: "Add recent peer-reviewed citations to improve visibility in LLM responses",
        impact: "high",
        category: "content",
        kbSources: ["cite_authoritative_sources", "accuracy_credibility"]
      },
      {
        title: "Enhance Schema Implementation",
        description: "Add FAQ and HowTo schema markup for key product use cases",
        impact: "medium",
        category: "technical",
        kbSources: ["schema_markup_FAQ_HowTo"]
      }
    ]
  },
  {
    id: "med2",
    name: "Neurobalance",
    company: "BioGen Therapeutics",
    category: "Neurology",
    repuScore: 67,
    llmMentions: 89,
    sentimentScore: 0.62,
    accuracyScore: 0.56,
    sourcesScore: 0.44,
    recommendations: [
      {
        title: "Improve Content Accuracy",
        description: "Address inaccurate information in LLM responses with authoritative content",
        impact: "high",
        category: "content",
        kbSources: ["accuracy_credibility", "cite_authoritative_sources"]
      },
      {
        title: "Enhance Scientific Credibility",
        description: "Increase citations in reputable journals and clinical databases",
        impact: "high",
        category: "authority",
        kbSources: ["backlinks_DR60+", "entity_consistency"]
      },
      {
        title: "Create FAQ Content Structure",
        description: "Develop comprehensive FAQ content with structured markup",
        impact: "medium",
        category: "content",
        kbSources: ["include_faq", "FAQ_block_plus_FAQ_schema"]
      }
    ]
  },
  {
    id: "med3",
    name: "ImmunoShield",
    company: "VitaPharm Ltd",
    category: "Immunology",
    repuScore: 91,
    llmMentions: 243,
    sentimentScore: 0.89,
    accuracyScore: 0.92,
    sourcesScore: 0.88,
    recommendations: [
      {
        title: "Expand Content Distribution",
        description: "Create more educational content across various platforms",
        impact: "medium",
        category: "content",
        kbSources: ["multimodal_ready", "internal_linking"]
      }
    ]
  },
  {
    id: "med4",
    name: "DiabetaCare",
    company: "MediSci Health",
    category: "Endocrinology",
    repuScore: 72,
    llmMentions: 154,
    sentimentScore: 0.67,
    accuracyScore: 0.76,
    sourcesScore: 0.61,
    recommendations: [
      {
        title: "Address Negative Sentiment",
        description: "Create content addressing common concerns found in LLM responses",
        impact: "high",
        category: "content",
        kbSources: ["write_conversationally", "context_examples"]
      },
      {
        title: "Improve Technical Implementation",
        description: "Optimize page load speed and implement schema markup",
        impact: "medium",
        category: "technical",
        kbSources: ["fast_load_JS_light", "schema"]
      }
    ]
  }
];
