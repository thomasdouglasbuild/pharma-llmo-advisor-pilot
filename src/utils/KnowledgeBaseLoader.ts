import { KnowledgeBase, KnowledgeBaseLoader, AnswerAnalysis, Recommendation } from "@/types/KnowledgeBase";
import { knowledgeBaseLLMO } from "@/data/knowledge_base_llmo";

export class KBLoader implements KnowledgeBaseLoader {
  private kb: KnowledgeBase;
  private versionDate: string;
  
  constructor(initialKB: KnowledgeBase = knowledgeBaseLLMO) {
    this.kb = initialKB;
    this.versionDate = "2025-05-01"; // Default version date
  }
  
  getKnowledgeBase(): KnowledgeBase {
    return this.kb;
  }
  
  getVersionDate(): string {
    return this.versionDate;
  }
  
  getTips(tags: string[]): string[] {
    const tips: string[] = [];
    
    // Flatten the knowledge base for easier searching
    const flattenedTips = this.flattenKnowledgeBase();
    
    // Find tips that match the given tags
    for (const tag of tags) {
      const matchingTips = flattenedTips.filter(tip => 
        tip.toLowerCase().includes(tag.toLowerCase())
      );
      tips.push(...matchingTips);
    }
    
    // Remove duplicates
    return [...new Set(tips)];
  }
  
  suggestImprovements(analysisResults: AnswerAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Content recommendations
    if (analysisResults.accuracy < 0.7) {
      recommendations.push({
        title: "Improve Content Accuracy",
        description: "Add recent peer-reviewed citations in plain HTML and embed FAQ schema to enhance credibility",
        impact: "high",
        category: "content",
        kbSources: ["accuracy_credibility", "schema_markup_FAQ_HowTo"]
      });
    }
    
    // Authority recommendations
    if (analysisResults.sourcesQuality < 0.6) {
      recommendations.push({
        title: "Enhance Authority Signals",
        description: "Cite authoritative sources like PubMed and include expert quotes",
        impact: "high",
        category: "authority",
        kbSources: ["cite_authoritative_sources", "expert_quotes_HARO"]
      });
    }
    
    // Technical recommendations
    if (analysisResults.technicalIssues.includes("schema_missing")) {
      recommendations.push({
        title: "Implement Technical Schema",
        description: "Add FAQ and HowTo schema markup to improve LLM visibility",
        impact: "medium",
        category: "technical",
        kbSources: ["schema_markup_FAQ_HowTo"]
      });
    }
    
    // Content gaps
    if (analysisResults.contentGaps.length > 0) {
      recommendations.push({
        title: "Fill Content Gaps",
        description: "Add structured content with H2/H3 headings addressing identified content gaps",
        impact: "medium",
        category: "content",
        kbSources: ["H2/H3_question_headings", "semantic_keyword_clusters"]
      });
    }
    
    return recommendations;
  }
  
  private flattenKnowledgeBase(): string[] {
    const flattened: string[] = [];
    
    // Content success pyramid
    flattened.push(...this.kb.content_success_pyramid.content_structure);
    flattened.push(...this.kb.content_success_pyramid.authority_signals);
    flattened.push(...this.kb.content_success_pyramid.technical_infrastructure);
    
    // CAPE framework
    flattened.push(...this.kb.cape_framework.content);
    flattened.push(...this.kb.cape_framework.authority);
    flattened.push(...this.kb.cape_framework.performance);
    flattened.push(...this.kb.cape_framework.entity);
    
    // Other categories
    flattened.push(...this.kb.best_practices_top10);
    flattened.push(...this.kb.off_page_tactics_fast);
    flattened.push(...this.kb.metrics_to_track);
    
    return flattened;
  }
}

export const kbLoader = new KBLoader();
