
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Archive } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold">Storage Settings</h1>
        <p className="text-muted-foreground">Configure storage options for file uploads.</p>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Feature Under Development
              </CardTitle>
              <CardDescription>This section is for configuring file storage, but it is not yet functional.</CardDescription>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground">
                In a future update, this page will allow you to configure where files, such as images uploaded through the content manager, are stored. 
                You will be able to choose between local server storage and cloud-based services like AWS S3.
                <br/><br/>
                Currently, all images are managed by pasting external URLs in the Content editor. No file upload functionality is implemented.
              </p>
          </CardContent>
      </Card>
    </div>
  )
}
