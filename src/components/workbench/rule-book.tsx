// src/components/workbench/rule-book.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRuleAssistantResponse, getDictionaryDefinitions, updateWordAnalysis, getAudioForText } from "@/app/actions";
import type { RuleAssistantInput } from "@/ai/flows/rule-assistant-flow";
import type { DictionaryOutput } from '@/ai/flows/dictionary-flow';
import { useToast } from "@/hooks/use-toast";
import { BookMarked, BrainCircuit, MessageSquareQuote, ListFilter, Sparkles, Loader2, Trash2, ChevronDown, BookOpen, Volume2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from '../ui/badge';

export type AIResponse = {
  summary?: string;
  details?: string;
  pattern?: string;
  words?: string[];
}

export type AIAnalysis = {
    definitions?: DictionaryOutput;
    explain_phonetics?: AIResponse;
    explain_grammar?: AIResponse;
    find_similar?: AIResponse;
};

export type SavedWord = {
  id: string;
  fr_line: string;
  en_line: string; // User-provided meaning
  ali_respell: string; // Generated respelling
  analysis: AIAnalysis;
  audio_data_uri: string | null; // Base64 encoded audio data
  timestamp: Date;
};

type RuleBookProps = {
  savedWords: SavedWord[];
  onDeleteWord: (id: string) => void;
  onUpdateWord: (word: SavedWord) => void;
};

export function RuleBook({ savedWords, onDeleteWord, onUpdateWord }: RuleBookProps) {
  if (savedWords.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg border-dashed">
        <BookMarked className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          No words saved yet.
        </p>
        <p className="text-xs text-muted-foreground/80">
          Save words from the workbench to start your collection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedWords.map((word) => (
        <SavedWordCard key={word.id} word={word} onDeleteWord={onDeleteWord} onUpdateWord={onUpdateWord} />
      ))}
    </div>
  );
}


function SavedWordCard({ word, onDeleteWord, onUpdateWord }: { word: SavedWord; onDeleteWord: (id: string) => void, onUpdateWord: (word: SavedWord) => void }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const analysis = word.analysis || {};

  const handleAiQuery = async (type: 'explain_phonetics' | 'explain_grammar' | 'find_similar') => {
    setLoading(type);
    try {
      const result = await getRuleAssistantResponse({
        text: word.fr_line,
        query: word.fr_line,
        type,
      });
      const parsedExplanation = JSON.parse(result.explanation);
      const newAnalysis = { ...analysis, [type]: parsedExplanation };

      await updateWordAnalysis(word.id, { [type]: parsedExplanation });
      onUpdateWord({ ...word, analysis: newAnalysis });
      
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "AI Error", description: "Could not get an explanation." });
    } finally {
      setLoading(null);
    }
  };

  const handleFetchDefinitions = async () => {
    if (analysis.definitions) return;
    setLoading('definitions');
    try {
        const definitions = await getDictionaryDefinitions(word.fr_line);
        const newAnalysis = { ...analysis, definitions };
        
        await updateWordAnalysis(word.id, { definitions });
        onUpdateWord({ ...word, analysis: newAnalysis });
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "AI Error", description: "Could not fetch definitions." });
    } finally {
        setLoading(null);
    }
  };

  const handlePlayAudio = async () => {
    setIsPlaying(true);
    let audioDataUri = word.audio_data_uri;
    
    try {
      // If we don't have cached audio, generate and save it
      if (!audioDataUri) {
        toast({ title: "Generating Audio...", description: "This may take a moment." });
        const { audio } = await getAudioForText(word.fr_line);
        audioDataUri = audio;
        if (audioDataUri) {
          await updateWordAnalysis(word.id, { audio_data_uri: audioDataUri });
          onUpdateWord({ ...word, audio_data_uri: audioDataUri });
        }
      }

      if (audioDataUri) {
        const audio = new Audio(audioDataUri);
        audio.play();
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          toast({ variant: "destructive", title: "Error", description: "Could not play audio."});
          setIsPlaying(false);
        }
      } else {
        toast({ variant: "destructive", title: "Audio Failed", description: "Could not generate or play audio."});
        setIsPlaying(false);
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Audio Error", description: "An unexpected error occurred." });
      setIsPlaying(false);
    }
  }


  const renderResponse = (response: AIResponse | undefined) => {
    if (!response) return null;
    return (
      <div className="p-3 bg-background/50 rounded-lg border mt-2">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            {response.summary && <p className="font-semibold">{response.summary}</p>}
            {response.details && <p className="mt-1 text-foreground/80">{response.details}</p>}
            {response.pattern && <p className="font-semibold">{response.pattern}</p>}
            {response.words && (
              <ul className="list-disc list-inside mt-1 text-foreground/80">
                {response.words.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    await onDeleteWord(word.id);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div className="flex-grow">
                <div className="flex items-center gap-2">
                    <CardTitle className="font-headline text-lg">{word.fr_line}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={handlePlayAudio} disabled={isPlaying} className="h-7 w-7 text-muted-foreground">
                        {isPlaying ? <Loader2 className="h-4 w-4 animate-spin"/> : <Volume2 className="h-4 w-4"/>}
                    </Button>
                </div>
                {word.en_line && <CardDescription>Your meaning: "{word.en_line}"</CardDescription>}
            </div>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-8 w-8 flex-shrink-0" disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "{word.fr_line}" from your saved words. This action cannot be undone.
                        </Description>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Yes, delete it
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
          <div>
            <Badge variant="secondary">Ali Respell</Badge>
            <p className="text-md tracking-wide font-medium text-muted-foreground mt-1">{word.ali_respell}</p>
          </div>
          {analysis.definitions && (
            <div>
                <Badge variant="secondary">Dictionary</Badge>
                 <div className="text-sm space-y-1 text-foreground/80 mt-1">
                    {analysis.definitions.englishDefinition && <p><strong className="font-medium text-foreground/90">EN:</strong> {analysis.definitions.englishDefinition}</p>}
                    {analysis.definitions.frenchDefinition && <p><strong className="font-medium text-foreground/90">FR:</strong> {analysis.definitions.frenchDefinition}</p>}
                </div>
            </div>
          )}
      </CardContent>
      <CardFooter>
        <Collapsible className="w-full space-y-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <BrainCircuit className="h-4 w-4 mr-2" />
              AI Coach
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={handleFetchDefinitions} disabled={!!loading || !!analysis.definitions} className="text-xs h-7">
                    {loading === 'definitions' ? <Loader2 className="mr-2 h-3 w-3 animate-spin"/> : <BookOpen className="mr-2 h-3 w-3" />}
                    Get Definitions
                </Button>
                {(['explain_phonetics', 'explain_grammar', 'find_similar'] as const).map(type => {
                  const isLoading = loading === type;
                  return (
                    <Button 
                      key={type} 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleAiQuery(type)}
                      disabled={!!loading || !!analysis[type]}
                      className="text-xs h-7"
                    >
                      {isLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : (
                        <>
                          {type === 'explain_phonetics' && <MessageSquareQuote className="mr-2 h-3 w-3" />}
                          {type === 'explain_grammar' && <BrainCircuit className="mr-2 h-3 w-3" />}
                          {type === 'find_similar' && <ListFilter className="mr-2 h-3 w-3" />}
                        </>
                      )}
                      {type.replace(/_/g, ' ')}
                    </Button>
                  )
                })}
              </div>
            {renderResponse(analysis.explain_phonetics)}
            {renderResponse(analysis.explain_grammar)}
            {renderResponse(analysis.find_similar)}
          </CollapsibleContent>
        </Collapsible>
      </CardFooter>
    </Card>
  );
}
