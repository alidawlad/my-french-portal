
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-4">Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the reports page. Your progress and KPIs will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
