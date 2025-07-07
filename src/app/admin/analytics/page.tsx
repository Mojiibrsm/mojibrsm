'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Review site performance and user engagement.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
           <CardDescription>This feature is currently under development.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>The analytics dashboard will be available here shortly.</p>
        </CardContent>
      </Card>
    </div>
  )
}
