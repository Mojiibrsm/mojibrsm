'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Lock, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and notification settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose how you want to be notified.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
                <Label htmlFor="email-notifications" className="font-semibold">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive emails about project updates and messages.</p>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
             <div className="space-y-1">
                <Label htmlFor="push-notifications" className="font-semibold">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Get push notifications on your devices.</p>
             </div>
            <Switch id="push-notifications" />
          </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                <p>Change Password</p>
                <Button variant="outline"><Lock className="mr-2 h-4 w-4"/> Change</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
                <div>
                     <p className="text-destructive font-medium">Delete Account</p>
                     <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
                </div>
                <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4"/> Delete Account</Button>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
