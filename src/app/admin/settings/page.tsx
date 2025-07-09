
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
                    <CardDescription>File uploads are now configured to use Amazon S3 for scalable and reliable storage.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup defaultValue="aws-s3" className="space-y-4">
                        <Label htmlFor="aws-s3" className="flex items-start gap-4 rounded-lg border p-4 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                            <RadioGroupItem value="aws-s3" id="aws-s3" />
                            <div className="grid gap-1.5">
                                <div className="font-semibold flex items-center gap-2">
                                    Amazon S3 (Active)
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Files are stored in a scalable AWS S3 bucket. This is a robust solution for production applications.
                                </p>
                            </div>
                        </Label>
                        <Label htmlFor="local-storage" className="flex items-start gap-4 rounded-lg border p-4 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary opacity-50">
                            <RadioGroupItem value="local" id="local-storage" disabled />
                            <div className="grid gap-1.5">
                                <div className="font-semibold flex items-center gap-2">
                                    Local Storage (Disabled)
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Local storage is disabled in favor of the more robust AWS S3 solution.
                                </p>
                            </div>
                        </Label>
                    </RadioGroup>
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-500/30">
                        <h4 className="font-semibold mb-2">Configuration Required</h4>
                        <p className="text-sm mb-4">To enable S3 uploads, you must create a <strong>.env.local</strong> file in your project's root folder and add the following variables:</p>
                        <pre className="text-xs bg-black/10 dark:bg-white/10 p-3 rounded-md overflow-x-auto">
                            <code>
                                AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID<br/>
                                AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY<br/>
                                AWS_S3_BUCKET_NAME=your-s3-bucket-name<br/>
                                AWS_S3_REGION=your-s3-bucket-region
                            </code>
                        </pre>
                        <p className="text-sm mt-4">You also need to update <strong>next.config.ts</strong> to allow images from your S3 bucket. A generic pattern has been added, but you may need to adjust it based on your bucket's specific URL.</p>
                    </div>
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
