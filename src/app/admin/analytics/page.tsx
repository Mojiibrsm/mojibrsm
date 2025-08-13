
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LineChart, BarChart as BarChartIcon, Users } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold">Analytics Overview</h1>
        <p className="text-muted-foreground">Connect to Google Analytics and Search Console to view your data.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Ready for Integration
          </CardTitle>
           <CardDescription>This page is ready for integration with Google's services.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <p>Once connected, you will be able to see detailed analytics about your website's traffic, user engagement, search queries, and more, directly from your dashboard.</p>
            
            <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="h-5 w-5" />
                            Page Visits
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
                       <p>Google Analytics data coming soon...</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                           <BarChartIcon className="h-5 w-5" />
                           Search Performance
                        </CardTitle>
                    </CardHeader>
                     <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <p>Search Console data coming soon...</p>
                    </CardContent>
                </Card>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
