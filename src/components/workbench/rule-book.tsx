// src/components/workbench/rule-book.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRuleAssistantResponse, getDictionaryDefinitions, updateWordAnalysis, getAudioForText } from "@/app/actions";
import type { RuleAssistantOutput } from "@/ai/flows/rule-assistant-flow";
import type { DictionaryOutput } from '@/ai/flows/dictionary-flow';
import { useToast } from "@/hooks/use-toast";
import { BookMarked, BrainCircuit, MessageSquareQuote, ListFilter, Sparkles, Loader2, Trash2, ChevronDown, ChevronRight, BookOpen, Volume2, Tag, Search } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Checkbox } from '../ui/checkbox';
import { formatDistanceToNow } from 'date-fns';

export type AIAnalysis = {
    definitions?: DictionaryOutput;
    explain_phonetics?: RuleAssistantOutput;
    explain_grammar?: RuleAssistantOutput;
    find_similar?: RuleAssistantOutput;
};

export type SavedWord = {
  id: string;
  fr_line: string;
  en_line: string; // User-provided meaning
  ali_respell: string; // Generated respelling
  analysis: AIAnalysis;
  audio_data_uri: string | null; // Base64 encoded audio data
  tags: string[];
  timestamp: Date;
};

type RuleBookProps = {
  savedWords: SavedWord[];
  onDeleteWord: (id: string) => void;
  onUpdateWord: (word: SavedWord) => void;
};

