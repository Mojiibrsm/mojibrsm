
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { HardDrive, Bell, Loader2, Save, Info, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAwsSettingsAction, updateAwsSettingsAction } from './actions';
import { getSiteSettingsAction, updateSiteSettingsAction } from './actions';
import type { AwsSettings } from '@/config/settings';
import type { SiteSettings } from './actions';
import Image from 'next/image';


const initialAwsSettings: AwsSettings = { accessKeyId: '', secretAccessKey: '', bucketName: '', region: '' };
const initialSiteSettings: SiteSettings = { title: '', url: '', logo: '', publicLogo: '', adminAvatar: '' };

type NotificationSettings = { messages: boolean; requests: boolean };

export default function AdminSettingsPage() {
    const [awsSettings, setAwsSettings] = useState<AwsSettings>(initialAwsSettings);
    const [isAwsLoading, setIsAwsLoading] = useState(true);
    const [isAwsSaving, setIsAwsSaving] = useState(false);

    const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSiteSettings);
    const [isSiteLoading, setIsSiteLoading] = useState(true);
    const [isSiteSaving, setIsSiteSaving] = useState(false);
    const [uploadingStates, setUploadingStates] = useState<{ [key in keyof SiteSettings]?: boolean }>({});

    const [notifications, setNotifications] = useState<NotificationSettings>({ messages: true, requests: false });

    const { toast } = useToast();

    useEffect(() => {
        const loadAllSettings = async () => {
            setIsAwsLoading(true);
            setIsSiteLoading(true);

            const awsData = await getAwsSettingsAction();
            setAwsSettings(awsData);
            setIsAwsLoading(false);

            const siteData = await getSiteSettingsAction();
            setSiteSettings(siteData);
            setIsSiteLoading(false);
        };
        loadAllSettings();

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
        setIsAwsSaving(true);
        const result = await updateAwsSettingsAction(awsSettings);
        toast({ title: result.success ? 'Success!' : 'Error!', description: result.message, variant: result.success ? 'default' : 'destructive' });
        setIsAwsSaving(false);
    };

    const handleSiteSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSiteSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (file: File, fieldName: keyof SiteSettings) => {
        setUploadingStates(prev => ({ ...prev, [fieldName]: true }));
        const formData = new FormData();
        formData.append('file', file);
        formData.append('destination', 's3');

        try {
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            const result = await response.json();
            if (response.ok && result.success) {
                setSiteSettings(prev => ({ ...prev, [fieldName]: result.url }));
                toast({ title: 'Success', description: 'File uploaded successfully.' });
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (error: any) {
            toast({ title: 'Upload Error', description: error.message, variant: 'destructive' });
        } finally {
            setUploadingStates(prev => ({ ...prev, [fieldName]: false }));
        }
    };
    
    const handleSaveSiteSettings = async () => {
        setIsSiteSaving(true);
        const result = await updateSiteSettingsAction(siteSettings);
        toast({ title: result.success ? 'Success!' : 'Error!', description: result.message, variant: result.success ? 'default' : 'destructive' });
        setIsSiteSaving(false);
    };

    const handleNotificationChange = (key: keyof NotificationSettings) => {
        const newSettings = { ...notifications, [key]: !notifications[key] };
        setNotifications(newSettings);
        localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
        toast({ title: 'Settings Saved', description: 'Your notification preferences have been updated.' });
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your site's configuration and preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Site Information
                    </CardTitle>
                    <CardDescription>
                        Manage general site information. These details will be used across the site for SEO and branding.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSiteLoading ? (
                        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Site Title</Label>
                                <Input id="title" name="title" value={siteSettings.title} onChange={handleSiteSettingsChange} placeholder="Your Website Name" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="url">Site URL</Label>
                                <Input id="url" name="url" value={siteSettings.url} onChange={handleSiteSettingsChange} placeholder="https://example.com" />
                            </div>
                            
                             <div className="space-y-2">
                                <Label htmlFor="publicLogo">Public Site Logo (Landscape)</Label>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-32 h-16 shrink-0 border rounded-md p-1 bg-muted/30">
                                        {uploadingStates.publicLogo ? <Loader2 className="h-full w-full animate-spin text-muted-foreground" /> : <Image src={siteSettings.publicLogo || 'https://placehold.co/200x100.png'} alt="Public Site Logo" width={128} height={64} className="w-full h-full object-contain" unoptimized />}
                                    </div>
                                    <Input id="publicLogo" type="file" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'publicLogo')} disabled={uploadingStates.publicLogo} />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="logo">Admin Panel Logo (Square)</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 shrink-0 border rounded-md p-1">
                                            {uploadingStates.logo ? <Loader2 className="h-full w-full animate-spin text-muted-foreground" /> : <Image src={siteSettings.logo || 'https://placehold.co/100x100.png'} alt="Admin Panel Logo" width={64} height={64} className="w-full h-full object-contain" unoptimized />}
                                        </div>
                                        <Input id="logo" type="file" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')} disabled={uploadingStates.logo} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="adminAvatar">Admin Avatar (Square)</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 shrink-0 border rounded-full p-1">
                                            {uploadingStates.adminAvatar ? <Loader2 className="h-full w-full animate-spin text-muted-foreground" /> : <Image src={siteSettings.adminAvatar || 'https://placehold.co/100x100.png'} alt="Admin Avatar" width={64} height={64} className="w-full h-full object-cover rounded-full" unoptimized />}
                                        </div>
                                        <Input id="adminAvatar" type="file" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'adminAvatar')} disabled={uploadingStates.adminAvatar} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button onClick={handleSaveSiteSettings} disabled={isSiteSaving || isSiteLoading}>
                        {isSiteSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Site Information
                    </Button>
                </CardFooter>
            </Card>

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
                    {isAwsLoading ? (
                        <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
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
                    <Button onClick={handleSaveAws} disabled={isAwsSaving || isAwsLoading}>
                        {isAwsSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
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
                        <Switch id="message-notifications" checked={notifications.messages} onCheckedChange={() => handleNotificationChange('messages')} />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                            <Label htmlFor="request-notifications" className="font-semibold">New Service Requests</Label>
                            <p className="text-sm text-muted-foreground">Receive an email when a new service request is submitted.</p>
                        </div>
                        <Switch id="request-notifications" checked={notifications.requests} onCheckedChange={() => handleNotificationChange('requests')} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
