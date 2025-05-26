
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, AlertCircle, TrendingUp } from "lucide-react";
import type { RecommendationData } from "@/services/benchmarkService";

interface BenchmarkRecommendationsProps {
  recommendations: RecommendationData[];
}

const BenchmarkRecommendations = ({ recommendations }: BenchmarkRecommendationsProps) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content': return <Lightbulb className="h-4 w-4" />;
      case 'authority': return <TrendingUp className="h-4 w-4" />;
      case 'technical': return <AlertCircle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'content': return 'bg-blue-100 text-blue-800';
      case 'authority': return 'bg-purple-100 text-purple-800';
      case 'technical': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return 'bg-red-100 text-red-800 border-red-200';
    if (priority === 2) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Optimization suggestions based on benchmark analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-green-600 mb-2">
              <TrendingUp className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-green-800">Excellent Performance!</h3>
            <p className="text-muted-foreground">
              Your product is performing well across all metrics. No immediate improvements needed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          AI Recommendations
        </CardTitle>
        <CardDescription>
          Optimization suggestions based on benchmark analysis ({recommendations.length} recommendations)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec) => (
          <div 
            key={rec.id}
            className={`p-4 rounded-lg border-2 ${getPriorityColor(rec.priority)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryIcon(rec.category)}
                  <Badge 
                    variant="outline" 
                    className={getCategoryColor(rec.category)}
                  >
                    {rec.category}
                  </Badge>
                  <Badge variant="outline">
                    Priority {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed">{rec.tip}</p>
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            Recommendations are generated based on AI analysis of multiple LLM responses and industry best practices.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BenchmarkRecommendations;
