
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">Configure global settings for the site.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Feature Under Development
            </CardTitle>
           <CardDescription>This settings panel is currently being built.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Global site settings, such as API key management, email configurations, and other administrative options will be available here soon. This will allow for centralized control over the application's core functionalities.</p>
        </CardContent>
      </Card>
    </div>
  )
}
