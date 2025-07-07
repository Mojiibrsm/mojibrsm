
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings, KeyRound, Mail, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  
  const handleSaveApiKeys = () => {
    toast({
      title: "Settings Saved",
      description: "API keys have been updated (simulation).",
    });
  };

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">Configure global settings for the site.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            API Key Management
            </CardTitle>
           <CardDescription>Manage third-party service API keys. This is a placeholder and is not functional yet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google-maps-api">Google Maps API Key</Label>
            <Input id="google-maps-api" placeholder="Enter Google Maps API Key" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="firebase-api">Firebase Service Account Key (JSON)</Label>
            <Input id="firebase-api" placeholder="Paste your service account JSON here" />
          </div>
          <Button onClick={handleSaveApiKeys}>Save API Keys</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
            </CardTitle>
           <CardDescription>Configure settings for outgoing emails. Not yet functional.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input id="smtp-host" placeholder="smtp.example.com" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="smtp-user">SMTP Username</Label>
                <Input id="smtp-user" placeholder="user@example.com" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="smtp-pass">SMTP Password</Label>
                <Input id="smtp-pass" type="password" placeholder="••••••••" />
            </div>
            <Button>Save Email Settings</Button>
        </CardContent>
      </Card>
    </div>
  )
}
