
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  
  const handleSave = (storageType: string) => {
    toast({
      title: "Settings Saved",
      description: `${storageType} settings have been saved (simulation).`,
    });
  };

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold">Storage Settings</h1>
        <p className="text-muted-foreground">Configure storage options for file uploads.</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <Card>
            <CardHeader>
                <CardTitle>Storage</CardTitle>
            </CardHeader>
            <CardContent>
                <RadioGroup defaultValue="local" className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="local" id="local" />
                        <Label htmlFor="local">Local Storage</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="s3" id="s3" />
                        <Label htmlFor="s3">AWS S3 Storage</Label>
                    </div>
                </RadioGroup>
                <Button className="mt-6" onClick={() => handleSave('Storage Type')}>Save Changes</Button>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>AWS S3 Storage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="aws-access-key">AWS Access Key</Label>
                    <Input id="aws-access-key" placeholder="AKIA..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="aws-secret-key">AWS Secret Key</Label>
                    <Input id="aws-secret-key" type="password" placeholder="••••••••••••••••" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="aws-bucket-name">Bucket Name</Label>
                    <Input id="aws-bucket-name" placeholder="your-s3-bucket-name" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="aws-region-code">Region Code</Label>
                    <Input id="aws-region-code" placeholder="e.g., us-east-1" />
                </div>
                <Button className="mt-2" onClick={() => handleSave('AWS S3')}>Save Changes</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
