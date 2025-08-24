
import { RuleBook } from '@/components/workbench/rule-book';
import { getRuleBookWords, deleteWordFromRuleBook, updateWordAnalysis } from '@/app/actions';

export default async function RuleBookPage() {
  const words = await getRuleBookWords();

  return (
    <div>
        <h1 className="text-3xl font-bold font-headline mb-4">Rule Book</h1>
         <RuleBook savedWords={words} onDeleteWord={deleteWordFromRuleBook} onUpdateWord={updateWordAnalysis} />
    </div>
  );
}
