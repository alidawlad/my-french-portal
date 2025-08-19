"use client";

import { useState } from "react";
import { getPhoneticSuggestions } from "@/app/actions";
import type { SuggestPhoneticCorrectionsOutput } from "@/ai/flows/suggest-phonetic-corrections";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PhoneticExceptionSuggesterProps = {
  text: string;
};

export function PhoneticExceptionSuggester({ text }: PhoneticExceptionSuggesterProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestPhoneticCorrectionsOutput | null>(null);
  const { toast } = useToast();

  const handleSuggestion = async () => {
    setLoading(true);
    setSuggestions(null);
    try {
      const result = await getPhoneticSuggestions(text);
      setSuggestions(result);
       if (result.corrections.length === 0) {
        toast({
          title: "No exceptions found",
          description: "The AI didn't find any words with unusual phonetics in your text.",
        });
      }
    } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch suggestions. Please try again later.",
        });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline text-lg">Phonetic Exception Suggestor</CardTitle>
                <CardDescription className="text-sm">Use AI to find unusual words and suggest alternatives.</CardDescription>
            </div>
            <Button onClick={handleSuggestion} disabled={loading || !text.trim()} size="sm">
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Wand2 className="mr-2 h-4 w-4" />
            )}
            Suggest Corrections
            </Button>
        </div>
      </CardHeader>
      {(loading || suggestions) && (
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="ml-3 text-muted-foreground">AI is analyzing your text...</p>
            </div>
          )}
          {suggestions && suggestions.corrections.length > 0 && (
            <div className="space-y-3">
              {suggestions.corrections.map((correction, index) => (
                <Alert key={index}>
                  <AlertTitle className="font-semibold">{correction.word}</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2 text-foreground/80">{correction.reason}</p>
                    {correction.suggestions.length > 0 && (
                         <p><strong>Suggestions:</strong> {correction.suggestions.join(", ")}</p>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
          {suggestions && suggestions.corrections.length === 0 && (
             <div className="text-center text-sm text-muted-foreground py-4">
                No phonetic exceptions found in the provided text.
             </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
