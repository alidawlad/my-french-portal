// src/components/ali-respeaker-client.tsx
"use client";

import React, { useMemo, useState, useEffect, Fragment } from "react";
import {
  SepKind,
  transformWord,
  transformWordWithTrace,
  joinTokens,
  toArabic,
  toEN,
  SEP_MAP,
  type TokenTrace,
} from "@/lib/phonetics";
import { WorkbenchHeader } from './workbench/workbench-header';
import { InputSection } from './workbench/input-section';
import { RuleBook, type SavedWord, type AIAnalysis } from "./workbench/rule-book";
import { saveWordToRuleBook, getRuleBookWords, deleteWordFromRuleBook, updateWordAnalysis } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BookMarked, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";


const TraceColors: Record<string, string> = {
    vowel: "bg-blue-100 dark:bg-blue-900/50",
    nasal: "bg-amber-100 dark:bg-amber-900/50",
    special: "bg-purple-100 dark:bg-purple-900/50",
    liaison: "bg-green-100 dark:bg-green-900/50",
    silent: "bg-gray-100 dark:bg-gray-900/50",
    charMap: "bg-transparent",
    default: "bg-pink-100 dark:bg-pink-900/50"
};

const getTraceColor = (trace: TokenTrace) => {
    if (trace.ruleKey?.includes('nas')) return TraceColors.nasal;
    if (trace.ruleKey?.includes('Glide') || trace.ruleKey?.includes('Est') || trace.ruleKey?.includes('Il')) return TraceColors.special;
    if (trace.ruleKey === 'finalDrop') return TraceColors.silent;
    if (trace.changed) return TraceColors.default;
    return TraceColors.charMap;
}

