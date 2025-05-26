
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Answer {
  id: number;
  question: string;
  answer_text: string | null;
  raw_json: any;
}

interface AnswerAccordionProps {
  answers: Answer[];
}

export const AnswerAccordion = ({ answers }: AnswerAccordionProps) => (
  <Accordion type="single" collapsible className="w-full">
    {answers.map((a) => (
      <AccordionItem key={a.id} value={a.id.toString()}>
        <AccordionTrigger>{a.question}</AccordionTrigger>
        <AccordionContent className="prose whitespace-pre-wrap">
          {a.answer_text || "No answer available"}
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);
