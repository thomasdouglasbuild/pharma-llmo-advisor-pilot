
import { useQuery } from "@tanstack/react-query";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { supabase } from "@/lib/supabaseClient";

interface RadarChartPanelProps {
  runId: string;
}

export const RadarChartPanel = ({ runId }: RadarChartPanelProps) => {
  const { data } = useQuery({
    queryKey: ["radar", runId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("score")
        .select("visibility, accuracy, sentiment, reference_quality")
        .eq("llm_run_id", runId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  if (!data) return null;

  const chartData = [
    { metric: "Visibility", value: (data.visibility || 0) * 100 },
    { metric: "Accuracy", value: (data.accuracy || 0) * 100 },
    { metric: "Sentiment", value: ((data.sentiment || 0) * 10 + 50) },
    { metric: "Sources", value: (data.reference_quality || 0) * 100 },
  ];

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <Radar name="Score" dataKey="value" fill="#0ea5e9" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
