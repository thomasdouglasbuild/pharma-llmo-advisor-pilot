
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Answer {
  raw_json: any;
}

interface SourcesDrawerProps {
  answers: Answer[];
}

export const SourcesDrawer = ({ answers }: SourcesDrawerProps) => {
  const urls = Array.from(
    new Set(
      answers
        .flatMap((a) => a.raw_json?.sources ?? [])
        .map((s: any) => s.url || s)
        .filter(Boolean)
    )
  );
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="mt-4">
          View Sources ({urls.length})
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[420px] overflow-y-auto">
        <h2 className="mb-4 text-lg font-semibold">Cited Sources</h2>
        <ul className="space-y-3 text-sm">
          {urls.map((url, index) => (
            <li key={index} className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 shrink-0 mt-0.5" />
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="break-all hover:underline text-blue-600"
              >
                {url}
              </a>
            </li>
          ))}
        </ul>
        {urls.length === 0 && (
          <p className="text-muted-foreground">No sources available</p>
        )}
      </SheetContent>
    </Sheet>
  );
};
