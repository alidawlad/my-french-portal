"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RefreshCcw } from "lucide-react";
import type { SepKind } from "@/lib/phonetics";
import { cn } from "@/lib/utils";

type WorkbenchHeaderProps = {
  showArabic: boolean;
  onShowArabicChange: (checked: boolean) => void;
  separator: SepKind;
  onSeparatorChange: (kind: SepKind) => void;
  onLoadExamples: () => void;
};

export function WorkbenchHeader({
  showArabic,
  onShowArabicChange,
  separator,
  onSeparatorChange,
  onLoadExamples,
}: WorkbenchHeaderProps) {
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
    </header>
  );
}
