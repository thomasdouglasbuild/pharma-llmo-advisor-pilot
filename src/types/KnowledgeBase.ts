
export type KnowledgeBaseItem = string[];

export interface KnowledgeBase {
  content_success_pyramid: {
    content_structure: KnowledgeBaseItem;
    authority_signals: KnowledgeBaseItem;
    technical_infrastructure: KnowledgeBaseItem;
  };
  cape_framework: {
    content: KnowledgeBaseItem;
    authority: KnowledgeBaseItem;
    performance: KnowledgeBaseItem;
    entity: KnowledgeBaseItem;
  };
  best_practices_top10: KnowledgeBaseItem;
  off_page_tactics_fast: KnowledgeBaseItem;
  metrics_to_track: KnowledgeBaseItem;
}

export interface KnowledgeBaseLoader {
  getKnowledgeBase: () => KnowledgeBase;
  getVersionDate: () => string;
  getTips: (tags: string[]) => string[];
  suggestImprovements: (analysisResults: AnswerAnalysis) => Recommendation[];
}

export interface AnswerAnalysis {
  accuracy: number;
  sentiment: number;
  sources: string[];
  sourcesQuality: number;
  contentGaps: string[];
  technicalIssues: string[];
}

export interface Recommendation {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'content' | 'authority' | 'technical';
  kbSources: string[];
}

export interface Drug {
  id: string;
  name: string;
  company: string;
  category: string;
  repuScore: number;
  llmMentions: number;
  sentimentScore: number;
  accuracyScore: number;
  sourcesScore: number;
  recommendations: Recommendation[];
}

export interface ComparisonResult {
  productName: string;
  repuScore: number;
  accuracy: number;
  sentiment: number;
  sources: string[];
  strengths: string[];
  weaknesses: string[];
}
