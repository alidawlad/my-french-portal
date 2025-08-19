"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { transformWord, toEN, type Token, RULES, type Rule, type RuleCategory } from "@/lib/phonetics";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type InputSectionProps = {
  text: string;
  onTextChange: (value: string) => void;
  lines: { en: string; ar: string };
  showArabic: boolean;
  examples: Array<{ label: string, text: string }>;
  onExampleClick: (text: string) => void;
};

const UnderlineColors: Record<RuleCategory, string> = {
    vowel: "border-blue-500",
    nasal: "border-amber-500",
    special: "border-purple-500",
    liaison: "border-green-500",
    silent: "border-gray-500 border-dashed",
};

const getRuleForWord = (word: string): Rule | undefined => {
    const lw = word.toLowerCase();
    // Prioritize longer matches first
    const sortedRules = [...RULES].sort((a,b) => {
        const aMatch = lw.match(a.re);
        const bMatch = lw.match(b.re);
        if (aMatch && bMatch) return bMatch[0].length - aMatch[0].length;
        if (aMatch) return -1;
        if (bMatch) return 1;
        return 0;
    });
    return sortedRules.find(r => r.re.test(lw));
}


export function InputSection({
  text,
  onTextChange,
  lines,
  showArabic,
  examples,
  onExampleClick,
}: InputSectionProps) {
  const gridCols = showArabic ? "grid-cols-3" : "grid-cols-2";

  const renderTextWithUnderlines = (inputText: string) => {
    return inputText.split(/(\s+)/).map((word, i) => {
        if (!word.trim()) return <span key={i}>{word}</span>;
        const rule = getRuleForWord(word);
        const underlineClass = rule ? UnderlineColors[rule.category] : 'border-transparent';

        return (
             <TooltipProvider key={i}>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <span className={`border-b-2 ${underlineClass}`}>{word}</span>
                    </TooltipTrigger>
                    {rule && <TooltipContent><p>{rule.label}</p></TooltipContent>}
                </Tooltip>
            </TooltipProvider>
        )
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">Workbench</CardTitle>
        <CardDescription>Type French text to see it respelled and analyzed.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            id="french-input"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            rows={2}
            className="mt-1 resize-y bg-card text-lg"
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
          <div className="rounded-lg border p-3 bg-background/50">
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">FR-line (original)</div>
            <div className="min-h-[40px] whitespace-pre-wrap break-words text-lg font-medium">
                {renderTextWithUnderlines(text)}
            </div>
          </div>
          <div className="rounded-lg border p-3 bg-background/50">
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">EN-line (Ali respell)</div>
            <div className="min-h-[40px] whitespace-pre-wrap break-words text-lg tracking-wide font-medium">{lines.en}</div>
          </div>
          {showArabic && (
            <div className="rounded-lg border p-3 bg-background/50">
              <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">AR-line (approx.)</div>
              <div dir="rtl" className="min-h-[40px] whitespace-pre-wrap break-words text-xl text-right font-medium">{lines.ar}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
