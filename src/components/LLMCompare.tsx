
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LLMCompareProps {
  drugName: string;
}

const LLMCompare = ({ drugName }: LLMCompareProps) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Results Compare</CardTitle>
        <CardDescription>
          Compare how different AI models represent information about {drugName}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
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
      </CardContent>
    </Card>
  );
};

export default LLMCompare;
