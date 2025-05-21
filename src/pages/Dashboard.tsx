
import React, { useState } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import ScoreCard from '@/components/ScoreCard';
import DrugComparisonChart from '@/components/DrugComparisonChart';
import RecommendationCard from '@/components/RecommendationCard';
import { mockDrugs } from '@/data/mockDrugs';
import DrugSelector from '@/components/DrugSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LLMCompare from '@/components/LLMCompare';

const Dashboard = () => {
  const [selectedDrugId, setSelectedDrugId] = useState(mockDrugs[0].id);
  
  // Get the selected drug
  const selectedDrug = mockDrugs.find(drug => drug.id === selectedDrugId) || mockDrugs[0];
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader />
        
        <div className="grid grid-cols-1 gap-6">
          {/* Drug Selection and Overview */}
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
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <ScoreCard 
              title="RepuScore™" 
              value={selectedDrug.repuScore} 
              description="Overall LLM reputation score" 
            />
            <ScoreCard 
              title="Sentiment" 
              value={selectedDrug.sentimentScore} 
              format="percentage"
              description="LLM sentiment analysis" 
            />
            <ScoreCard 
              title="Accuracy" 
              value={selectedDrug.accuracyScore} 
              format="percentage"
              description="Factual accuracy in responses" 
            />
            <ScoreCard 
              title="Sources Quality" 
              value={selectedDrug.sourcesScore} 
              format="percentage"
              description="Authority of cited sources" 
            />
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
                  <CardTitle>LLM Product Representation</CardTitle>
                  <CardDescription>
                    How {selectedDrug.name} is represented across major Large Language Models
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedDrug.name} has been mentioned {selectedDrug.llmMentions} times across monitored LLMs.
                    The product has a {selectedDrug.repuScore >= 80 ? 'strong' : selectedDrug.repuScore >= 60 ? 'moderate' : 'weak'} presence
                    with {selectedDrug.sentimentScore >= 0.8 ? 'very positive' : selectedDrug.sentimentScore >= 0.6 ? 'generally positive' : 'mixed or negative'} sentiment.
                  </p>
                  
                  <h4 className="font-medium text-sm mb-2">Key Findings:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li className="text-gray-700">
                      {selectedDrug.accuracyScore >= 0.8 ? 'Information accuracy is very high' : 
                       selectedDrug.accuracyScore >= 0.6 ? 'Information is generally accurate but has some gaps' :
                       'Significant accuracy issues detected in LLM responses'}
                    </li>
                    <li className="text-gray-700">
                      {selectedDrug.sourcesScore >= 0.8 ? 'Authoritative sources well represented' : 
                       selectedDrug.sourcesScore >= 0.6 ? 'Mix of authoritative and lower quality sources cited' :
                       'Few authoritative sources cited, improving citations recommended'}
                    </li>
                    <li className="text-gray-700">
                      {selectedDrug.recommendations.length === 0 ? 'No critical issues detected' :
                       selectedDrug.recommendations.length <= 2 ? `${selectedDrug.recommendations.length} areas identified for improvement` :
                       'Multiple areas need attention to improve LLM representation'}
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="recommendations" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>LLMO Recommendations</CardTitle>
                  <CardDescription>
                    AI-generated recommendations to improve LLM representation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDrug.recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedDrug.recommendations.map((recommendation, index) => (
                        <RecommendationCard key={index} recommendation={recommendation} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">
                      No recommendations needed at this time. {selectedDrug.name} has excellent LLM representation.
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
                    Compare {selectedDrug.name} against competitors
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
              <LLMCompare drugName={selectedDrug.name} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
