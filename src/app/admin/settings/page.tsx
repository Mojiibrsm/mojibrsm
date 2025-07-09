
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { HardDrive, Bell, Loader2, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAwsSettingsForForm, updateAwsSettings } from './actions';
import type { AwsSettings } from '@/config/settings';

const initialSettings: AwsSettings = {
    accessKeyId: '',
    secretAccessKey: '',
    bucketName: '',
    region: '',
};

type NotificationSettings = {
    messages: boolean;
    requests: boolean;
};

export default function AdminSettingsPage() {
    const [awsSettings, setAwsSettings] = useState<AwsSettings>(initialSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const [notifications, setNotifications] = useState<NotificationSettings>({
        messages: true,
        requests: false,
    });

    useEffect(() => {
        const loadSettings = async () => {
            setIsLoading(true);
            const settings = await getAwsSettingsForForm();
            setAwsSettings(settings);
            setIsLoading(false);
        };
        loadSettings();

        const savedNotificationSettings = localStorage.getItem('notificationSettings');
        if (savedNotificationSettings) {
            setNotifications(JSON.parse(savedNotificationSettings));
        }
    }, []);

    const handleAwsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAwsSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAws = async () => {
        setIsSaving(true);
        const result = await updateAwsSettings(awsSettings);
        if (result.success) {
            toast({ title: 'Success!', description: result.message });
        } else {
            toast({ title: 'Error!', description: result.message, variant: 'destructive' });
        }
        setIsSaving(false);
    };

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
                    <CardDescription>
                        Configure your AWS S3 bucket for project image uploads. Other uploads will use local server storage.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="accessKeyId">AWS Access Key ID</Label>
                                <Input id="accessKeyId" name="accessKeyId" value={awsSettings.accessKeyId} onChange={handleAwsChange} placeholder="AKIA..." />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="secretAccessKey">AWS Secret Access Key</Label>
                                <Input id="secretAccessKey" name="secretAccessKey" type="password" value={awsSettings.secretAccessKey} onChange={handleAwsChange} placeholder="••••••••••••••••" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="bucketName">S3 Bucket Name</Label>
                                <Input id="bucketName" name="bucketName" value={awsSettings.bucketName} onChange={handleAwsChange} placeholder="your-s3-bucket-name" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="region">AWS Region</Label>
                                <Input id="region" name="region" value={awsSettings.region} onChange={handleAwsChange} placeholder="e.g., us-east-1" />
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button onClick={handleSaveAws} disabled={isSaving || isLoading}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save AWS Credentials
                    </Button>
                </CardFooter>
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
    );
}
