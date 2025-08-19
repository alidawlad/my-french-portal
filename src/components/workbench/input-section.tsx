
// src/components/workbench/input-section.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { type Rule, RULES, type RuleCategory } from "@/lib/phonetics";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Volume2, Loader2, Bookmark, Wand2 } from 'lucide-react';
import { getAudioForText, getEnglishMeaning } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type InputSectionProps = {
  text: string;
  onTextChange: (value: string) => void;
  lines: { en: string; ar: string };
  showArabic: boolean;
  examples: Array<{ label: string, text: string }>;
  onExampleClick: (text: string) => void;
  onSaveWord: (userMeaning: string) => void;
  isSaving: boolean;
};

const UnderlineColors: Record<RuleCategory, string> = {
    vowel: "border-blue-500",
    nasal: "border-amber-500",
    special: "border-purple-500",
    liaison: "border-green-500",
    silent: "border-gray-500 border-dashed",
};

const getRuleForWord = (word: string): Rule | undefined => {
    const lw = word.toLowerCase();
    // Prioritize longer matches first
    const sortedRules = [...RULES].sort((a,b) => {
        const aMatch = lw.match(a.re);
        const bMatch = lw.match(b.re);
        if (aMatch && bMatch) return bMatch[0].length - aMatch[0].length;
        if (aMatch) return -1;
        if (bMatch) return 1;
        return 0;
    });
    return sortedRules.find(r => r.re.test(lw));
}


export function InputSection({
  text,
  onTextChange,
  lines,
  showArabic,
  examples,
  onExampleClick,
  onSaveWord,
  isSaving,
}: InputSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [userMeaning, setUserMeaning] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();
  const gridCols = showArabic ? "grid-cols-3" : "grid-cols-2";

  const handlePlayAudio = async () => {
    if (!text.trim()) return;
    setIsPlaying(true);
    try {
      const { audio: audioDataUri } = await getAudioForText(text);
      if (audioDataUri) {
        const audio = new Audio(audioDataUri);
        audio.play();
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          toast({ variant: "destructive", title: "Error", description: "Could not play audio." });
          setIsPlaying(false);
        }
      } else {
         toast({ 
            variant: "destructive", 
            title: "Audio Generation Failed", 
            description: "Could not generate audio. Please check your Gemini API key." 
        });
         setIsPlaying(false);
      }
    } catch (error) {
      console.error(error);
      toast({ 
        variant: "destructive", 
        title: "Audio Error", 
        description: "An unexpected error occurred while trying to generate audio." 
      });
      setIsPlaying(false);
    }
  };

  const handleSuggestMeaning = async () => {
    if (!text.trim()) return;
    setIsSuggesting(true);
    try {
        const { meaning } = await getEnglishMeaning(text);
        setUserMeaning(meaning);
    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "AI Error",
            description: "Could not suggest a meaning.",
        });
    } finally {
        setIsSuggesting(false);
    }
  }

  const renderTextWithUnderlines = (inputText: string) => {
    return inputText.split(/(\s+)/).map((word, i) => {
        if (!word.trim()) return <span key={i}>{word}</span>;
        const rule = getRuleForWord(word);
        const underlineClass = rule ? UnderlineColors[rule.category] : 'border-transparent';

        return (
             <TooltipProvider key={i}>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <span className={`border-b-2 ${underlineClass}`}>{word}</span>
                    </TooltipTrigger>
                    {rule && <TooltipContent><p>{rule.label}</p></TooltipContent>}
                </Tooltip>
            </TooltipProvider>
        )
    })
  }

  const handleSave = () => {
    onSaveWord(userMeaning);
    setUserMeaning(""); // Clear input after saving
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="font-headline text-xl">Workbench</CardTitle>
            <CardDescription>Type French text to see it respelled and analyzed.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            id="french-input"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            rows={2}
            className="mt-1 resize-y bg-card text-lg"
            placeholder="Type or paste French text here..."
          />
           <div className="flex flex-wrap gap-2 pt-2">
            {examples.map((ex) => (
              <Badge
                key={ex.label}
                onClick={() => onExampleClick(ex.text)}
                className="cursor-pointer select-none"
                variant="secondary"
              >
                {ex.label}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="user-meaning">Your English meaning (optional)</Label>
            <div className="flex items-center gap-2">
                <Input
                    id="user-meaning"
                    value={userMeaning}
                    onChange={(e) => setUserMeaning(e.target.value)}
                    placeholder="e.g., 'Hello, how are you?'"
                />
                <Button variant="outline" size="icon" onClick={handleSuggestMeaning} disabled={!text.trim() || isSuggesting}>
                    {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Wand2 className="h-4 w-4" />}
                    <span className="sr-only">Suggest meaning</span>
                </Button>
            </div>
        </div>
        <Button onClick={handleSave} disabled={!text.trim() || isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bookmark className="mr-2 h-4 w-4" />}
            {isSaving ? "Saving..." : "Save to Rule Book"}
        </Button>
        <div className={`grid gap-4 ${gridCols} pt-4`}>
          <div className="rounded-lg border p-3 bg-background/50">
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex justify-between items-center">
                <span>FR-line (original)</span>
                <Button variant="ghost" size="icon" onClick={handlePlayAudio} disabled={isPlaying || !text.trim()} className="h-6 w-6">
                    {isPlaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                </Button>
            </div>
            <div className="min-h-[40px] whitespace-pre-wrap break-words text-lg font-medium">
                {renderTextWithUnderlines(text)}
            </div>
          </div>
          <div className="rounded-lg border p-3 bg-background/50">
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">EN-line (Ali respell)</div>
            <div className="min-h-[40px] whitespace-pre-wrap break-words text-lg tracking-wide font-medium">{lines.en}</div>
          </div>
          {showArabic && (
            <div className="rounded-lg border p-3 bg-background/50">
              <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">AR-line (approx.)</div>
              <div dir="rtl" className="min-h-[40px] whitespace-pre-wrap break-words text-xl text-right font-medium">{lines.ar}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
