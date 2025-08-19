"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { smokeTests, transformWord, joinTokensEnWith, joinTokens, toArabic, SEP_MAP, type SepKind } from "@/lib/phonetics";

type SmokeTestsProps = {
  separator: SepKind;
  showArabic: boolean;
};

export function SmokeTests({ separator, showArabic }: SmokeTestsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">Self-Check</CardTitle>
        <CardDescription>Visual tests for core transformation rules.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {smokeTests.map((w) => {
            const toks = transformWord(w);
            return (
              <div key={w} className="rounded-lg border p-3 bg-background">
                <div className="font-medium text-foreground/80">{w}</div>
                <div className="text-base break-words font-mono text-primary">{joinTokensEnWith(toks, SEP_MAP[separator])}</div>
                {showArabic && <div dir="rtl" className="text-xl text-right break-words">{joinTokens(toks, toArabic)}</div>}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          If any of these look off to your ear, let us know the exact expected EN-line so the rules can be tuned.
        </p>
      </CardContent>
    </Card>
  );
}
