
import { AliRespeakerClient } from "@/components/ali-respeaker-client";
import { RuleBook } from '@/components/workbench/rule-book';
import { getRuleBookWords, deleteWordFromRuleBook, updateWordAnalysis } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookMarked, Layers } from 'lucide-react';
import { notFound } from 'next/navigation';

// This is now the generic page to handle all dynamic module structures.
// The folder name `[week]/[class]` is kept for historical reasons, but it now uses a catch-all `...path` param.
export default async function DynamicModulePage({ params }: { params: { path: string[] } }) {
    const path = params.path || [];

    if (path.length < 2) {
        notFound();
    }

    let title = "Dynamic Module";
    let description = "The lab for analyzing and perfecting French for this specific session.";
    const moduleTags: string[] = [];

    // Tutor session: /week-1/class-2
    if (path[0].startsWith('week-') && path[1].startsWith('class-')) {
        const weekId = path[0].split('-')[1];
        const classId = path[1].split('-')[1];
        title = `Tutor: Week ${weekId}, Class ${classId}`;
        description = `Words saved here will be tagged with 'week:${weekId}' and 'class:${classId}'.`;
        moduleTags.push(`week:${weekId}`, `class:${classId}`);
    } 
    // Speak App session: /part-1/unit-2/lesson-speaking-drill
    else if (path.length === 3 && path[0].startsWith('part-') && path[1].startsWith('unit-') && path[2].startsWith('lesson-')) {
        const partId = path[0].split('-')[1];
        const unitId = path[1].split('-')[1];
        const lessonType = path[2].substring('lesson-'.length).replace(/-/g, ' ');
        title = `Speak App: Part ${partId}, Unit ${unitId}`;
        description = `Lesson: ${lessonType}. Words saved here will be tagged for this module.`;
        moduleTags.push(`part:${partId}`, `unit:${unitId}`, `lesson:${path[2].substring('lesson-'.length)}`);
    } else {
        // Fallback or handle other structures
        notFound();
    }

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
                <h1 className="text-3xl font-bold font-headline mb-1 flex items-center gap-2 capitalize">
                    <Layers className="w-6 h-6 text-primary" />
                     {title}
                </h1>
                <p className="text-muted-foreground">{description}</p>
            </div>
            
            <AliRespeakerClient moduleTags={moduleTags} />
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <BookMarked className="w-5 h-5 text-primary" />
                        Saved Words in this Module
                    </CardTitle>
                    <CardDescription>
                        Words you save from the workbench above will be auto-tagged for this module.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RuleBook savedWords={moduleWords} onDeleteWord={handleDeleteWord} onUpdateWord={handleUpdateWord} />
                </CardContent>
            </Card>
        </div>
    );
}

// Catch-all route needs this to handle dynamic segment generation
export async function generateStaticParams() {
    // In a real app, you might pre-render popular modules.
    // For now, we'll let them be generated on-demand.
    return [];
}
