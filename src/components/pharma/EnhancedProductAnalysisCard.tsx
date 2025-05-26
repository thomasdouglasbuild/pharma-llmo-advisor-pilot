
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Brain, LoaderCircle, Zap } from "lucide-react";
import { runLlmBenchmark } from "@/services/benchmarkService";
import type { Product } from "@/types/PharmaTypes";

interface EnhancedProductAnalysisCardProps {
  product: Product;
  onAnalysisComplete?: () => void;
}

const EnhancedProductAnalysisCard = ({ product, onAnalysisComplete }: EnhancedProductAnalysisCardProps) => {
  const [isRunning, setIsRunning] = useState(false);

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    try {
      const result = await runLlmBenchmark(product.id);
      if (result && onAnalysisComplete) {
        onAnalysisComplete();
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              {product.brand_name || 'Unknown Product'}
            </CardTitle>
            <CardDescription>
              {product.inn && `${product.inn} • `}
              {product.company?.name || 'Unknown Company'}
            </CardDescription>
          </div>
          <Badge variant={product.status === 'Approved' ? 'default' : 'secondary'}>
            {product.status || 'Unknown'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Indication:</span>
              <p className="text-muted-foreground">{product.indication || 'Not specified'}</p>
            </div>
            <div>
              <span className="font-medium">ATC Code:</span>
              <p className="text-muted-foreground">{product.atc_level3 || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleRunBenchmark}
              disabled={isRunning}
              className="w-full"
              size="lg"
            >
              {isRunning ? (
                <>
                  <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                  Running Comprehensive Analysis...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Run Multi-LLM Benchmark
                </>
              )}
            </Button>
            
            <div className="text-xs text-muted-foreground text-center">
              {isRunning ? (
                <span>Analyzing across multiple AI models with 30+ questions...</span>
              ) : (
                <span>
                  Comprehensive analysis using GPT-4o, Claude, and other leading AI models
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedProductAnalysisCard;
