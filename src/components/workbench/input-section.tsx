"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneticExceptionSuggester } from "./phonetic-exception-suggester";
import { RuleAssistant } from "./rule-assistant";

type InputSectionProps = {
  text: string;
  onTextChange: (value: string) => void;
  lines: { en: string; ar: string };
  showArabic: boolean;
  examples: Array<{ label: string, text: string }>;
  onExampleClick: (text: string) => void;
};

export function InputSection({
  text,
  onTextChange,
  lines,
  showArabic,
  examples,
  onExampleClick,
}: InputSectionProps) {
  const gridCols = showArabic ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">Workbench</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="french-input" className="text-sm font-medium text-foreground/80">
            Type French words or names
          </label>
          <Textarea
            id="french-input"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            rows={4}
            className="mt-1 resize-y bg-card"
            placeholder="Tapez ici…"
          />
           <div className="flex flex-wrap gap-2 pt-2">
            {examples.map((ex) => (
              <Badge
                key={ex.label}
                onClick={() => onExampleClick(ex.text)}
                className="cursor-pointer select-none"
                variant="secondary"
              >
                {ex.label}
              </Badge>
            ))}
          </div>
        </div>
        <div className={`grid gap-4 ${gridCols}`}>
          <div className="rounded-lg border p-4 bg-background">
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">FR-line (original)</div>
            <div className="min-h-[48px] whitespace-pre-wrap break-words text-base">{text}</div>
          </div>
          <div className="rounded-lg border p-4 bg-background">
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">EN-line (Ali respell)</div>
            <div className="min-h-[48px] whitespace-pre-wrap break-words text-base tracking-wide font-medium">{lines.en}</div>
          </div>
          {showArabic && (
            <div className="rounded-lg border p-4 bg-background">
              <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">AR-line (approx.)</div>
              <div dir="rtl" className="min-h-[48px] whitespace-pre-wrap break-words text-xl text-right font-medium">{lines.ar}</div>
            </div>
          )}
        </div>
        
        <Tabs defaultValue="suggester" className="w-full">
          <TabsList>
            <TabsTrigger value="suggester">AI Suggestions</TabsTrigger>
            <TabsTrigger value="assistant">Rule Assistant</TabsTrigger>
          </TabsList>
          <TabsContent value="suggester">
             <PhoneticExceptionSuggester text={text} />
          </TabsContent>
          <TabsContent value="assistant">
            <RuleAssistant text={text} />
          </TabsContent>
        </Tabs>

      </CardContent>
    </Card>
  );
}
