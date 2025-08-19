import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LETTERS } from "@/lib/phonetics";
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function LetterTable() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <CardTitle className="font-headline text-xl">Letter Names</CardTitle>
            <CardDescription>Corrected to your spec</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {LETTERS.map((L) => (
            <div key={L.ch} className="rounded-lg border p-3 bg-background/50 transition-shadow hover:shadow-md">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{L.nameIPA}</span>
                {L.note && (
                   <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{L.note}</p>
                      </TooltipContent>
                    </Tooltip>
                   </TooltipProvider>
                )}
              </div>
              <div className="text-3xl font-headline font-semibold text-primary/90">{L.ch}</div>
              <div className="font-semibold text-foreground">{L.ali}</div>
              {L.alt && <div className="text-xs text-muted-foreground">alt: {L.alt}</div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
