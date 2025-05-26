
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ScoreData } from "@/services/benchmarkService";

interface BenchmarkScoreCardProps {
  score: ScoreData;
  previousScore?: ScoreData;
}

const BenchmarkScoreCard = ({ score, previousScore }: BenchmarkScoreCardProps) => {
  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTrend = (current: number, previous?: number) => {
    if (!previous) return null;
    const diff = current - previous;
    if (Math.abs(diff) < 1) return <Minus className="h-4 w-4 text-gray-500" />;
    return diff > 0 ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const scores = [
    { label: "Overall Score", value: score.total_score, prev: previousScore?.total_score },
    { label: "Visibility", value: score.visibility, prev: previousScore?.visibility },
    { label: "Accuracy", value: score.accuracy, prev: previousScore?.accuracy },
    { label: "Sentiment", value: score.sentiment, prev: previousScore?.sentiment },
    { label: "Reference Quality", value: score.reference_quality, prev: previousScore?.reference_quality }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          AI Benchmark Scores
          <Badge variant="outline">
            {new Date(score.created_at).toLocaleDateString()}
          </Badge>
        </CardTitle>
        <CardDescription>
          Comprehensive analysis across multiple LLM models
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {scores.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getScoreColor(item.value)}`}>
                  {Math.round(item.value)}
                </span>
                {getTrend(item.value, item.prev)}
              </div>
            </div>
            <div className="relative">
              <Progress 
                value={item.value} 
                className="h-2"
              />
              <div 
                className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(item.value)}`}
                style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
              />
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {scores.filter(s => s.value >= 80).length}
              </div>
              <div className="text-xs text-muted-foreground">Excellent</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {scores.filter(s => s.value >= 60 && s.value < 80).length}
              </div>
              <div className="text-xs text-muted-foreground">Good</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {scores.filter(s => s.value < 60).length}
              </div>
              <div className="text-xs text-muted-foreground">Needs Work</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BenchmarkScoreCard;
