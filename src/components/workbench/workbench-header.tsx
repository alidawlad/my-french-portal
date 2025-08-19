// src/components/workbench/workbench-header.tsx
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
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-4 space-y-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-headline font-semibold tracking-tight text-foreground">
          Ali Pronunciation Workbench
        </h1>
        <Button variant="outline" size="sm" onClick={onLoadExamples}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Load examples
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="arabic-switch" className="text-sm font-medium">Arabic line</Label>
          <Switch id="arabic-switch" checked={showArabic} onCheckedChange={onShowArabicChange} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Separator</span>
          <div className="flex items-center rounded-md border bg-background/50 p-1">
            {(['hyphen', 'middot', 'space', 'none'] as SepKind[]).map(opt => (
              <Button
                key={opt}
                variant="ghost"
                size="sm"
                onClick={() => onSeparatorChange(opt)}
                className={cn(
                    "h-6 px-2.5 text-xs",
                    separator === opt ? 'bg-primary/20 text-primary-foreground hover:bg-primary/30' : 'hover:bg-muted'
                )}
              >
                {opt === 'hyphen' ? '‑' : opt === 'middot' ? '·' : opt === 'space' ? 'sqcup' : 'none'}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
