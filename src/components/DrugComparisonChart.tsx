
import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Drug } from '@/types/KnowledgeBase';

interface DrugComparisonChartProps {
  drugs: Drug[];
  metric: 'repuScore' | 'sentimentScore' | 'accuracyScore' | 'sourcesScore';
  title: string;
}

const DrugComparisonChart = ({ drugs, metric, title }: DrugComparisonChartProps) => {
  const data = drugs.map(drug => ({
    name: drug.name,
    value: metric === 'repuScore' ? drug.repuScore : 
           metric === 'sentimentScore' ? drug.sentimentScore * 100 :
           metric === 'accuracyScore' ? drug.accuracyScore * 100 :
           metric === 'sourcesScore' ? drug.sourcesScore * 100 : 0,
    company: drug.company
  }));

  // Sort data by value descending
  data.sort((a, b) => b.value - a.value);

  // Get color based on value
  const getBarColor = (value: number) => {
    if (value >= 80) return '#10b981'; // high/good - green
    if (value >= 60) return '#f59e0b'; // medium/average - amber
    return '#ef4444'; // low/poor - red
  };

  const formatYAxis = (value: number) => `${value}${metric === 'repuScore' ? '' : '%'}`;

  return (
    <div className="w-full h-full bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-base font-medium text-gray-700 mb-4">{title}</h3>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis 
              tickFormatter={formatYAxis} 
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number) => [`${value}${metric === 'repuScore' ? '' : '%'}`, 'Score']}
              labelFormatter={(name) => {
                const drug = data.find(d => d.name === name);
                return `${name} (${drug?.company || 'Unknown'})`;
              }}
            />
            <Legend />
            <Bar dataKey="value" name="Score" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DrugComparisonChart;
