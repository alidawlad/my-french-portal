
import { RuleBook } from '@/components/workbench/rule-book';
import { getRuleBookWords, deleteWordFromRuleBook, updateWordAnalysis } from '@/app/actions';

export default async function RuleBookPage() {
  const words = await getRuleBookWords();

  const handleUpdateWord = async (wordId: string, updates: any) => {
    "use server";
    await updateWordAnalysis(wordId, updates);
  };

  const handleDeleteWord = async (wordId: string) => {
      "use server";
      await deleteWordFromRuleBook(wordId);
  };

  return (
    <div>
        <h1 className="text-3xl font-bold font-headline mb-4">Rule Book</h1>
         <RuleBook savedWords={words} onDeleteWord={handleDeleteWord} onUpdateWord={handleUpdateWord} />
    </div>
  );
}
