'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">Configure global settings for the site.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
           <CardDescription>This feature is currently under development.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>The admin settings panel will be available here shortly.</p>
        </CardContent>
      </Card>
    </div>
  )
}
