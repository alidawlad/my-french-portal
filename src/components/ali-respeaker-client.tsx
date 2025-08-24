
// src/components/ali-respeaker-client.tsx
"use client";

import React, { useMemo, useState, useEffect, Fragment } from "react";
import {
  SepKind,
  transformWordWithTrace,
  joinTokens,
  toArabic,
  toEN,
  SEP_MAP,
  type TokenTrace,
} from "@/lib/phonetics";
import { WorkbenchHeader } from './workbench/workbench-header';
import { InputSection } from './workbench/input-section';
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BookMarked, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";


const TraceColors: Record<string, string> = {
    vowel: "bg-blue-100 dark:bg-blue-900/50",
    nasal: "bg-amber-100 dark:bg-amber-900/50",
    special: "bg-purple-100 dark:bg-purple-900/50",
    liaison: "bg-green-100 dark:bg-green-900/50",
    silent: "bg-gray-200 dark:bg-gray-700/50",
    charMap: "bg-transparent",
    default: "bg-pink-100 dark:bg-pink-900/50"
};

const getTraceColor = (trace: TokenTrace) => {
    if (!trace.changed) return TraceColors.charMap;
    if (trace.ruleKey?.includes('nas')) return TraceColors.nasal;
    if (trace.ruleKey?.includes('Glide') || trace.ruleKey?.includes('Est') || trace.ruleKey?.includes('Il') || trace.ruleKey?.includes('quK')) return TraceColors.special;
    if (trace.ruleKey === 'finalDrop' || trace.ruleKey === 'septPdrop' || trace.ruleKey === 'hSilent') return TraceColors.silent;
    if (trace.ruleKey?.includes('eu') || trace.ruleKey?.includes('oi') || trace.ruleKey?.includes('eau')) return TraceColors.vowel;
    return TraceColors.default;
}

export function AliRespeakerClient() {
  const [text, setText] = useState("un deux trois quatre cinq six sept huit neuf dix");
  const [showArabic, setShowArabic] = useState(false);
  const [separator, setSeparator] = useState<SepKind>('hyphen');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

 const { enTrace, arLine } = useMemo(() => {
    const words = text.split(/(\s+)/u).filter(Boolean);
    const outAR: string[] = [];
    const enTrace: (TokenTrace | string)[] = [];
    
    for (let i = 0; i < words.length; i++) {
        const w = words[i];

        if (w.includes('-') || w.includes('–') || w.includes('—')) {
            const subWords = w.split(/[-–—]/);
            subWords.forEach((subWord, idx) => {
              if (subWord) {
                const transformed = transformWordWithTrace(subWord);
                enTrace.push(...transformed);
                outAR.push(joinTokens(transformed.map(t=>t.out).filter(o => !o.startsWith('(')), toArabic));
              }
              if (idx < subWords.length - 1) {
                enTrace.push(' ');
              }
            });
            continue;
        }

        if ((w.toLowerCase() === 'six' || w.toLowerCase() === 'dix') && i + 1 < words.length) {
            const nextWord = words.find((next, idx) => idx > i && next.trim() && /[\p{L}]/u.test(next));
            if (nextWord && /^[aeiouyàâäéèêëîïôöùûüœh]/i.test(nextWord)) {
                const traces = transformWordWithTrace(w);
                if (traces.length > 0) {
                   const lastTrace = traces[traces.length - 1];
                   if (lastTrace.out.toUpperCase() === 'S') {
                       lastTrace.out = 'Z‿';
                       lastTrace.ruleKey = 'sixDixLiaison';
                       lastTrace.note = `${w} + vowel → liaison with /z/`;
                       lastTrace.changed = true;
                   }
                }
                enTrace.push(...traces);
                outAR.push(joinTokens(traces.map(t=>t.out).filter(o => !o.startsWith('(')), toArabic));
                continue;
            }
        }

       if (!/[\p{L}'’]/u.test(w)) {
        outAR.push(w);
        enTrace.push(w);
        continue;
      }
      const transformed = transformWordWithTrace(w);
      enTrace.push(...transformed);
      outAR.push(joinTokens(transformed.map(t=>t.out).filter(o => !o.startsWith('(')), toArabic));
    };

    return {
      enTrace,
      arLine: outAR.join("").replace(/\s+([.,!?])/g, '$1'),
    };
  }, [text]);


  
  const renderEnLineWithTrace = (trace: (TokenTrace | string)[]) => {
    const sep = separator === 'none' ? '' : SEP_MAP[separator] ?? '-';
    let result: React.ReactNode[] = [];
    
    trace.forEach((item, i) => {
        if (typeof item === 'string') {
            result.push(<span key={`str-${i}`}>{item}</span>);
            return;
        }

        const isSilent = item.out.startsWith('(') && item.out.endsWith(')');
        let enToken = isSilent ? toEN(item.out.slice(1, -1)) : toEN(item.out);

        const isLiaison = enToken.includes('‿');
        if (isLiaison) {
            enToken = enToken.replace('‿', '');
        }

        const node = (
            <TooltipProvider key={`trace-${i}`}>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                         <span className={`px-0.5 rounded-sm ${isSilent ? 'line-through text-muted-foreground/80' : getTraceColor(item)}`}>
                            {enToken}
                         </span>
                    </TooltipTrigger>
                    {item.changed && 
                        <TooltipContent>
                            <p className="font-mono text-sm">
                                <span className="font-semibold">{item.src}</span> → <span className="font-semibold">{toEN(item.out)}</span>
                            </p>
                            {item.note && <p className="text-sm text-muted-foreground">{item.note}</p>}
                        </TooltipContent>
                    }
                </Tooltip>
            </TooltipProvider>
        );
        result.push(node);
         if (isLiaison) {
            result.push(<span key={`liaison-${i}`} className="text-green-600 dark:text-green-400">‿</span>)
        }
        
        const nextItem = trace[i+1];
        const isLastItem = i === trace.length - 1;
        if (!isLastItem && typeof nextItem !== 'string' && sep && !isLiaison) {
            if (nextItem && !nextItem.out.startsWith('(')) {
                 result.push(<span key={`sep-${i}`}>{sep}</span>);
            }
        }
    });

    return <>{result}</>
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <WorkbenchHeader
        showArabic={showArabic}
        onShowArabicChange={setShowArabic}
        separator={separator}
        onSeparatorChange={setSeparator}
      />
      
      <main className="container mx-auto p-4 space-y-8">
        <InputSection
          text={text}
          onTextChange={setText}
          lines={{ en: enTrace.map(t => typeof t === 'string' ? t : toEN(t.out)).join(''), ar: arLine }}
          showArabic={showArabic}
          onSaveWord={() => {}}
          isSaving={isSaving}
          enLineTraceComponent={renderEnLineWithTrace(enTrace)}
        />
      </main>
    </div>
  );
}
