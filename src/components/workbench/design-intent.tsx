import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DesignIntent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">Design Intent</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground/80">
          This is an ADHD-friendly drill surface: low latency, minimal clicks, immediate dual-line feedback. Use it to build your own sentences, proper names, and to internalise rules. Treat outputs as training wheels and audition them against native audio (YouGlish/Forvo) when precision matters.
        </p>
      </CardContent>
    </Card>
  );
}
