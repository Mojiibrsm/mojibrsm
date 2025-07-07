
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LineChart } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Review site performance and user engagement.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Feature Under Development
          </CardTitle>
           <CardDescription>This analytics dashboard is currently being built.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Soon, you will be able to see detailed analytics about your website's traffic, user engagement, and project statistics here. This will help you make data-driven decisions.</p>
        </CardContent>
      </Card>
    </div>
  )
}
