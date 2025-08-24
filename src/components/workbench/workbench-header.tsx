
// src/components/workbench/workbench-header.tsx
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { SepKind } from "@/lib/phonetics";
import { cn } from "@/lib/utils";

type WorkbenchHeaderProps = {
  showArabic: boolean;
  onShowArabicChange: (checked: boolean) => void;
  separator: SepKind;
  onSeparatorChange: (kind: SepKind) => void;
};

export function WorkbenchHeader({
  showArabic,
  onShowArabicChange,
  separator,
  onSeparatorChange,
}: WorkbenchHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
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
  );
}
