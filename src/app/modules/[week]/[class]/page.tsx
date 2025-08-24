
import { AliRespeakerClient } from "@/components/ali-respeaker-client";
import { RuleBook } from '@/components/workbench/rule-book';
import { getRuleBookWords, deleteWordFromRuleBook, updateWordAnalysis } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookMarked, Layers } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function DynamicModulePage({ params }: { params: Promise<{ week: string, class: string }> }) {
    const { week, class: classNum } = await params;

    const weekMatch = week.match(/^week-(\d+)$/);
    const classMatch = classNum.match(/^class-(\d+)$/);

    if (!weekMatch || !classMatch) {
        notFound();
    }

    const weekId = weekMatch[1];
    const classId = classMatch[1];
    const moduleTags = [`week:${weekId}`, `class:${classId}`];

    const allSavedWords = await getRuleBookWords();

    const moduleWords = allSavedWords.filter(word => 
        moduleTags.every(tag => word.tags.includes(tag))
    );

    const handleUpdateWord = async (wordId: string, updates: any) => {
        "use server";
        await updateWordAnalysis(wordId, updates);
    };

    const handleDeleteWord = async (wordId: string) => {
        "use server";
        await deleteWordFromRuleBook(wordId);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline mb-1 flex items-center gap-2">
                    <Layers className="w-6 h-6 text-primary" />
                     Module: Week {weekId}, Class {classId}
                </h1>
                <p className="text-muted-foreground">The lab for analyzing and perfecting French for this specific session.</p>
            </div>
            
            <AliRespeakerClient moduleTags={moduleTags} />
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <BookMarked className="w-5 h-5 text-primary" />
                        Saved Words in this Module
                    </CardTitle>
                    <CardDescription>
                        Words you save from the workbench above will appear here, auto-tagged with `week:{weekId}` and `class:{classId}`.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RuleBook savedWords={moduleWords} onDeleteWord={handleDeleteWord} onUpdateWord={handleUpdateWord} />
                </CardContent>
            </Card>
        </div>
    );
}