export function AliRespeakerClient() {
  const [text, setText] = useState("un deux trois quatre cinq six sept huit neuf dix");
  const [showArabic, setShowArabic] = useState(false);
  const [separator, setSeparator] = useState<SepKind>('hyphen');
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWords = async () => {
      setIsLoadingWords(true);
      try {
        const words = await getRuleBookWords();
        setSavedWords(words);
      } catch (error) {
        console.error("Failed to fetch initial rule book words:", error);
        toast({
          variant: "destructive",
          title: "Load Failed",
          description: "Could not load your Rule Book. Please ensure Firestore is enabled in your Firebase project.",
        });
      } finally {
        setIsLoadingWords(false);
      }
    };
    fetchWords();
  }, [toast]);

 const { enTrace, arLine } = useMemo(() => {
    const words = text.split(/(\s+|(?<=[.,!?])|(?=['’]))/u).filter(Boolean);
    const outAR: string[] = [];
    const enTrace: (TokenTrace | string)[] = [];
    
    for (let i = 0; i < words.length; i++) {
        const w = words[i];

        // Liaison logic for six/dix
        if ((w.toLowerCase() === 'six' || w.toLowerCase() === 'dix') && i + 1 < words.length) {
            const nextWord = words.find((next, idx) => idx > i && next.trim());
            if (nextWord && /^[aeiouyàâäéèêëîïôöùûüœh]/i.test(nextWord)) {
                const traces = transformWordWithTrace(w);
                if (traces.length > 0) {
                   const lastTrace = traces[traces.length - 1];
                   if (lastTrace.out === 'S') {
                       lastTrace.out = 'Z‿';
                       lastTrace.ruleKey = 'sixDixLiaison';
                       lastTrace.note = `${w} + vowel → liaison with /z/`;
                       lastTrace.changed = true;
                   }
                }
                enTrace.push(...traces);
                outAR.push(joinTokens(traces.map(t=>t.out), toArabic));
                continue;
            }
        }
        
       if (w.includes('-') || w.includes('–') || w.includes('—')) {
        const subWords = w.split(/[-–—]/);
        subWords.forEach((subWord, idx) => {
          if (subWord) {
            const transformed = transformWordWithTrace(subWord);
            enTrace.push(...transformed);
            outAR.push(joinTokens(transformed.map(t=>t.out), toArabic));
          }
          if (idx < subWords.length - 1) {
            enTrace.push(' ');
          }
        })
        continue;
       }

       if (!/[\p{L}'’]/u.test(w)) {
        outAR.push(w);
        enTrace.push(w);
        continue;
      }
      const transformed = transformWordWithTrace(w);
      enTrace.push(...transformed);
      outAR.push(joinTokens(transformed.map(t=>t.out), toArabic));
    };

    return {
      enTrace,
      arLine: outAR.join("").replace(/\s+([.,!?])/g, '$1'),
    };
  }, [text]);

  const handleSaveWord = async (wordData: Omit<SavedWord, 'id' | 'timestamp'>) => {
    if (!wordData.fr_line.trim() || isSaving) return;
    setIsSaving(true);
    
    try {
      const newSavedWord = await saveWordToRuleBook(wordData);
      setSavedWords(prev => [newSavedWord, ...prev]);
      toast({
        title: "Saved!",
        description: `"${wordData.fr_line}" has been added to your Rule Book.`,
      });
      setText(""); // Clear input after saving
    } catch (error) {
      console.error("Save Error:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save the word. Please check the console for details.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWord = async (wordId: string) => {
    const originalWords = savedWords;
    setSavedWords(prev => prev.filter(word => word.id !== wordId));

    try {
      await deleteWordFromRuleBook(wordId);
      toast({
        title: "Deleted",
        description: "The word has been removed from your list."
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete the word. Reverting changes."
      });
      setSavedWords(originalWords);
    }
  }

  const handleUpdateWord = (updatedWord: SavedWord) => {
    setSavedWords(prev => prev.map(w => w.id === updatedWord.id ? updatedWord : w));
  }
  
  const renderEnLineWithTrace = (trace: (TokenTrace | string)[]) => {
    const sep = separator === 'none' ? '' : SEP_MAP[separator] ?? '-';
    let result = [];
    
    for(let i=0; i < trace.length; i++) {
        const item = trace[i];
        if (typeof item === 'string') {
            result.push(<span key={`str-${i}`}>{item}</span>);
            continue;
        }

        const isSilent = item.out.startsWith('(');
        let enToken = isSilent ? item.out.slice(1, -1) : toEN(item.out);
        const isLiaison = enToken.includes('‿');
        if (isLiaison) {
            enToken = enToken.replace('‿', '');
        }

        const node = (
            <TooltipProvider key={`trace-${i}`}>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                         <span className={`px-0.5 rounded-sm ${isSilent ? 'line-through text-muted-foreground' : getTraceColor(item)}`}>
                            {enToken}
                         </span>
                    </TooltipTrigger>
                    {item.changed && 
                        <TooltipContent>
                            <p className="font-mono text-xs">
                                <span className="font-semibold">{item.src}</span> → <span className="font-semibold">{toEN(item.out)}</span>
                            </p>
                            {item.note && <p className="text-xs text-muted-foreground">{item.note}</p>}
                        </TooltipContent>
                    }
                </Tooltip>
            </TooltipProvider>
        );
        result.push(node);
         if (isLiaison) {
            result.push(<span key={`liaison-${i}`} className="text-green-500">‿</span>)
        }
        if(i < trace.length -1 && typeof trace[i+1] !== 'string' && sep && !isLiaison) {
            result.push(<span key={`sep-${i}`}>{sep}</span>);
        }
    }
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
          onSaveWord={handleSaveWord}
          isSaving={isSaving}
          enLineTraceComponent={renderEnLineWithTrace(enTrace)}
        />
        
        <Card className="bg-background/50">
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-primary" />
              Your Saved Words
            </CardTitle>
            <CardDescription>
              Your personal collection of words and phrases. Analyze them further with the AI Coach tools inside each card.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingWords ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-12 w-12 text-muted-foreground/50 animate-spin" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Loading your saved words...
                </p>
              </div>
            ) : (
              <RuleBook savedWords={savedWords} onDeleteWord={handleDeleteWord} onUpdateWord={handleUpdateWord} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
