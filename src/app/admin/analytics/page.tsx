
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LineChart, Users, BarChart as BarChartIcon } from 'lucide-react';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

const visitorData = [
  { name: "Homepage", visitors: 4000 },
  { name: "About", visitors: 3000 },
  { name: "Projects", visitors: 2000 },
  { name: "Contact", visitors: 2780 },
  { name: "Blog", visitors: 1890 },
];

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
            <p>Once connected, you will be able to see detailed analytics about your website's traffic, user engagement, search queries, and more, directly from your dashboard. Below is a preview of what's to come.</p>
            
            <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="h-5 w-5" />
                            Page Visits
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsBarChart data={visitorData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip wrapperClassName="!bg-background !border-border" cursor={{fill: 'hsl(var(--muted))'}} />
                                <Legend />
                                <Bar dataKey="visitors" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
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
