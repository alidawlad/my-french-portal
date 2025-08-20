
// src/components/workbench/input-section.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { type Rule, RULES, type RuleCategory } from "@/lib/phonetics";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Volume2, Loader2, Bookmark, Wand2, Sparkles, BrainCircuit, MessageSquareQuote, ListFilter } from 'lucide-react';
import { getAudioForText, getEnglishMeaning, getRuleAssistantResponse } from '@/app/actions';
import type { RuleAssistantInput, RuleAssistantOutput } from '@/ai/flows/rule-assistant-flow';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type InputSectionProps = {
  text: string;
  onTextChange: (value: string) => void;
  lines: { en: string; ar: string };
  showArabic: boolean;
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

const actionChips: {label: string; type: RuleAssistantInput['type']; icon: React.ReactNode}[] = [
    { label: "Explain Grammar", type: "explain_grammar", icon: <BrainCircuit className="w-4 h-4" /> },
    { label: "Explain Phonetics", type: "explain_phonetics", icon: <MessageSquareQuote className="w-4 h-4" /> },
    { label: "Find Similar Words", type: "find_similar", icon: <ListFilter className="w-4 h-4" /> },
]

export function InputSection({
  text,
  onTextChange,
  lines,
  showArabic,
  onSaveWord,
  isSaving,
}: InputSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [userMeaning, setUserMeaning] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any | null>(null);
  const [lastQuery, setLastQuery] = useState<{query: string, type: RuleAssistantInput['type'] } | null>(null);
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

  const handleAiQuery = async (type: RuleAssistantInput['type']) => {
    const query = text.trim().split(/\s+/).slice(-2).join(' ');
    if (!query.trim()) {
      toast({ variant: "destructive", title: "Empty Text", description: "Please enter some text to analyze." });
      return;
    }
    setAiLoading(true);
    setAiResponse(null);
    setLastQuery({ query, type });

    try {
      const result = await getRuleAssistantResponse({ text, query, type });
      setAiResponse(JSON.parse(result.explanation));
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: "Could not get a response from the AI." });
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

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
        
        {/* Integrated AI Coach */}
        <div className="pt-4 space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">AI Quick Analysis</Label>
            <div className="flex flex-wrap gap-2">
                 {actionChips.map(chip => (
                    <Button 
                        key={chip.type}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAiQuery(chip.type)}
                        disabled={aiLoading || !text.trim()}
                    >
                        {aiLoading && lastQuery?.type === chip.type ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <span className="mr-2">{chip.icon}</span>
                        )}
                        {chip.label}
                    </Button>
                ))}
            </div>

            {aiLoading && (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="ml-2">AI is thinking...</p>
              </div>
            )}

            {aiResponse && (
                <div className="space-y-2 mt-4 p-3 bg-background/50 rounded-lg border">
                    {lastQuery && (
                        <div className="text-xs font-semibold text-muted-foreground">
                            For "{lastQuery.query}"...
                        </div>
                    )}
                   <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        {aiResponse.summary && <p className="font-semibold">{aiResponse.summary}</p>}
                        {aiResponse.details && <p className="mt-1 text-foreground/80">{aiResponse.details}</p>}
                        {aiResponse.pattern && <p className="font-semibold">{aiResponse.pattern}</p>}
                        {aiResponse.words && (
                          <ul className="list-disc list-inside mt-1 text-foreground/80">
                            {aiResponse.words.map((w: string, i: number) => <li key={i}>{w}</li>)}
                          </ul>
                        )}
                      </div>
                    </div>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

    