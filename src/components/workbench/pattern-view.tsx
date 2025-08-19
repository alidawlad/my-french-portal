"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { transformWord, toEN, type Token } from "@/lib/phonetics";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

type PatternViewProps = {
  text: string;
};

export function PatternView({ text }: PatternViewProps) {
  const isVowelTok = (t: Token) => ["AH","AY","EH","UH","EE","OH","OO","Ü","EU"].includes(t);
  const isNasalTok = (t: Token) => ["AH~","OH~","EH~","UH~"].includes(t);

  const chipInfo = (t: Token) => {
    const nasal = isNasalTok(t);
    const vowel = isVowelTok(t);
    const special = ["SH", "ZH", "NY", "Y", "R"].includes(t);
    
    const baseClass = 
        nasal ? 'bg-amber-200/50 text-amber-800 ring-amber-300/80 dark:bg-amber-800/20 dark:text-amber-200 dark:ring-amber-700/50'
      : vowel ? 'bg-blue-200/50 text-blue-800 ring-blue-300/80 dark:bg-blue-800/20 dark:text-blue-200 dark:ring-blue-700/50'
      : special ? 'bg-purple-200/50 text-purple-800 ring-purple-300/80 dark:bg-purple-800/20 dark:text-purple-200 dark:ring-purple-700/50'
      : 'bg-muted text-muted-foreground ring-border';

    const label: Record<string, string> = {
      SH: "ch → /ʃ/",
      ZH: "j or g(e/i/y) → /ʒ/",
      NY: "gn → /ɲ/",
      Y: "y-glide or -ill",
      R: "uvular r",
      "AH~": "an/en → nasal",
      "OH~": "on → nasal",
      "EH~": "in/ain/ein → nasal",
      "UH~": "un → nasal",
    };
    return { cls: cn("px-2.5 py-1 rounded-md ring-1 ring-inset font-mono text-sm", baseClass), title: label[t] };
  };

  const words = text.split(/(\s+)/).filter(w => w.trim().length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">Pattern View</CardTitle>
        <CardDescription>
          Each word is split into colour-coded chunks. Hover for hints.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-x-4 gap-y-3">
          {words.map((w, idx) => {
            const toks = transformWord(w);
            return (
              <div key={`${w}-${idx}`} className="flex items-center gap-2">
                <span className="text-sm font-medium mr-1 text-foreground/70">{w}</span>
                <div className="flex items-center gap-1">
                    {toks.map((t, i2) => {
                        const inf = chipInfo(t);
                        const enToken = toEN(t);
                        return (
                            <TooltipProvider key={i2}>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <span className={inf.cls}>{enToken}</span>
                                    </TooltipTrigger>
                                    {inf.title && <TooltipContent><p>{inf.title}</p></TooltipContent>}
                                </Tooltip>
                            </TooltipProvider>
                        );
                    })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-muted-foreground pt-4 flex flex-wrap gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-300/80 ring-1 ring-inset ring-blue-400/80"></span>Vowel</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-300/80 ring-1 ring-inset ring-amber-400/80"></span>Nasal Vowel</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-300/80 ring-1 ring-inset ring-purple-400/80"></span>Special/Glide</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-muted ring-1 ring-inset ring-border"></span>Consonant</div>
        </div>
      </CardContent>
    </Card>
  );
}
