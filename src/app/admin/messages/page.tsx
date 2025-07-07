'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function AdminMessagesPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold">Manage Messages</h1>
        <p className="text-muted-foreground">View all conversations with clients.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
           <CardDescription>This feature is currently under development.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>The message management system will be available here shortly.</p>
        </CardContent>
      </Card>
    </div>
  )
}
