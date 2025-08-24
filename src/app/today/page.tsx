
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TodayPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-4">Today</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the today page. Your daily plan and activities will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
