"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Examples,
  SepKind,
  SEP_MAP,
  transformWord,
  joinTokensEnWith,
  joinTokens,
  toArabic,
} from "@/lib/phonetics";
import { WorkbenchHeader } from './workbench/workbench-header';
import { InputSection } from './workbench/input-section';
import { DynamicRuleNotes } from "./workbench/dynamic-rule-notes";
import { PatternView } from "./workbench/pattern-view";
import { LetterTable } from "./workbench/letter-table";
import { OperationalRules } from "./workbench/operational-rules";
import { SmokeTests } from "./workbench/smoke-tests";
import { DesignIntent } from "./workbench/design-intent";

export function AliRespeakerClient() {
  const [text, setText] = useState("Thomas, William, Yasmine, Zohra\nLes amis arrivent.");
  const [showArabic, setShowArabic] = useState(true);
  const [separator, setSeparator] = useState<SepKind>('hyphen');
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const lines = useMemo(() => {
    const words = text.split(/(\s+|[^\p{L}\p{P}]+)/u).filter(Boolean);
    const outEN: string[] = [];
    const outAR: string[] = [];
    words.forEach((w) => {
      if (!/[\p{L}]/u.test(w)) {
        outEN.push(w);
        outAR.push(w);
        return;
      }
      const tokens = transformWord(w);
      outEN.push(joinTokensEnWith(tokens, SEP_MAP[separator]));
      outAR.push(joinTokens(tokens, toArabic));
    });
    return { en: outEN.join(""), ar: outAR.join("") };
  }, [text, separator]);
  
  if (!isClient) {
    return null; 
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 space-y-6 font-body">
      <WorkbenchHeader
        showArabic={showArabic}
        onShowArabicChange={setShowArabic}
        separator={separator}
        onSeparatorChange={setSeparator}
        onLoadExamples={() => setText(Examples.map(e => e.text).join("\n"))}
        apiKey={apiKey}
      />
      
      <InputSection
        text={text}
        onTextChange={setText}
        lines={lines}
        showArabic={showArabic}
        examples={Examples}
        onExampleClick={(exText) => setText((t) => (t ? t + "\n" : "") + exText)}
      />

      <DynamicRuleNotes text={text} />

      <PatternView text={text} />
      
      <LetterTable />
      
      <OperationalRules />

      <SmokeTests separator={separator} showArabic={showArabic} />

      <DesignIntent />
    </div>
  );
}
