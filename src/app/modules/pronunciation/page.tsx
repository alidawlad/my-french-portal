
import { AliRespeakerClient } from "@/components/ali-respeaker-client";
import { RuleBook } from '@/components/workbench/rule-book';
import { getRuleBookWords, deleteWordFromRuleBook, updateWordAnalysis, saveWordToRuleBook } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookMarked, Loader2 } from 'lucide-react';


// This is a server component to fetch initial data
export default async function PronunciationModulePage() {
    const savedWords = await getRuleBookWords();

    return (
        <div className="space-y-8">
            <AliRespeakerClient />
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-primary" />
                    Your Rule Book
                    </CardTitle>
                    <CardDescription>
                    Your personal collection of words and phrases. Analyze them further with the AI Coach tools inside each card.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RuleBook savedWords={savedWords} onDeleteWord={deleteWordFromRuleBook} onUpdateWord={updateWordAnalysis} />
                </CardContent>
            </Card>
        </div>
    );
}
