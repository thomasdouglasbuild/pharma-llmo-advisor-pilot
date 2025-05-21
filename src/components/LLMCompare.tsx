
import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LLMCompareProps {
  drugName: string;
}

const LLMCompare = ({ drugName }: LLMCompareProps) => {
  const [selectedQuestion, setSelectedQuestion] = useState<number>(0);
  
  // Mock data for the LLM comparison
  const llmData = [
    {
      question: "What is the primary indication for " + drugName + "?",
      gpt4o: {
        answer: "Used primarily for treating hypertension and heart failure.",
        sentiment: 0.78,
        accuracy: 0.92,
        sources: "FDA label, clinical studies"
      },
      claude: {
        answer: "Primary indication is for treatment of hypertension, with additional approval for heart failure management.",
        sentiment: 0.76,
        accuracy: 0.89,
        sources: "EMA approval documents, FDA prescribing information"
      },
      gemini: {
        answer: "Indicated for hypertension management and heart failure in adults.",
        sentiment: 0.71,
        accuracy: 0.87,
        sources: "PubMed studies, drug reference databases"
      },
      perplexity: {
        answer: "FDA-approved for hypertension and heart failure with reduced ejection fraction.",
        sentiment: 0.81,
        accuracy: 0.90,
        sources: "FDA, medical journals, Mayo Clinic"
      },
      notes: "Overall accurate across LLMs."
    },
    {
      question: "What are the common side effects of " + drugName + "?",
      gpt4o: {
        answer: "Common side effects include headache, dizziness, and cough.",
        sentiment: 0.65,
        accuracy: 0.88,
        sources: "Clinical trials data, FDA adverse events reporting"
      },
      claude: {
        answer: "Most commonly reported side effects are headache, dizziness, fatigue, and dry cough.",
        sentiment: 0.62,
        accuracy: 0.90,
        sources: "FDA label, clinical trial results"
      },
      gemini: {
        answer: "Side effects include headache, dizziness, and in some cases a persistent dry cough.",
        sentiment: 0.64,
        accuracy: 0.85,
        sources: "Package insert, medical databases"
      },
      perplexity: {
        answer: "Common side effects include headache, dizziness, cough, and hypotension. Rare but serious side effects include angioedema.",
        sentiment: 0.59,
        accuracy: 0.91,
        sources: "Clinical data, pharmacology references, FDA reports"
      },
      notes: "Perplexity provides most comprehensive side effect profile."
    },
    {
      question: "Is " + drugName + " safe during pregnancy?",
      gpt4o: {
        answer: "Not recommended during pregnancy due to potential risks to the fetus.",
        sentiment: 0.45,
        accuracy: 0.94,
        sources: "FDA pregnancy category, clinical guidelines"
      },
      claude: {
        answer: "Contraindicated during pregnancy as it may cause harm to the developing fetus, especially in the second and third trimesters.",
        sentiment: 0.42,
        accuracy: 0.95,
        sources: "FDA label, ACOG recommendations"
      },
      gemini: {
        answer: "Should not be used during pregnancy; can cause injury and death to the developing fetus.",
        sentiment: 0.38,
        accuracy: 0.93,
        sources: "Clinical guidelines, medical consensus"
      },
      perplexity: {
        answer: "Contraindicated during pregnancy, particularly during second and third trimesters, due to potential for fetal harm.",
        sentiment: 0.40,
        accuracy: 0.95,
        sources: "FDA warnings, pregnancy registries, obstetric research"
      },
      notes: "All models correctly identified pregnancy risks."
    }
  ];

  const prepareChartData = (questionIndex: number) => {
    const question = llmData[questionIndex];
    return [
      {
        name: 'GPT-4o',
        sentiment: parseFloat((question.gpt4o.sentiment * 100).toFixed(0)),
        accuracy: parseFloat((question.gpt4o.accuracy * 100).toFixed(0)),
        color: '#3b82f6' // blue-500
      },
      {
        name: 'Claude',
        sentiment: parseFloat((question.claude.sentiment * 100).toFixed(0)),
        accuracy: parseFloat((question.claude.accuracy * 100).toFixed(0)),
        color: '#a855f7' // purple-500
      },
      {
        name: 'Gemini',
        sentiment: parseFloat((question.gemini.sentiment * 100).toFixed(0)),
        accuracy: parseFloat((question.gemini.accuracy * 100).toFixed(0)),
        color: '#eab308' // yellow-500
      },
      {
        name: 'Perplexity',
        sentiment: parseFloat((question.perplexity.sentiment * 100).toFixed(0)),
        accuracy: parseFloat((question.perplexity.accuracy * 100).toFixed(0)),
        color: '#22c55e' // green-500
      }
    ];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Results Compare</CardTitle>
        <CardDescription>
          Compare how different AI models represent information about {drugName}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Tabs defaultValue="table" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="charts">Chart View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table">
            {llmData.map((item, index) => (
              <div key={index} className="mb-8">
                <h3 className="text-lg font-semibold mb-3">{item.question}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Model</TableHead>
                      <TableHead>Answer</TableHead>
                      <TableHead className="w-[100px]">Sentiment</TableHead>
                      <TableHead className="w-[100px]">Accuracy</TableHead>
                      <TableHead className="w-[180px]">Sources</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-500"></span>
                          GPT-4o
                        </div>
                      </TableCell>
                      <TableCell>{item.gpt4o.answer}</TableCell>
                      <TableCell>{(item.gpt4o.sentiment * 100).toFixed(0)}%</TableCell>
                      <TableCell>{(item.gpt4o.accuracy * 100).toFixed(0)}%</TableCell>
                      <TableCell>{item.gpt4o.sources}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-purple-500"></span>
                          Claude 3 Sonnet
                        </div>
                      </TableCell>
                      <TableCell>{item.claude.answer}</TableCell>
                      <TableCell>{(item.claude.sentiment * 100).toFixed(0)}%</TableCell>
                      <TableCell>{(item.claude.accuracy * 100).toFixed(0)}%</TableCell>
                      <TableCell>{item.claude.sources}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-yellow-500"></span>
                          Gemini 1.5 Pro
                        </div>
                      </TableCell>
                      <TableCell>{item.gemini.answer}</TableCell>
                      <TableCell>{(item.gemini.sentiment * 100).toFixed(0)}%</TableCell>
                      <TableCell>{(item.gemini.accuracy * 100).toFixed(0)}%</TableCell>
                      <TableCell>{item.gemini.sources}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-green-500"></span>
                          Perplexity AI
                        </div>
                      </TableCell>
                      <TableCell>{item.perplexity.answer}</TableCell>
                      <TableCell>{(item.perplexity.sentiment * 100).toFixed(0)}%</TableCell>
                      <TableCell>{(item.perplexity.accuracy * 100).toFixed(0)}%</TableCell>
                      <TableCell>{item.perplexity.sources}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="font-medium">Notes:</span> {item.notes}
                </p>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="charts">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Question:</h3>
                <select 
                  className="border rounded p-2 bg-white"
                  value={selectedQuestion}
                  onChange={(e) => setSelectedQuestion(parseInt(e.target.value))}
                >
                  {llmData.map((item, index) => (
                    <option key={index} value={index}>
                      {item.question}
                    </option>
                  ))}
                </select>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {llmData[selectedQuestion].notes}
              </p>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <h4 className="text-md font-medium mb-2">Sentiment Analysis</h4>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareChartData(selectedQuestion)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Sentiment']} />
                        <Legend />
                        <Bar dataKey="sentiment" name="Sentiment Score" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <h4 className="text-md font-medium mb-2">Accuracy Comparison</h4>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareChartData(selectedQuestion)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} />
                        <Legend />
                        <Bar dataKey="accuracy" name="Accuracy Score" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LLMCompare;
