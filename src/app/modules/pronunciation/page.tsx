
import { AliRespeakerClient } from "@/components/ali-respeaker-client";
import { RuleBook } from '@/components/workbench/rule-book';
import { getRuleBookWords, deleteWordFromRuleBook, updateWordAnalysis } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookMarked, FlaskConical } from 'lucide-react';


// This is a server component to fetch initial data
export default async function PronunciationModulePage() {
    const savedWords = await getRuleBookWords();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline mb-1 flex items-center gap-2">
                    <FlaskConical className="w-6 h-6 text-primary" />
                     Pronunciation Workbench
                </h1>
                <p className="text-muted-foreground">The lab for analyzing and perfecting French pronunciation.</p>
            </div>
            <AliRespeakerClient />
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
                    <RuleBook savedWords={savedWords} onDeleteWord={deleteWordFromRuleBook} onUpdateWord={updateWordAnalysis} />
                </CardContent>
            </Card>
        </div>
    );
}
