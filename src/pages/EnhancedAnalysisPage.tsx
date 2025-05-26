
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "@/services/pharmaDataService";
import { getBenchmarkScores, getBenchmarkRecommendations } from "@/services/benchmarkService";
import EnhancedProductAnalysisCard from "@/components/pharma/EnhancedProductAnalysisCard";
import BenchmarkScoreCard from "@/components/pharma/BenchmarkScoreCard";
import BenchmarkRecommendations from "@/components/pharma/BenchmarkRecommendations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoaderCircle, BarChart3, Sparkles } from "lucide-react";

const EnhancedAnalysisPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProductId = searchParams.get('productId');
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products-enhanced-analysis"],
    queryFn: getProducts,
  });

  const { data: scores, isLoading: scoresLoading, refetch: refetchScores } = useQuery({
    queryKey: ["benchmark-scores", selectedProductId, refreshKey],
    queryFn: () => selectedProductId ? getBenchmarkScores(parseInt(selectedProductId)) : Promise.resolve([]),
    enabled: !!selectedProductId,
  });

  const { data: recommendations, isLoading: recommendationsLoading, refetch: refetchRecommendations } = useQuery({
    queryKey: ["benchmark-recommendations", selectedProductId, refreshKey],
    queryFn: () => selectedProductId ? getBenchmarkRecommendations(parseInt(selectedProductId)) : Promise.resolve([]),
    enabled: !!selectedProductId,
  });

  const selectedProduct = products?.find(p => p.id.toString() === selectedProductId);
  const latestScore = scores?.[0];
  const previousScore = scores?.[1];

  const handleProductChange = (productId: string) => {
    setSearchParams({ productId });
  };

  const handleAnalysisComplete = () => {
    setRefreshKey(prev => prev + 1);
    setTimeout(() => {
      refetchScores();
      refetchRecommendations();
    }, 2000);
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
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          Enhanced Multi-LLM Analysis
        </h1>
        <p className="text-muted-foreground">
          Comprehensive pharmaceutical product analysis using multiple AI models with advanced scoring and recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Selection and Analysis Trigger */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Product</CardTitle>
              <CardDescription>Choose a product for comprehensive AI analysis</CardDescription>
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
            <EnhancedProductAnalysisCard 
              product={selectedProduct} 
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}
        </div>

        {/* Benchmark Scores */}
        <div className="space-y-6">
          {!selectedProduct ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Benchmark Scores
                </CardTitle>
                <CardDescription>Select a product to view AI benchmark results</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Select a product to view comprehensive AI analysis scores
                </p>
              </CardContent>
            </Card>
          ) : scoresLoading ? (
            <Card>
              <CardContent className="flex justify-center py-8">
                <LoaderCircle className="animate-spin h-6 w-6" />
              </CardContent>
            </Card>
          ) : latestScore ? (
            <BenchmarkScoreCard 
              score={latestScore} 
              previousScore={previousScore}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Benchmark Scores
                </CardTitle>
                <CardDescription>No analysis results yet</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Run a benchmark analysis to see comprehensive AI scores for {selectedProduct.brand_name}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Recommendations */}
        <div className="space-y-6">
          {!selectedProduct ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
                <CardDescription>Select a product to view AI recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Select a product to view AI-generated optimization recommendations
                </p>
              </CardContent>
            </Card>
          ) : recommendationsLoading ? (
            <Card>
              <CardContent className="flex justify-center py-8">
                <LoaderCircle className="animate-spin h-6 w-6" />
              </CardContent>
            </Card>
          ) : (
            <BenchmarkRecommendations recommendations={recommendations || []} />
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalysisPage;
