
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Brain, LoaderCircle } from "lucide-react";
import { runLlmAnalysis } from "@/services/llmService";
import type { Product } from "@/types/PharmaTypes";

interface ProductAnalysisCardProps {
  product: Product;
  onAnalysisComplete?: () => void;
}

const ProductAnalysisCard = ({ product, onAnalysisComplete }: ProductAnalysisCardProps) => {
  const [isRunning, setIsRunning] = useState(false);

  const handleRunAnalysis = async () => {
    setIsRunning(true);
    try {
      const success = await runLlmAnalysis(product.id);
      if (success && onAnalysisComplete) {
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
          
          <Button 
            onClick={handleRunAnalysis}
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Running AI Analysis...
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Run AI Analysis
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductAnalysisCard;
