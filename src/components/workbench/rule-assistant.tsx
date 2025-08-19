// src/components/workbench/rule-assistant.tsx
"use client";

import { useState } from "react";
import { getRuleAssistantResponse } from "@/app/actions";
import type { RuleAssistantInput } from "@/ai/flows/rule-assistant-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type RuleAssistantProps = {
  text: string;
};

export function RuleAssistant({ text }: RuleAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [queryType, setQueryType] = useState<RuleAssistantInput['type']>('explain_grammar');
  const [response, setResponse] = useState<string | null>(null);
  const { toast } = useToast();

  const handleQuery = async () => {
    if (!query.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Query",
        description: "Please enter a word or phrase to ask about.",
      });
      return;
    }

    setLoading(true);
    setResponse(null);
    try {
      const result = await getRuleAssistantResponse({ text, query, type: queryType });
      setResponse(result.explanation);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not get a response from the AI. Please try again.",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="font-headline text-lg">Rule Assistant</CardTitle>
        <CardDescription className="text-sm">
          Ask the AI about grammar, phonetics, or for similar words from your text.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="query-input">Word or phrase to ask about</Label>
            <Input
                id="query-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., 'amis' or 'les amis arrivent'"
                disabled={loading}
            />
        </div>

        <RadioGroup
          value={queryType}
          onValueChange={(value: RuleAssistantInput['type']) => setQueryType(value)}
          className="flex flex-wrap gap-4"
          disabled={loading}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="explain_grammar" id="r1" />
            <Label htmlFor="r1">Explain Grammar</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="explain_phonetics" id="r2" />
            <Label htmlFor="r2">Explain Phonetics</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="find_similar" id="r3" />
            <Label htmlFor="r3">Find Similar Words</Label>
          </div>
        </RadioGroup>

        <Button onClick={handleQuery} disabled={loading || !text.trim()}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Ask AI Tutor
        </Button>

        {loading && (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="ml-3 text-muted-foreground">AI tutor is thinking...</p>
          </div>
        )}

        {response && (
            <div className="p-4 bg-background rounded-lg border">
                <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{response}</p>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
