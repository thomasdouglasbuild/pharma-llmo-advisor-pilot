
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DashboardHeader from '@/components/DashboardHeader';
import ScoreCard from '@/components/ScoreCard';
import DrugComparisonChart from '@/components/DrugComparisonChart';
import RecommendationCard from '@/components/RecommendationCard';
import { mockDrugs } from '@/data/mockDrugs';
import DrugSelector from '@/components/DrugSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LLMCompare from '@/components/LLMCompare';
import { getProductsByCompany, getProductById, getCompanyById } from '@/services/pharmaDataService';
import { runFullAnalysis, getLatestReport } from '@/services/analysisService';
import { LoaderCircle, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const companyId = searchParams.get('companyId');
  const productId = searchParams.get('productId');
  
  const [selectedDrugId, setSelectedDrugId] = useState(mockDrugs[0].id);
  const [analysisData, setAnalysisData] = useState(null);
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [hasReport, setHasReport] = useState(false);
  
  console.log('Dashboard mounted with params:', { companyId, productId });
  
  // Fetch company products if companyId is provided
  const companyProductsQuery = useQuery({
    queryKey: ['products_by_company', companyId],
    queryFn: () => {
      console.log('Fetching products for company:', companyId);
      return companyId ? getProductsByCompany(Number(companyId)) : Promise.resolve([]);
    },
    enabled: !!companyId,
  });
  
  // Fetch single product if productId is provided
  const singleProductQuery = useQuery({
    queryKey: ['product', productId],
    queryFn: () => {
      console.log('Fetching product:', productId);
      return productId ? getProductById(Number(productId)) : Promise.resolve(null);
    },
    enabled: !!productId,
  });
  
  // Get company info if companyId is provided
  const companyQuery = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => {
      console.log('Fetching company:', companyId);
      return companyId ? getCompanyById(Number(companyId)) : Promise.resolve(null);
    },
    enabled: !!companyId,
  });

  // Check for existing reports when component mounts
  useEffect(() => {
    if (productId) {
      checkExistingReport(Number(productId));
    }
  }, [productId]);

  const checkExistingReport = async (prodId: number) => {
    try {
      const report = await getLatestReport(prodId);
      if (report) {
        setAnalysisData(report);
        setHasReport(true);
      }
    } catch (error) {
      console.log('No existing report found');
    }
  };

  const runAIAnalysis = async () => {
    if (!productId) {
      toast({
        title: 'No Product Selected',
        description: 'Please select a specific product to run AI analysis.',
        variant: 'destructive',
      });
      return;
    }

    setIsRunningAnalysis(true);
    try {
      const result = await runFullAnalysis(Number(productId));
      if (result.success && result.reportData) {
        setAnalysisData(result.reportData);
        setHasReport(true);
        toast({
          title: 'Analysis Complete',
          description: 'AI-powered insights have been generated for this product.',
        });
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: 'Failed to generate AI insights. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRunningAnalysis(false);
    }
  };

  // Check if we have parameters and redirect if not
  useEffect(() => {
    if (!companyId && !productId) {
      console.log('No parameters found, redirecting to selection page');
      navigate('/');
      toast({
        title: 'Selection Required',
        description: 'Please select a company or product to begin analysis.',
      });
    }
  }, [companyId, productId, navigate]);

  // Determine if we're still loading data
  const isLoading = 
    (companyId && companyProductsQuery.isLoading) || 
    (productId && singleProductQuery.isLoading) ||
    (companyId && companyQuery.isLoading);

  // Check for errors
  const hasError = 
    (companyId && companyProductsQuery.error) || 
    (productId && singleProductQuery.error) ||
    (companyId && companyQuery.error);

  // Get the selected drug (fallback to mock for comparison charts)
  const selectedDrug = mockDrugs.find(drug => drug.id === selectedDrugId) || mockDrugs[0];
  
  // Show loading state while queries are in progress
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="animate-spin h-12 w-12" />
          <p className="text-lg">Loading pharmaceutical data...</p>
        </div>
      </div>
    );
  }

  // Show error state if there are errors
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg text-red-600">Error loading data</p>
          <p className="text-sm text-gray-600">Please try again or go back to selection.</p>
        </div>
      </div>
    );
  }

  const currentProduct = singleProductQuery.data;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader />
        
        <div className="grid grid-cols-1 gap-6">
          {/* Context Info */}
          {companyQuery.data && (
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle>Company Analysis</CardTitle>
                <CardDescription>
                  Analyzing products from {companyQuery.data.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Rank: {companyQuery.data.rank_2024 || 'N/A'} | 
                  HQ: {companyQuery.data.hq_country || 'Unknown'} | 
                  Sales: ${companyQuery.data.sales_2024_bn ? `${companyQuery.data.sales_2024_bn}B` : 'Unknown'}
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* Single Product Info with AI Analysis */}
          {currentProduct && (
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Product Analysis: {currentProduct.brand_name}</CardTitle>
                    <CardDescription>
                      {currentProduct.inn} | Company: {currentProduct.company?.name} | 
                      Indication: {currentProduct.indication || 'Unknown'}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={runAIAnalysis}
                    disabled={isRunningAnalysis}
                    className="flex items-center gap-2"
                  >
                    {isRunningAnalysis ? (
                      <>
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {hasReport ? 'Refresh Analysis' : 'Run AI Analysis'}
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              {analysisData && (
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <ScoreCard 
                      title="RepuScore™" 
                      value={parseFloat(analysisData.metrics.repuScore)} 
                      description="AI-generated reputation score" 
                    />
                    <ScoreCard 
                      title="Confidence" 
                      value={parseFloat(analysisData.metrics.confidenceScore)} 
                      format="percentage"
                      description="LLM confidence in responses" 
                    />
                    <ScoreCard 
                      title="Sentiment" 
                      value={parseFloat(analysisData.metrics.sentimentScore)} 
                      format="percentage"
                      description="Overall sentiment analysis" 
                    />
                    <ScoreCard 
                      title="Sources" 
                      value={analysisData.metrics.sourcesCount} 
                      format="number"
                      description="Unique sources referenced" 
                    />
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Key Sources Identified:</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisData.sources.map((source, index) => (
                        <span 
                          key={index} 
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}
          
          {/* Original dashboard content for backward compatibility */}
          <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            <DrugSelector 
              drugs={mockDrugs}
              selectedDrugId={selectedDrugId}
              onChange={setSelectedDrugId}
            />
            
            <div className="text-sm text-gray-500">
              <span className="font-medium">{selectedDrug.name}</span> by {selectedDrug.company} | Category: {selectedDrug.category}
            </div>
          </div>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
              <TabsTrigger value="llm-compare">LLM Compare</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Generated Insights</CardTitle>
                  <CardDescription>
                    {analysisData ? 
                      `Real-time analysis of ${analysisData.product.name} based on AI evaluation` :
                      currentProduct ?
                        'Click "Run AI Analysis" to generate real insights' :
                        'Select a specific product to generate AI insights'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisData ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-700">
                        Based on AI analysis, <strong>{analysisData.product.name}</strong> shows a RepuScore™ of {analysisData.metrics.repuScore}, 
                        indicating {parseFloat(analysisData.metrics.repuScore) >= 0.8 ? 'strong' : parseFloat(analysisData.metrics.repuScore) >= 0.6 ? 'moderate' : 'weak'} representation 
                        across large language models.
                      </p>
                      
                      {analysisData.competitors.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Identified Competitors:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {analysisData.competitors.map((competitor, index) => (
                              <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                                <strong>{competitor.name}</strong> by {competitor.company}
                                <br />
                                <span className="text-gray-600">Similarity: {(competitor.similarity_score * 100).toFixed(0)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">
                      {currentProduct ? 
                        'Run AI analysis to see real insights about this product.' :
                        'Please select a specific product to begin analysis.'
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="recommendations" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                  <CardDescription>
                    {analysisData ? 
                      'AI-generated recommendations to improve LLM representation' :
                      'Run analysis to see personalized recommendations'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisData && analysisData.recommendations ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisData.recommendations.map((recommendation, index) => (
                        <RecommendationCard key={index} recommendation={recommendation} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">
                      Run AI analysis to generate personalized recommendations.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="comparison" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Competitive Benchmark</CardTitle>
                  <CardDescription>
                    Compare against industry benchmarks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6">
                    <DrugComparisonChart 
                      drugs={mockDrugs} 
                      metric="repuScore"
                      title="RepuScore™ Comparison" 
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DrugComparisonChart 
                        drugs={mockDrugs} 
                        metric="sentimentScore"
                        title="Sentiment Analysis" 
                      />
                      <DrugComparisonChart 
                        drugs={mockDrugs} 
                        metric="accuracyScore"
                        title="Accuracy Comparison" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="llm-compare" className="space-y-6 mt-6">
              <LLMCompare drugName={currentProduct?.brand_name || selectedDrug.name} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
