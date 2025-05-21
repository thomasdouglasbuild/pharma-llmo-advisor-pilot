
import { cn } from '@/lib/utils';
import { Recommendation } from '@/types/KnowledgeBase';
import React from 'react';

interface RecommendationCardProps {
  recommendation: Recommendation;
  className?: string;
}

const RecommendationCard = ({ recommendation, className }: RecommendationCardProps) => {
  const { title, description, impact, category, kbSources } = recommendation;
  
  // Determine impact styling
  const impactStyles = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-blue-50 text-blue-700 border-blue-200",
  };
  
  // Determine category styling
  const categoryStyles = {
    content: "bg-indigo-50 text-indigo-700 border-indigo-200",
    authority: "bg-purple-50 text-purple-700 border-purple-200",
    technical: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  
  return (
    <div className={cn(
      "p-4 rounded-lg shadow-sm bg-white border border-gray-100",
      className
    )}>
      <div className="flex justify-between items-start gap-2">
        <h3 className="text-base font-medium text-gray-800">{title}</h3>
        <div className={cn(
          "px-2 py-0.5 rounded-full text-xs font-medium",
          impactStyles[impact]
        )}>
          {impact.charAt(0).toUpperCase() + impact.slice(1)} Impact
        </div>
      </div>
      
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      
      <div className="mt-3 flex items-center justify-between">
        <div className={cn(
          "px-2 py-0.5 rounded-full text-xs font-medium",
          categoryStyles[category]
        )}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </div>
        
        <div className="flex flex-wrap gap-1 justify-end">
          {kbSources.map((source, index) => (
            <span 
              key={index} 
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
              title={`Knowledge Base Source: ${source}`}
            >
              [KB:{source}]
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
