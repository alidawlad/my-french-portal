// src/components/workbench/rule-radar.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Rule } from "@/lib/phonetics";
import { Radar } from "lucide-react";

type TriggeredRule = {
    rule: Rule;
    count: number;
    examples: Set<string>;
}

type RuleRadarProps = {
  triggeredRules: TriggeredRule[];
};

export function RuleRadar({ triggeredRules }: RuleRadarProps) {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <Radar className="w-5 h-5 text-primary" />
          Rule Radar
        </CardTitle>
        <CardDescription>
          Phonetic and grammar rules triggered in this session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {triggeredRules.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No special rules triggered yet. Start typing in the workbench!
          </p>
        ) : (
          <ul className="space-y-3">
            {triggeredRules.map(({ rule, count, examples }) => (
              <li key={rule.key} className="text-sm border-b border-dashed border-border/50 pb-2">
                <div className="flex justify-between items-start">
                    <span className="font-medium text-foreground/90">{rule.label}</span>
                    <Badge variant="secondary" className="ml-2">{count}</Badge>
                </div>
                <p className="text-xs text-muted-foreground italic truncate">
                    e.g., {Array.from(examples).slice(0,3).join(', ')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
