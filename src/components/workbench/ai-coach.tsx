// src/components/workbench/ai-coach.tsx
"use client";

import { useState, useEffect } from "react";
import { getRuleAssistantResponse } from "@/app/actions";
import type { RuleAssistantInput } from "@/ai/flows/rule-assistant-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Loader2, Sparkles, BrainCircuit, MessageSquareQuote, ListFilter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AiCoachProps = {
  text: string;
};

const actionChips: {label: string; type: RuleAssistantInput['type']; icon: React.ReactNode}[] = [
    { label: "Explain Grammar", type: "explain_grammar", icon: <BrainCircuit className="w-4 h-4" /> },
    { label: "Explain Phonetics", type: "explain_phonetics", icon: <MessageSquareQuote className="w-4 h-4" /> },
    { label: "Find Similar Words", type: "find_similar", icon: <ListFilter className="w-4 h-4" /> },
]

export function AiCoach({ text }: AiCoachProps) {
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState<{query: string, type: RuleAssistantInput['type'] } | null>(null);
  const [response, setResponse] = useState<any | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleQuery = async (type: RuleAssistantInput['type']) => {
    const query = text.split(/\s+/).filter(Boolean).slice(-2).join(' ') || text;

    if (!query.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Text",
        description: "Please enter some text in the workbench to analyze.",
      });
      return;
    }

    setLoading(true);
    setResponse(null);
    setLastQuery({ query, type });

    try {
      const result = await getRuleAssistantResponse({ text, query, type });
      setResponse(JSON.parse(result.explanation));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not get a response from the AI. Please try again.",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderResponse = (response: any | undefined) => {
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
                            {response.words.map((w: string, i: number) => <li key={i}>{w}</li>)}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
  };


  if (!isClient) {
    return null;
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            AI Coach
        </CardTitle>
        <CardDescription>
          Get instant help on the text you've entered in the workbench.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">Select an action:</div>
        <div className="flex flex-col items-start gap-2">
            {actionChips.map(chip => (
                <Button 
                    key={chip.type}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuery(chip.type)}
                    disabled={loading || !text.trim()}
                    className="w-full justify-start"
                >
                    {loading && lastQuery?.type === chip.type ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <span className="mr-2">{chip.icon}</span>
                    )}
                    {chip.label}
                </Button>
            ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="ml-2">AI is thinking...</p>
          </div>
        )}

        {response && (
            <div className="p-3 bg-background rounded-lg border mt-4">
                <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                        {lastQuery && (
                            <div className="text-xs font-semibold text-muted-foreground mb-2">
                                For "{lastQuery.query}"...
                            </div>
                        )}
                        {renderResponse(response)}
                    </div>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
