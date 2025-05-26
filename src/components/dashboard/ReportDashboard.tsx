
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressCircle } from "@/components/dashboard/ScoreGauge";
import { RadarChartPanel } from "@/components/dashboard/RadarChartPanel";
import { AnswerAccordion } from "@/components/dashboard/AnswerAccordion";
import { SourcesDrawer } from "@/components/dashboard/SourcesDrawer";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  runId: string;
}

export const ReportDashboard = ({ runId }: Props) => {
  const answersQ = useQuery({
    queryKey: ["answers", runId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("answer")
        .select("*")
        .eq("llm_run_id", runId);
      
      if (error) throw error;
      return data || [];
    },
  });

  const scoreQ = useQuery({
    queryKey: ["score", runId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("score")
        .select("*")
        .eq("llm_run_id", runId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  if (answersQ.isLoading || scoreQ.isLoading) {
    return <p className="animate-pulse text-muted-foreground">Loading dashboard...</p>;
  }
  
  if (!answersQ.data?.length) {
    return <p className="text-red-600">No answers found for this run.</p>;
  }

  const models = ["gpt-4o", "claude-3-sonnet", "gemini-1-5-pro", "perplexity-llama3"];
  const answersByModel = models.map((m) => ({
    model: m,
    answers: answersQ.data!.filter((a) => a.raw_json?.model === m),
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* LEFT SIDEBAR */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Global Score</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressCircle value={scoreQ.data?.total_score ?? 0} />
            <ul className="mt-4 space-y-1 text-sm">
              <li>Visibility: {((scoreQ.data?.visibility ?? 0) * 100).toFixed(0)}%</li>
              <li>Accuracy: {((scoreQ.data?.accuracy ?? 0) * 100).toFixed(0)}%</li>
              <li>Sentiment: {(scoreQ.data?.sentiment ?? 0).toFixed(1)}</li>
              <li>Sources: {((scoreQ.data?.reference_quality ?? 0) * 100).toFixed(0)}%</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChartPanel runId={runId} />
          </CardContent>
        </Card>
      </div>

      {/* MAIN CONTENT */}
      <Tabs defaultValue="gpt-4o" className="w-full">
        <TabsList className="flex w-full justify-start overflow-x-auto">
          {answersByModel.map(({ model, answers }) => (
            <TabsTrigger key={model} value={model} className="capitalize">
              {model.replace(/-/g, " ")}
              {model === "gpt-4o" ? (
                <Badge className="ml-2 bg-green-600">LIVE</Badge>
              ) : (
                <Badge className="ml-2 bg-muted">Mock</Badge>
              )}
              <span className="ml-1 text-xs">({answers.length})</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {answersByModel.map(({ model, answers }) => (
          <TabsContent key={model} value={model} className="mt-6">
            <div className="space-y-4">
              <AnswerAccordion answers={answers} />
              <SourcesDrawer answers={answers} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
