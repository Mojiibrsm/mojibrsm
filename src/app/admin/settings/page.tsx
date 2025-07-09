
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Server, HardDrive } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
                <HardDrive className="h-5 w-5" />
                File Storage Configuration
              </CardTitle>
              <CardDescription>Choose where to store uploaded files like images from the Content editor.</CardDescription>
          </CardHeader>
          <CardContent>
             <RadioGroup defaultValue="local" className="space-y-4">
                <Label htmlFor="local-storage" className="flex items-start gap-4 rounded-lg border p-4 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                    <RadioGroupItem value="local" id="local-storage" className="mt-1" />
                    <div className="grid gap-1.5">
                       <div className="font-semibold flex items-center gap-2">
                           <HardDrive className="h-4 w-4" />
                           Local Storage (Active)
                       </div>
                       <p className="text-sm text-muted-foreground">
                           Files are stored directly on the server in the `public/uploads` folder. This is simple, free, and ideal for development or small sites.
                       </p>
                    </div>
                </Label>
                 <Label htmlFor="aws-s3" className="flex items-start gap-4 rounded-lg border p-4 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary opacity-50">
                    <RadioGroupItem value="aws-s3" id="aws-s3" disabled />
                    <div className="grid gap-1.5">
                       <div className="font-semibold flex items-center gap-2">
                           <Server className="h-4 w-4" />
                           Amazon S3 (Coming Soon)
                       </div>
                       <p className="text-sm text-muted-foreground">
                           Store files in a scalable AWS S3 bucket. This is a robust solution for production applications with high traffic. This feature is under development.
                       </p>
                    </div>
                </Label>
             </RadioGroup>
          </CardContent>
      </Card>
    </div>
  )
}
