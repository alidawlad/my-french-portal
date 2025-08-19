
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
} from "@/lib/phonetics";
import { WorkbenchHeader } from './workbench/workbench-header';
import { InputSection } from './workbench/input-section';
import { RuleBook, type SavedWord } from "./workbench/rule-book";
import { saveWordToRuleBook, getRuleBookWords, deleteWordFromRuleBook } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { AiCoach } from "./workbench/ai-coach";

export function AliRespeakerClient() {
  const [text, setText] = useState("");
  const [showArabic, setShowArabic] = useState(false); // Default to false
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
            description: `"${text}" has been added to your Saved Words.`,
        });
    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save the word.",
        });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteWord = async (wordId: string) => {
    try {
        await deleteWordFromRuleBook(wordId);
        setSavedWords(prev => prev.filter(word => word.id !== wordId));
        toast({
            title: "Deleted",
            description: "The word has been removed from your list."
        });
    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Delete Failed",
            description: "Could not delete the word."
        });
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <WorkbenchHeader
        showArabic={showArabic}
        onShowArabicChange={setShowArabic}
        separator={separator}
        onSeparatorChange={setSeparator}
        onLoadExamples={() => setText(Examples.map(e => e.text).join("\n"))}
      />
      
      <main className="container mx-auto p-4">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
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
                {isClient ? <RuleBook savedWords={savedWords} onDeleteWord={handleDeleteWord} /> : null}
            </div>
            <div className="lg:col-span-1">
                <AiCoach text={text} />
            </div>
        </div>
      </main>
    </div>
  );
}
