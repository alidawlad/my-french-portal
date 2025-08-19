// src/components/ali-respeaker-client.tsx
"use client";

import React, { useMemo, useState } from "react";
import {
  Examples,
  SepKind,
  SEP_MAP,
  transformWord,
  joinTokensEnWith,
  joinTokens,
  toArabic,
  RULES,
  type Rule,
} from "@/lib/phonetics";
import { WorkbenchHeader } from './workbench/workbench-header';
import { InputSection } from './workbench/input-section';
import { AiCoach } from "./workbench/ai-coach";
import { RuleBook, type SavedWord } from "./workbench/rule-book";

export function AliRespeakerClient() {
  const [text, setText] = useState("Thomas");
  const [showArabic, setShowArabic] = useState(true);
  const [separator, setSeparator] = useState<SepKind>('hyphen');
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);

  const { lines, triggeredRules } = useMemo(() => {
    const words = text.split(/(\s+|[^\p{L}\p{P}]+)/u).filter(Boolean);
    const outEN: string[] = [];
    const outAR: string[] = [];
    const rulesTriggered: Map<string, { rule: Rule; count: number; examples: Set<string> }> = new Map();

    words.forEach((w) => {
      const tokens = transformWord(w);
       if (!/[\p{L}]/u.test(w)) {
        outEN.push(w);
        outAR.push(w);
        return;
      }
      
      const lw = w.toLowerCase();
      RULES.forEach(r => {
        if (r.re.test(lw)) {
          if (!rulesTriggered.has(r.key)) {
            rulesTriggered.set(r.key, { rule: r, count: 0, examples: new Set() });
          }
          const entry = rulesTriggered.get(r.key)!;
          entry.count += 1;
          entry.examples.add(w.replace(/[.,;:]$/, ''));
        }
      });

      outEN.push(joinTokensEnWith(tokens, SEP_MAP[separator]));
      outAR.push(joinTokens(tokens, toArabic));
    });

    return {
      lines: { en: outEN.join(""), ar: outAR.join("") },
      triggeredRules: Array.from(rulesTriggered.values()),
    };
  }, [text, separator]);

  const handleSaveWord = () => {
    if (!text.trim()) return;
    const newWord: SavedWord = {
      id: Date.now().toString(),
      fr_line: text,
      en_line: lines.en,
    };
    setSavedWords(prev => [...prev, newWord]);
  };


  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <WorkbenchHeader
        showArabic={showArabic}
        onShowArabicChange={setShowArabic}
        separator={separator}
        onSeparatorChange={setSeparator}
        onLoadExamples={() => setText(Examples.map(e => e.text).join("\n"))}
      />
      
      <main className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-4 p-4">
        <aside className="hidden lg:block">
          <AiCoach text={text} />
        </aside>

        <div className="space-y-4">
            <InputSection
                text={text}
                onTextChange={setText}
                lines={lines}
                showArabic={showArabic}
                examples={Examples}
                onExampleClick={(exText) => setText((t) => (t ? t + "\n" : "") + exText)}
                onSaveWord={handleSaveWord}
            />
        </div>

        <aside className="hidden lg:block">
          <RuleBook savedWords={savedWords} />
        </aside>
      </main>
    </div>
  );
}