function RuleBookToolbar({ onFilterChange, allTags }: { onFilterChange: (filters: { searchTerm: string, selectedTags: string[] }) => void, allTags: string[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        onFilterChange({ searchTerm: newSearchTerm, selectedTags });
    };

    const handleTagChange = (tag: string) => {
        const newSelectedTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];
        setSelectedTags(newSelectedTags);
        onFilterChange({ searchTerm, selectedTags: newSelectedTags });
    };

    return (
        <div className="flex flex-col md:flex-row gap-2 mb-4">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search words..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10"
                />
            </div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-shrink-0">
                        <ListFilter className="mr-2 h-4 w-4" />
                        Filter by Tag
                        {selectedTags.length > 0 && <span className="ml-2 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">{selectedTags.length}</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0">
                   <div className="p-4 space-y-2">
                       <h4 className="font-medium text-sm">Filter by Tags</h4>
                       {allTags.length > 0 ? (
                           allTags.map(tag => (
                               <div key={tag} className="flex items-center space-x-2">
                                   <Checkbox
                                       id={`tag-${tag}`}
                                       checked={selectedTags.includes(tag)}
                                       onCheckedChange={() => handleTagChange(tag)}
                                   />
                                   <label htmlFor={`tag-${tag}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                       {tag}
                                   </label>
                               </div>
                           ))
                       ) : (
                           <p className="text-sm text-muted-foreground">No tags available.</p>
                       )}
                   </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export function RuleBook({ savedWords, onDeleteWord, onUpdateWord }: RuleBookProps) {
    const [filters, setFilters] = useState({ searchTerm: '', selectedTags: [] as string[] });

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        savedWords.forEach(word => word.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }, [savedWords]);

    const filteredWords = useMemo(() => {
        return savedWords.filter(word => {
            const searchMatch = filters.searchTerm === '' ||
                word.fr_line.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                word.en_line.toLowerCase().includes(filters.searchTerm.toLowerCase());

            const tagMatch = filters.selectedTags.length === 0 ||
                filters.selectedTags.every(tag => word.tags.includes(tag));

            return searchMatch && tagMatch;
        });
    }, [savedWords, filters]);


  if (savedWords.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg border-dashed">
        <BookMarked className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          No words saved yet.
        </p>
        <p className="text-xs text-muted-foreground/80">
          Save words from the workbench to start your collection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <RuleBookToolbar onFilterChange={setFilters} allTags={allTags} />
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-8"></TableHead>
                        <TableHead>French & Meaning</TableHead>
                        <TableHead>Ali Respell</TableHead>
                        <TableHead className="hidden md:table-cell">Tags</TableHead>
                        <TableHead className="hidden lg:table-cell text-right">Added</TableHead>
                        <TableHead className="text-right w-12"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredWords.length > 0 ? (
                        filteredWords.map((word) => (
                            <SavedWordTableRow key={word.id} word={word} onDeleteWord={onDeleteWord} onUpdateWord={onUpdateWord} />
                        ))
                    ) : (
                         <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No words found. Try adjusting your filters.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Card>
    </div>
  );
}


function SavedWordTableRow({ word, onDeleteWord, onUpdateWord }: { word: SavedWord; onDeleteWord: (id: string) => void, onUpdateWord: (word: SavedWord) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(isDeleting);
  const { toast } = useToast();
  const analysis = word.analysis || {};

  const handleAiQuery = async (type: 'explain_phonetics' | 'explain_grammar' | 'find_similar') => {
    setLoading(type);
    try {
      const result = await getRuleAssistantResponse({
        text: word.fr_line,
        query: word.fr_line,
        type,
      });
      const newAnalysis = { ...analysis, [type]: result };

      await updateWordAnalysis(word.id, { [type]: result });
      onUpdateWord({ ...word, analysis: newAnalysis });
      
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "AI Error", description: "Could not get an explanation." });
    } finally {
      setLoading(null);
    }
  };

  const handleFetchDefinitions = async () => {
    if (analysis.definitions) return;
    setLoading('definitions');
    try {
        const definitions = await getDictionaryDefinitions(word.fr_line);
        const newAnalysis = { ...analysis, definitions };
        
        await updateWordAnalysis(word.id, { definitions });
        onUpdateWord({ ...word, analysis: newAnalysis });
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "AI Error", description: "Could not fetch definitions." });
    } finally {
        setLoading(null);
    }
  };

  const handlePlayAudio = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row from toggling
    setIsPlaying(true);
    let audioDataUri = word.audio_data_uri;
    
    try {
      if (!audioDataUri) {
        toast({ title: "Generating Audio...", description: "This may take a moment." });
        const { audio } = await getAudioForText(word.fr_line);
        audioDataUri = audio;
        if (audioDataUri) {
          await updateWordAnalysis(word.id, { audio_data_uri: audioDataUri });
          onUpdateWord({ ...word, audio_data_uri: audioDataUri });
        }
      }

      if (audioDataUri) {
        const audio = new Audio(audioDataUri);
        audio.play();
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          toast({ variant: "destructive", title: "Error", description: "Could not play audio."});
          setIsPlaying(false);
        }
      } else {
        toast({ variant: "destructive", title: "Audio Failed", description: "Could not generate or play audio."});
        setIsPlaying(false);
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Audio Error", description: "An unexpected error occurred." });
      setIsPlaying(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    await onDeleteWord(word.id);
  };

  const renderResponse = (response: RuleAssistantOutput | undefined) => {
    if (!response || Object.keys(response).length === 0) return null;
    return (
      <div className="p-3 bg-muted/50 rounded-lg border mt-2">
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

  return (
    <>
        <TableRow onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
            <TableCell>
                 <Button variant="ghost" size="icon" className="h-8 w-8">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
            </TableCell>
            <TableCell>
                <div className="font-medium flex items-center gap-2">
                    {word.fr_line}
                     <Button variant="ghost" size="icon" onClick={handlePlayAudio} disabled={isPlaying} className="h-7 w-7 text-muted-foreground opacity-50 hover:opacity-100">
                        {isPlaying ? <Loader2 className="h-4 w-4 animate-spin"/> : <Volume2 className="h-4 w-4"/>}
                    </Button>
                </div>
                <div className="text-sm text-muted-foreground">{word.en_line}</div>
            </TableCell>
            <TableCell>
                <span className="font-mono text-sm tracking-wide text-muted-foreground">{word.ali_respell}</span>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <div className="flex flex-wrap gap-1">
                    {word.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
            </TableCell>
             <TableCell className="hidden lg:table-cell text-right text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(word.timestamp), { addSuffix: true })}
            </TableCell>
            <TableCell className="text-right">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-8 w-8" disabled={isDeleting} onClick={(e) => e.stopPropagation()}>
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete "{word.fr_line}" from your saved words. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                Yes, delete it
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </TableCell>
        </TableRow>
        {isOpen && (
            <TableRow>
                <TableCell colSpan={6}>
                    <div className="p-4 bg-muted/30 rounded-md space-y-4">
                        <div className="font-semibold text-sm">AI Coach</div>
                         {analysis.definitions && (
                            <div>
                                <Badge variant="outline">Dictionary</Badge>
                                <div className="text-sm space-y-1 text-foreground/80 mt-1 p-3 bg-background/50 rounded-lg border">
                                    {analysis.definitions.englishDefinition && <p><strong className="font-medium text-foreground/90">EN:</strong> {analysis.definitions.englishDefinition}</p>}
                                    {analysis.definitions.frenchDefinition && <p><strong className="font-medium text-foreground/90">FR:</strong> {analysis.definitions.frenchDefinition}</p>}
                                </div>
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                           <Button size="sm" variant="outline" onClick={handleFetchDefinitions} disabled={!!loading || !!analysis.definitions}>
                                {loading === 'definitions' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BookOpen className="mr-2 h-4 w-4" />}
                                Get Definitions
                            </Button>
                            {(['explain_phonetics', 'explain_grammar', 'find_similar'] as const).map(type => {
                              const isLoading = loading === type;
                              return (
                                <Button key={type} size="sm" variant="outline" onClick={() => handleAiQuery(type)} disabled={!!loading || !!analysis[type]}>
                                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                                    <>
                                      {type === 'explain_phonetics' && <MessageSquareQuote className="mr-2 h-4 w-4" />}
                                      {type === 'explain_grammar' && <BrainCircuit className="mr-2 h-4 w-4" />}
                                      {type === 'find_similar' && <ListFilter className="mr-2 h-4 w-4" />}
                                    </>
                                  )}
                                  {type.replace(/_/g, ' ')}
                                </Button>
                              )
                            })}
                        </div>
                        {renderResponse(analysis.explain_phonetics)}
                        {renderResponse(analysis.explain_grammar)}
                        {renderResponse(analysis.find_similar)}
                    </div>
                </TableCell>
            </TableRow>
        )}
    </>
  );
}
