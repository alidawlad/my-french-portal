
import { AliRespeakerClient } from "@/components/ali-respeaker-client";
import { RuleBook } from '@/components/workbench/rule-book';
import { getRuleBookWords, deleteWordFromRuleBook, updateWordAnalysis } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookMarked, Layers } from 'lucide-react';


// This is a server component to fetch initial data
export default async function PronunciationModulePage() {
    const allSavedWords = await getRuleBookWords();

    // In a real app, you'd fetch module-specific words.
    // For now, we filter for words that have the 'pronunciation' tag.
    const moduleWords = allSavedWords.filter(word => word.tags.includes('pronunciation'));

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
                     Pronunciation Workbench
                </h1>
                <p className="text-muted-foreground">The lab for analyzing and perfecting French pronunciation.</p>
            </div>
            <AliRespeakerClient moduleTags={['pronunciation']} />
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-primary" />
                    Saved Words in this Module
                    </CardTitle>
                    <CardDescription>
                    Words you save from the workbench above will appear here, auto-tagged with 'pronunciation'.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RuleBook savedWords={moduleWords} onDeleteWord={handleDeleteWord} onUpdateWord={handleUpdateWord} />
                </CardContent>
            </Card>
        </div>
    );
}
