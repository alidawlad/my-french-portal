
// src/components/workbench/input-section.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { type Rule, RULES, type RuleCategory, getRuleForWord } from "@/lib/phonetics";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Volume2, Loader2, Bookmark, Wand2, Sparkles, BrainCircuit, MessageSquareQuote, ListFilter } from 'lucide-react';
import { getAudioForText, getDictionaryDefinitions, getRuleAssistantResponse, saveWordToRuleBook } from '@/app/actions';
import type { RuleAssistantInput, RuleAssistantOutput } from '@/ai/flows/rule-assistant-flow';
import type { DictionaryOutput } from '@/ai/flows/dictionary-flow';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { AIAnalysis, SavedWord } from './rule-book';
import { useRouter } from 'next/navigation';


type InputSectionProps = {
  text: string;
  onTextChange: (value: string) => void;
  lines: { en: string; ar: string };
  showArabic: boolean;
  onSaveWord: (wordData: Omit<SavedWord, 'id' | 'timestamp'>) => void;
  isSaving: boolean;
  enLineTraceComponent: React.ReactNode;
};

const UnderlineColors: Record<RuleCategory, string> = {
    vowel: "border-blue-500",
    nasal: "border-amber-500",
    special: "border-purple-500",
    liaison: "border-green-500",
    silent: "border-gray-500 border-dashed",
};

const actionChips: {label: string; type: keyof Omit<AIAnalysis, 'definitions'>; icon: React.ReactNode}[] = [
    { label: "Explain Phonetics", type: "explain_phonetics", icon: <MessageSquareQuote className="w-4 h-4" /> },
    { label: "Explain Grammar", type: "explain_grammar", icon: <BrainCircuit className="w-4 h-4" /> },
    { label: "Find Similar Words", type: "find_similar", icon: <ListFilter className="w-4 h-4" /> },
]

export function InputSection({
  text,
  onTextChange,
  lines,
  showArabic,
  isSaving,
  enLineTraceComponent,
}: InputSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [userMeaning, setUserMeaning] = useState("");
  const [tags, setTags] = useState("");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis>({});
  const [audioData, setAudioData] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const gridCols = showArabic ? "grid-cols-3" : "grid-cols-2";

  const handlePlayAudio = async () => {
    if (!text.trim()) return;
    setIsPlaying(true);
    try {
      const { audio: audioDataUri } = await getAudioForText(text);
      if (audioDataUri) {
        setAudioData(audioDataUri); // Cache the audio data
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
    setIsLoading('definitions');
    try {
        const definitions = await getDictionaryDefinitions(text);
        setUserMeaning(definitions.englishDefinition);
        setAnalysis(prev => ({...prev, definitions}));
    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "AI Error",
            description: "Could not suggest a meaning.",
        });
    } finally {
        setIsLoading(null);
    }
  }

  const handleAiQuery = async (type: 'explain_grammar' | 'explain_phonetics' | 'find_similar') => {
    if (!text.trim()) {
      toast({ variant: "destructive", title: "Empty Text", description: "Please enter some text to analyze." });
      return;
    }
    setIsLoading(type);

    try {
      const result = await getRuleAssistantResponse({ text, query: text.trim(), type });
      setAnalysis(prev => ({...prev, [type]: result}));
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: "Could not get a response from the AI." });
      console.error(error);
    } finally {
      setIsLoading(null);
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

  const handleSave = async () => {
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    
    try {
        await saveWordToRuleBook({
            fr_line: text,
            en_line: userMeaning,
            ali_respell: lines.en,
            analysis,
            audio_data_uri: audioData,
            tags: tagArray,
        });

        toast({
            title: "Saved!",
            description: `"${text}" has been added to your Rule Book.`,
        });

        // Reset state after saving
        onTextChange("");
        setUserMeaning("");
        setAnalysis({});
        setAudioData(null);
        setTags("");
        router.refresh(); // Refresh server components to show the new word in the list

    } catch (error) {
        console.error("Save Error:", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save the word. Please check the console for details.",
        });
    }
  }
  
  const renderAiResponse = (response: RuleAssistantOutput | undefined) => {
    if (!response || Object.keys(response).length === 0) return null;
    return (
        <div className="space-y-2 mt-2 p-3 bg-background/50 rounded-lg border">
           <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                {response.summary && <p className="font-semibold">{response.summary}</p>}
                {response.details && <p className="mt-1 text-foreground/80">{response.details}</p>}
                {response.pattern && <p className="font-semibold">{response.pattern}</p>}
                {response.words && (
                  <ul className="list-disc list-inside mt-1 text-foreground/80">
                    {response.words.map((w: string, i: number) => <li key={i}>{w}</li>)}
                  </ul>
                )}
              </div>
            </div>
        </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="font-headline text-xl">Workbench</CardTitle>
            <CardDescription>Type French text, get analysis, and save to your Rule Book.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            id="french-input"
            value={text}
            onChange={(e) => {
              onTextChange(e.target.value);
              setAnalysis({}); // Reset analysis on new text
              setUserMeaning("");
              setAudioData(null); // Reset audio on new text
              setTags("");
            }}
            rows={2}
            className="mt-1 resize-y bg-card text-lg"
            placeholder="Type or paste French text here..."
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="user-meaning">Your English meaning (optional)</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="user-meaning"
                        value={userMeaning}
                        onChange={(e) => setUserMeaning(e.target.value)}
                        placeholder="e.g., 'Hello, how are you?'"
                    />
                    <Button variant="outline" size="icon" onClick={handleSuggestMeaning} disabled={!text.trim() || !!isLoading}>
                        {isLoading === 'definitions' ? <Loader2 className="h-4 w-4 animate-spin"/> : <Wand2 className="h-4 w-4" />}
                        <span className="sr-only">Suggest meaning & definition</span>
                    </Button>
                </div>
            </div>
             <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., verb, numbers, greeting"
                />
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
            <div className="min-h-[40px] whitespace-pre-wrap break-words text-lg tracking-wide font-medium">{enLineTraceComponent}</div>
          </div>
          {showArabic && (
            <div className="rounded-lg border p-3 bg-background/50">
              <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">AR-line (approx.)</div>
              <div dir="rtl" className="min-h-[40px] whitespace-pre-wrap break-words text-xl text-right font-medium">{lines.ar}</div>
            </div>
          )}
        </div>
        
        <div className="pt-4 space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">AI Quick Analysis</Label>
            <div className="flex flex-wrap gap-2">
                 {actionChips.map(chip => (
                    <Button 
                        key={chip.type}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAiQuery(chip.type as any)}
                        disabled={!!isLoading || !text.trim()}
                    >
                        {isLoading === chip.type ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <span className="mr-2">{chip.icon}</span>
                        )}
                        {chip.label}
                    </Button>
                ))}
            </div>

            {isLoading && !Object.values(analysis).some(v => v) && (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="ml-2">AI is thinking...</p>
              </div>
            )}
            
            {analysis.definitions && (
              <div className="space-y-2 mt-2 p-3 bg-background/50 rounded-lg border">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    {analysis.definitions.frenchDefinition && <p><strong className="font-medium text-foreground/90">FR:</strong> {analysis.definitions.frenchDefinition}</p>}
                    {analysis.definitions.englishDefinition && <p><strong className="font-medium text-foreground/90">EN:</strong> {analysis.definitions.englishDefinition}</p>}
                  </div>
                </div>
              </div>
            )}
            {renderAiResponse(analysis.explain_phonetics)}
            {renderAiResponse(analysis.explain_grammar)}
            {renderAiResponse(analysis.find_similar)}
        </div>
      </CardContent>
    </Card>
  );
}
