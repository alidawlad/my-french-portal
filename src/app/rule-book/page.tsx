
import { RuleBook } from '@/components/workbench/rule-book';
import { getRuleBookWords, deleteWordFromRuleBook, updateWordAnalysis } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookMarked } from 'lucide-react';

export default async function RuleBookPage() {
  const words = await getRuleBookWords();

  return (
    <div>
        <h1 className="text-3xl font-bold font-headline mb-4">Rule Book</h1>
         <RuleBook savedWords={words} onDeleteWord={deleteWordFromRuleBook} onUpdateWord={updateWordAnalysis} />
    </div>
  );
}
