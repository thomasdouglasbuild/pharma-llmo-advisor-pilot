
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "@/services/pharmaDataService";
import { getLlmRunsForProduct } from "@/services/llmService";
import ProductAnalysisCard from "@/components/pharma/ProductAnalysisCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoaderCircle, BarChart3 } from "lucide-react";

const ProductAnalysisPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProductId = searchParams.get('productId');
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products-analysis"],
    queryFn: getProducts,
  });

  const { data: llmRuns, isLoading: llmRunsLoading, refetch: refetchLlmRuns } = useQuery({
    queryKey: ["llm-runs", selectedProductId, refreshKey],
    queryFn: () => selectedProductId ? getLlmRunsForProduct(parseInt(selectedProductId)) : Promise.resolve([]),
    enabled: !!selectedProductId,
  });

  const selectedProduct = products?.find(p => p.id.toString() === selectedProductId);

  const handleProductChange = (productId: string) => {
    setSearchParams({ productId });
  };

  const handleAnalysisComplete = () => {
    setRefreshKey(prev => prev + 1);
    refetchLlmRuns();
  };

  if (productsLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <LoaderCircle className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Product AI Analysis</h1>
        <p className="text-muted-foreground">
          Select a pharmaceutical product to run AI-powered reputation and sentiment analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Selection and Analysis */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Product</CardTitle>
              <CardDescription>Choose a product for AI analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedProductId || ""} onValueChange={handleProductChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product..." />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.brand_name} ({product.company?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedProduct && (
            <ProductAnalysisCard 
              product={selectedProduct} 
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}
        </div>

        {/* Analysis Results */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analysis Results
              </CardTitle>
              <CardDescription>
                {selectedProduct ? `Results for ${selectedProduct.brand_name}` : 'Select a product to see results'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedProduct ? (
                <p className="text-muted-foreground text-center py-8">
                  Select a product to view analysis results
                </p>
              ) : llmRunsLoading ? (
                <div className="flex justify-center py-8">
                  <LoaderCircle className="animate-spin h-6 w-6" />
                </div>
              ) : llmRuns && llmRuns.length > 0 ? (
                <div className="space-y-4">
                  {llmRuns.map((run) => (
                    <div key={run.id} className="border rounded p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Analysis #{run.id}</h4>
                        <span className="text-sm text-muted-foreground">
                          {run.run_started_at ? new Date(run.run_started_at).toLocaleDateString() : 'Unknown date'}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p><strong>Model:</strong> {run.model_name || 'Unknown'}</p>
                        <p><strong>Questions:</strong> {run.question_set_id || 'Unknown'}</p>
                        {run.json_result && (
                          <div className="mt-2">
                            <p><strong>Results:</strong> {JSON.stringify(run.json_result).length} characters of data</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No analysis results yet. Run an analysis to see results here.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductAnalysisPage;
