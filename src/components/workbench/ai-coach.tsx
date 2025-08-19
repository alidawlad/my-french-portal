// src/components/workbench/ai-coach.tsx
"use client";

import { useState } from "react";
import { getRuleAssistantResponse } from "@/app/actions";
import type { RuleAssistantInput } from "@/ai/flows/rule-assistant-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Loader2, Sparkles, BrainCircuit, MessageSquareQuote, ListFilter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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
  const [response, setResponse] = useState<string | null>(null);
  const { toast } = useToast();

  const handleQuery = async (type: RuleAssistantInput['type']) => {
    // For now, we'll use the whole text as the query.
    // In a future version, this could be more granular.
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
      setResponse(result.explanation);
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
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{response}</p>
                    </div>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
