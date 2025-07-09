
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { HardDrive, Bell, Loader2, Save, Info, FolderSearch, Contact2, Github, Facebook, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAwsSettingsAction, updateAwsSettingsAction } from './actions';
import { getSiteSettingsAction, updateSiteSettingsAction } from './actions';
import { getContactSettingsAction, updateContactSettingsAction } from './actions';
import type { AwsSettings } from '@/config/settings';
import type { SiteSettings, ContactSettings } from './actions';
import Image from 'next/image';
import { MediaLibraryDialog } from '@/components/media-library-dialog';
import { IMediaItem } from '@/services/data';


const initialAwsSettings: AwsSettings = { accessKeyId: '', secretAccessKey: '', bucketName: '', region: '' };
const initialSiteSettings: SiteSettings = { title: '', url: '', logo: '', publicLogo: '', adminAvatar: '' };
const initialContactSettings: ContactSettings = {
    title: '',
    description: '',
    form: { name: '', email: '', phone: '', subject: '', message: '', submit: '' },
    details: { email: '', phone: '', location: '', socials: { github: '', facebook: '', linkedin: '' } },
};


type NotificationSettings = { messages: boolean; requests: boolean };

export default function AdminSettingsPage() {
    const [awsSettings, setAwsSettings] = useState<AwsSettings>(initialAwsSettings);
    const [isAwsLoading, setIsAwsLoading] = useState(true);
    const [isAwsSaving, setIsAwsSaving] = useState(false);

    const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSiteSettings);
    const [isSiteLoading, setIsSiteLoading] = useState(true);
    const [isSiteSaving, setIsSiteSaving] = useState(false);
    
    const [contactSettings, setContactSettings] = useState<ContactSettings>(initialContactSettings);
    const [isContactLoading, setIsContactLoading] = useState(true);
    const [isContactSaving, setIsContactSaving] = useState(false);
    
    const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
    const [mediaTargetField, setMediaTargetField] = useState<keyof SiteSettings | null>(null);

    const [notifications, setNotifications] = useState<NotificationSettings>({ messages: true, requests: false });

    const { toast } = useToast();

    useEffect(() => {
        const loadAllSettings = async () => {
            setIsAwsLoading(true);
            setIsSiteLoading(true);
            setIsContactLoading(true);

            const awsData = await getAwsSettingsAction();
            setAwsSettings(awsData);
            setIsAwsLoading(false);

            const siteData = await getSiteSettingsAction();
            setSiteSettings(siteData);
            setIsSiteLoading(false);

            const contactData = await getContactSettingsAction();
            setContactSettings(contactData);
            setIsContactLoading(false);
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
    
    const openMediaDialogFor = (fieldName: keyof SiteSettings) => {
        setMediaTargetField(fieldName);
        setIsMediaDialogOpen(true);
    };

    const handleSelectFromLibrary = (item: IMediaItem) => {
        if (mediaTargetField) {
            setSiteSettings(prev => ({ ...prev, [mediaTargetField]: item.url }));
            toast({ title: 'Success', description: 'File selected from library.' });
        }
    };

    const handleSaveSiteSettings = async () => {
        setIsSiteSaving(true);
        const result = await updateSiteSettingsAction(siteSettings);
        toast({ title: result.success ? 'Success!' : 'Error!', description: result.message, variant: result.success ? 'default' : 'destructive' });
        setIsSiteSaving(false);
    };
    
    const handleContactChange = (fieldPath: string, value: string) => {
        setContactSettings(prev => {
            if (!prev) return prev;
            const keys = fieldPath.split('.');
            const newSettings = JSON.parse(JSON.stringify(prev)); // Deep copy to handle nested objects
            let current = newSettings;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newSettings;
        });
    };

    const handleSaveContact = async () => {
        if (!contactSettings) return;
        setIsContactSaving(true);
        const result = await updateContactSettingsAction(contactSettings);
        toast({ title: result.success ? 'Success!' : 'Error!', description: result.message, variant: result.success ? 'default' : 'destructive' });
        setIsContactSaving(false);
    };


    const handleNotificationChange = (key: keyof NotificationSettings) => {
        const newSettings = { ...notifications, [key]: !notifications[key] };
        setNotifications(newSettings);
        localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
        toast({ title: 'Settings Saved', description: 'Your notification preferences have been updated.' });
    };

    const ImageField = ({ fieldName, label, dimensions, isSquare }: { fieldName: keyof SiteSettings, label: string, dimensions: string, isSquare?: boolean }) => (
        <div className="space-y-2">
            <Label htmlFor={fieldName}>{label} ({dimensions})</Label>
            <div className="flex items-center gap-4">
                <div className={`relative ${isSquare ? 'w-16 h-16' : 'w-32 h-16'} shrink-0 border rounded-md p-1 bg-muted/30`}>
                    <Image 
                        src={siteSettings[fieldName] || `https://placehold.co/${isSquare ? '100x100' : '200x100'}.png`} 
                        alt={label} 
                        layout="fill" 
                        className={`object-contain ${isSquare ? 'rounded-full' : ''}`}
                        unoptimized 
                    />
                </div>
                 <div className="flex-grow">
                    <Button variant="outline" className="w-full" onClick={() => openMediaDialogFor(fieldName)}>
                        <FolderSearch className="mr-2 h-4 w-4"/> Browse Library
                    </Button>
                </div>
            </div>
        </div>
    );

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
                            
                            <ImageField fieldName="publicLogo" label="Public Site Logo" dimensions="Landscape" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ImageField fieldName="logo" label="Admin Panel Logo" dimensions="Square" isSquare />
                                <ImageField fieldName="adminAvatar" label="Admin Avatar" dimensions="Square" isSquare />
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
                        <Contact2 className="h-5 w-5" />
                        Contact & Socials
                    </CardTitle>
                    <CardDescription>
                        Update the contact details and social media links displayed on your site.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isContactLoading ? (
                        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                 <div className="grid gap-2">
                                    <Label htmlFor="email"><Mail className="inline-block mr-2 h-4 w-4"/>Email</Label>
                                    <Input id="email" value={contactSettings.details.email} onChange={(e) => handleContactChange('details.email', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone"><Phone className="inline-block mr-2 h-4 w-4"/>Phone</Label>
                                    <Input id="phone" value={contactSettings.details.phone} onChange={(e) => handleContactChange('details.phone', e.target.value)} />
                                </div>
                                 <div className="grid gap-2">
                                    <Label htmlFor="location"><MapPin className="inline-block mr-2 h-4 w-4"/>Location</Label>
                                    <Input id="location" value={contactSettings.details.location} onChange={(e) => handleContactChange('details.location', e.target.value)} />
                                </div>
                            </div>
                             <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="github"><Github className="inline-block mr-2 h-4 w-4"/>GitHub URL</Label>
                                    <Input id="github" value={contactSettings.details.socials.github} onChange={(e) => handleContactChange('details.socials.github', e.target.value)} />
                                </div>
                                 <div className="grid gap-2">
                                    <Label htmlFor="facebook"><Facebook className="inline-block mr-2 h-4 w-4"/>Facebook URL</Label>
                                    <Input id="facebook" value={contactSettings.details.socials.facebook} onChange={(e) => handleContactChange('details.socials.facebook', e.target.value)} />
                                </div>
                                 <div className="grid gap-2">
                                    <Label htmlFor="linkedin"><Linkedin className="inline-block mr-2 h-4 w-4"/>LinkedIn URL</Label>
                                    <Input id="linkedin" value={contactSettings.details.socials.linkedin} onChange={(e) => handleContactChange('details.socials.linkedin', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                 <CardFooter className="border-t px-6 py-4">
                    <Button onClick={handleSaveContact} disabled={isContactSaving || isContactLoading}>
                        {isContactSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Contact Details
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

             <MediaLibraryDialog
                isOpen={isMediaDialogOpen}
                onOpenChange={setIsMediaDialogOpen}
                onSelect={handleSelectFromLibrary}
            />
        </div>
    );
}
