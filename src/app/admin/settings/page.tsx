
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { HardDrive, Bell } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

type NotificationSettings = {
    messages: boolean;
    requests: boolean;
};

export default function AdminSettingsPage() {
    const [notifications, setNotifications] = useState<NotificationSettings>({
        messages: true,
        requests: false,
    });
    const { toast } = useToast();

    useEffect(() => {
        const savedSettings = localStorage.getItem('notificationSettings');
        if (savedSettings) {
            setNotifications(JSON.parse(savedSettings));
        }
    }, []);

    const handleNotificationChange = (key: keyof NotificationSettings) => {
        const newSettings = { ...notifications, [key]: !notifications[key] };
        setNotifications(newSettings);
        localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
        toast({ title: 'Settings Saved', description: 'Your notification preferences have been updated.' });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your site's configuration and preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5" />
                        File Storage Configuration
                    </CardTitle>
                    <CardDescription>Choose where to store uploaded files like images from the Content editor. Currently, only local storage is active.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup defaultValue="local" className="space-y-4">
                        <Label htmlFor="local-storage" className="flex items-start gap-4 rounded-lg border p-4 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                            <RadioGroupItem value="local" id="local-storage" className="mt-1" />
                            <div className="grid gap-1.5">
                                <div className="font-semibold flex items-center gap-2">
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
                                    Amazon S3 (Coming Soon)
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Store files in a scalable AWS S3 bucket. This is a robust solution for production applications. This feature is under development.
                                </p>
                            </div>
                        </Label>
                    </RadioGroup>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Bell className="h-5 w-5" />
                       Notification Settings
                    </CardTitle>
                    <CardDescription>Configure email notifications for important site events. These settings will apply to future automated notification features.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                            <Label htmlFor="message-notifications" className="font-semibold">New Messages</Label>
                            <p className="text-sm text-muted-foreground">Receive an email when a new message is received from a client.</p>
                        </div>
                        <Switch
                            id="message-notifications"
                            checked={notifications.messages}
                            onCheckedChange={() => handleNotificationChange('messages')}
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                            <Label htmlFor="request-notifications" className="font-semibold">New Service Requests</Label>
                            <p className="text-sm text-muted-foreground">Receive an email when a new service request is submitted.</p>
                        </div>
                        <Switch
                            id="request-notifications"
                            checked={notifications.requests}
                            onCheckedChange={() => handleNotificationChange('requests')}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
