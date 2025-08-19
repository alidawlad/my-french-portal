
// src/components/workbench/rule-book.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getRuleAssistantResponse } from "@/app/actions";
import type { RuleAssistantInput } from "@/ai/flows/rule-assistant-flow";
import { useToast } from "@/hooks/use-toast";
import { BookMarked, BrainCircuit, MessageSquareQuote, ListFilter, Sparkles, Loader2 } from "lucide-react";

export type SavedWord = {
  id: string;
  fr_line: string;
  en_line: string;
};

type RuleBookProps = {
  savedWords: SavedWord[];
};

type AIResponse = {
  summary?: string;
  details?: string;
  pattern?: string;
  words?: string[];
}

export function RuleBook({ savedWords }: RuleBookProps) {
  const [loading, setLoading] = useState<string | null>(null); // Stores "id-type"
  const [responses, setResponses] = useState<Record<string, AIResponse>>({});
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAiQuery = async (word: SavedWord, type: RuleAssistantInput['type']) => {
    const loadingKey = `${word.id}-${type}`;
    setLoading(loadingKey);

    try {
      const result = await getRuleAssistantResponse({
        text: word.fr_line,
        query: word.fr_line,
        type,
      });
      const parsedExplanation = JSON.parse(result.explanation);
      setResponses(prev => ({ ...prev, [loadingKey]: parsedExplanation }));
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not get an explanation from the AI.",
      });
    } finally {
      setLoading(null);
    }
  };

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
  
  if (!isClient) {
    return (
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-primary" />
                    Rule Book
                </CardTitle>
                <CardDescription>
                    Your saved words and their AI-powered explanations.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground italic">
                    Loading...
                </p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-primary" />
          Rule Book
        </CardTitle>
        <CardDescription>
          Your saved words and their AI-powered explanations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {savedWords.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Save words from the workbench to start your collection.
          </p>
        ) : (
          <Accordion type="multiple" className="w-full max-h-[60vh] overflow-y-auto pr-2">
            {savedWords.map((word) => (
              <AccordionItem key={word.id} value={word.id}>
                <AccordionTrigger>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{word.fr_line}</p>
                    <p className="text-sm text-muted-foreground tracking-wide">{word.en_line}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {(['explain_phonetics', 'explain_grammar', 'find_similar'] as const).map(type => {
                        const isLoading = loading === `${word.id}-${type}`;
                        return (
                          <Button 
                            key={type} 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleAiQuery(word, type)}
                            disabled={!!loading}
                          >
                            {isLoading ? (
                               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                               <>
                                {type === 'explain_phonetics' && <MessageSquareQuote className="mr-2 h-4 w-4" />}
                                {type === 'explain_grammar' && <BrainCircuit className="mr-2 h-4 w-4" />}
                                {type === 'find_similar' && <ListFilter className="mr-2 h-4 w-4" />}
                               </>
                            )}
                            {type.split('_')[1]}
                          </Button>
                        )
                      })}
                    </div>
                     {renderResponse(responses[`${word.id}-explain_phonetics`])}
                     {renderResponse(responses[`${word.id}-explain_grammar`])}
                     {renderResponse(responses[`${word.id}-find_similar`])}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
