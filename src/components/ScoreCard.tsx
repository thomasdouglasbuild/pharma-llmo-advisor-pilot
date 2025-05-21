
import { cn } from '@/lib/utils';
import React from 'react';

interface ScoreCardProps {
  title: string;
  value: number;
  maxValue?: number;
  format?: 'percentage' | 'number' | 'decimal';
  description?: string;
  className?: string;
}

const ScoreCard = ({ 
  title, 
  value, 
  maxValue = 100, 
  format = 'number', 
  description,
  className 
}: ScoreCardProps) => {
  
  // Format the value based on the specified format
  const formattedValue = () => {
    switch(format) {
      case 'percentage':
        return `${Math.round(value * 100)}%`;
      case 'decimal':
        return value.toFixed(2);
      default:
        return Math.round(value);
    }
  };

  // Determine score level for styling
  const getScoreLevel = () => {
    const normalizedValue = format === 'percentage' || format === 'decimal' 
      ? value 
      : value / maxValue;
      
    if (normalizedValue >= 0.8) return 'high';
    if (normalizedValue >= 0.6) return 'medium';
    return 'low';
  };

  const scoreLevel = getScoreLevel();

  return (
    <div className={cn(
      "bg-white p-4 rounded-lg shadow-sm border border-gray-100",
      className
    )}>
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={cn(
          "px-2 py-0.5 rounded-full text-xs font-medium",
          scoreLevel === 'high' && "bg-green-100 text-green-700",
          scoreLevel === 'medium' && "bg-amber-100 text-amber-700", 
          scoreLevel === 'low' && "bg-red-100 text-red-700"
        )}>
          {scoreLevel === 'high' ? 'Good' : scoreLevel === 'medium' ? 'Average' : 'Needs Work'}
        </div>
      </div>
      
      <div className="mt-2 flex items-baseline">
        <div className={cn(
          "text-2xl font-semibold",
          scoreLevel === 'high' && "text-score-high",
          scoreLevel === 'medium' && "text-score-medium", 
          scoreLevel === 'low' && "text-score-low"
        )}>
          {formattedValue()}
        </div>
        {maxValue !== 100 && format === 'number' && (
          <span className="ml-1 text-gray-400 text-sm">/ {maxValue}</span>
        )}
      </div>
      
      {description && (
        <p className="mt-2 text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
};

export default ScoreCard;
