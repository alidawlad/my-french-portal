// src/components/ali-respeaker-client.tsx
"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  SepKind,
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BookMarked, Loader2 } from "lucide-react";

export function AliRespeakerClient() {
  const [text, setText] = useState("");
  const [showArabic, setShowArabic] = useState(false);
  const [separator, setSeparator] = useState<SepKind>('hyphen');
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch initial words from Firestore
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
          description: "Could not load your Rule Book from the database. Please ensure Firestore is enabled in your Firebase project.",
        });
      } finally {
        setIsLoadingWords(false);
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
      outEN.push(joinTokensEnWith(tokens, separator));
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
        en_line: userMeaning,
        ali_respell: lines.en,
      };
      const newSavedWord = await saveWordToRuleBook(newWordData);
      setSavedWords(prev => [newSavedWord, ...prev]);
      toast({
        title: "Saved!",
        description: `"${text}" has been added to your Saved Words.`,
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
    // Optimistically update the UI
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
      // Revert if the deletion fails
      setSavedWords(originalWords);
    }
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
          lines={lines}
          showArabic={showArabic}
          onSaveWord={handleSaveWord}
          isSaving={isSaving}
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
              <RuleBook savedWords={savedWords} onDeleteWord={handleDeleteWord} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
