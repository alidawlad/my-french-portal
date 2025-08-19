"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RefreshCcw, Eye, EyeOff } from "lucide-react";
import type { SepKind } from "@/lib/phonetics";
import { cn } from "@/lib/utils";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type WorkbenchHeaderProps = {
  showArabic: boolean;
  onShowArabicChange: (checked: boolean) => void;
  separator: SepKind;
  onSeparatorChange: (kind: SepKind) => void;
  onLoadExamples: () => void;
  apiKey: string;
};

export function WorkbenchHeader({
  showArabic,
  onShowArabicChange,
  separator,
  onSeparatorChange,
  onLoadExamples,
  apiKey: initialApiKey,
}: WorkbenchHeaderProps) {
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // This function would handle state updates if we were saving the key.
    // For now, it's just a read-only display based on env vars.
  };

  return (
    <header className="space-y-4">
      <h1 className="text-3xl lg:text-4xl font-headline font-semibold tracking-tight text-foreground">
        Ali FR‑EN‑AR Pronunciation Workbench
      </h1>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="arabic-switch" className="text-sm text-muted-foreground">Arabic line</Label>
          <Switch id="arabic-switch" checked={showArabic} onCheckedChange={onShowArabicChange} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Token separator</span>
          <div className="flex items-center rounded-md border bg-background p-1">
            {(['hyphen', 'middot', 'space', 'none'] as SepKind[]).map(opt => (
              <Button
                key={opt}
                variant="ghost"
                size="sm"
                onClick={() => onSeparatorChange(opt)}
                className={cn(
                    "h-7 px-3",
                    separator === opt ? 'bg-primary/20 text-primary-foreground hover:bg-primary/30' : 'hover:bg-muted'
                )}
              >
                {opt === 'hyphen' ? '‑' : opt === 'middot' ? '·' : opt === 'space' ? 'space' : 'none'}
              </Button>
            ))}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onLoadExamples}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Load examples
        </Button>
      </div>
       <div className="flex items-center gap-2 max-w-md">
          <Label htmlFor="api-key-input" className="text-sm text-muted-foreground flex-shrink-0">Gemini API Key</Label>
          <div className="relative w-full">
            <Input
              id="api-key-input"
              type={showKey ? 'text' : 'password'}
              value={initialApiKey}
              readOnly
              className="pr-10 bg-input"
              placeholder="Your API key is not set"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute inset-y-0 right-0 h-full w-10 text-muted-foreground"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff /> : <Eye />}
              <span className="sr-only">{showKey ? 'Hide API key' : 'Show API key'}</span>
            </Button>
          </div>
        </div>
    </header>
  );
}
