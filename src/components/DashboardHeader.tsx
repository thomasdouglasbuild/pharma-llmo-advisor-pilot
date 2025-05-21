
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { kbLoader } from '@/utils/KnowledgeBaseLoader';

const DashboardHeader = () => {
  return (
    <header className="border-b pb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-pharma-900">Pharma RepuScore + LLMO Advisor</h1>
          <p className="text-muted-foreground">
            LLM Reputation Benchmarking & Optimization for Pharmaceutical Products
          </p>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-sm bg-pharma-50 text-pharma-800 px-3 py-1 rounded-md">
                <Info className="h-4 w-4" />
                <span>Knowledge Base v2025</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Recommendations powered by our LLM Optimization Knowledge Base
                (last update: {kbLoader.getVersionDate()})
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
};

export default DashboardHeader;
