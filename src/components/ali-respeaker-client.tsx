
// src/components/ali-respeaker-client.tsx
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
  RULES,
  type Rule,
} from "@/lib/phonetics";
import { WorkbenchHeader } from './workbench/workbench-header';
import { InputSection } from './workbench/input-section';
import { AiCoach } from "./workbench/ai-coach";
import { RuleBook, type SavedWord } from "./workbench/rule-book";
import { saveWordToRuleBook, getRuleBookWords } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

export function AliRespeakerClient() {
  const [text, setText] = useState("");
  const [showArabic, setShowArabic] = useState(true);
  const [separator, setSeparator] = useState<SepKind>('hyphen');
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const fetchWords = async () => {
        try {
            const words = await getRuleBookWords();
            setSavedWords(words);
        } catch (error) {
            console.error("Failed to fetch initial rule book words:", error);
            toast({
                variant: "destructive",
                title: "Load Failed",
                description: "Could not load your Rule Book from the database.",
            });
        }
    };
    fetchWords();
  }, [toast]);

  const { lines } = useMemo(() => {
    const words = text.split(/(\s+|[^\p{L}\p{P}]+)/u).filter(Boolean);
    const outEN: string[] = [];
    const outAR: string[] = [];
    
    words.forEach((w) => {
      const tokens = transformWord(w);
       if (!/[\p{L}]/u.test(w)) {
        outEN.push(w);
        outAR.push(w);
        return;
      }
      outEN.push(joinTokensEnWith(tokens, SEP_MAP[separator]));
      outAR.push(joinTokens(tokens, toArabic));
    });

    return {
      lines: { en: outEN.join(""), ar: outAR.join("") },
    };
  }, [text, separator]);

  const handleSaveWord = async (userMeaning: string) => {
    if (!text.trim() || isSaving) return;
    setIsSaving(true);
    
    try {
        const newWordData = {
            fr_line: text,
            en_line: userMeaning, // User's custom meaning
            ali_respell: lines.en, // The generated respelling
        };
        const newSavedWord = await saveWordToRuleBook(newWordData);
        setSavedWords(prev => [newSavedWord, ...prev]);
        toast({
            title: "Saved!",
            description: `"${text}" has been added to your Rule Book.`,
        });
    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save the word to your Rule Book.",
        });
    } finally {
        setIsSaving(false);
    }
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
      
      <main className="container mx-auto p-4 space-y-8">
        <InputSection
            text={text}
            onTextChange={setText}
            lines={lines}
            showArabic={showArabic}
            examples={Examples}
            onExampleClick={(exText) => setText((t) => (t ? t + "\n" : "") + exText)}
            onSaveWord={handleSaveWord}
            isSaving={isSaving}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AiCoach text={text} />
            {isClient ? <RuleBook savedWords={savedWords} /> : null}
        </div>
      </main>
    </div>
  );
}
