"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RULES } from '@/lib/phonetics';

type DynamicRuleNotesProps = {
  text: string;
};

export function DynamicRuleNotes({ text }: DynamicRuleNotesProps) {
  const ruleNotes = useMemo(() => {
    const notesMap: Record<string, Set<string>> = Object.fromEntries(RULES.map(r => [r.key, new Set<string>()]));
    const words = text.split(/[\s,.;:!?]+/).filter(Boolean);
    words.forEach((w) => {
      const lw = w.toLowerCase();
      RULES.forEach(r => { if (r.re.test(lw)) notesMap[r.key].add(w.replace(/[.,;:]$/, '')); });
    });
    return Object.entries(notesMap)
      .filter(([, set]) => set.size > 0)
      .map(([key, set]) => ({ label: RULES.find(r => r.key === key)!.label, examples: Array.from(set).slice(0, 5) }));
  }, [text]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">Dynamic Rule Notes</CardTitle>
        <CardDescription>Based on what you typed</CardDescription>
      </CardHeader>
      <CardContent>
        {ruleNotes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No special pattern triggered yet. As you type, I’ll list changes like <i>c before e/i/y → S</i> with examples.
          </p>
        ) : (
          <ul className="list-disc ml-5 space-y-1.5 text-sm">
            {ruleNotes.map((n, i) => (
              <li key={i}>
                <strong>{n.label}</strong>{' '}
                <span className="text-muted-foreground">({n.examples.join(', ')})</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          These are context-driven changes. If you apply letters rigidly, check here to see when French rewrites the sound dynamically.
        </p>
      </CardContent>
    </Card>
  );
}
