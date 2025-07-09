
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { addProject, getProjects, updateProject, deleteProject, Project, ProjectStatus, addEmailLog, addSmsLog } from '@/services/data';
import { FormattedTimestamp } from '@/components/formatted-timestamp';
import { sendEmail } from '@/services/email';
import { translations } from '@/lib/translations';
import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';
import { sendSms } from '@/services/sms';


const getStatusVariant = (status: string) => {
    switch (status) {
        case 'In Progress': return 'secondary';
        case 'Completed': return 'default';
        case 'Pending': return 'outline';
        default: return 'secondary';
    }
}

type ProjectFormData = Omit<Project, 'id' | 'userId' | 'createdAt'>;

const generateProjectEmailHtml = (projectData: ProjectFormData, isNew: boolean, lang: 'en' | 'bn'): string => {
    const t = translations[lang];
    const { name, client, clientEmail, clientPhone, deadline, notes, notesImage } = projectData;
    
    const { name: devName } = t.hero;
    const { phone: devPhone, email: devEmail } = t.contact.details;
    
    const absoluteImageUrl = notesImage || '';

    const title = isNew ? (lang === 'bn' ? "আপনার জন্য একটি নতুন প্রজেক্ট তৈরি করা হয়েছে" : "A New Project Has Been Created For You") : (lang === 'bn' ? "আপনার প্রজেক্টের আপডেট" : "Update on Your Project");
    const formattedDeadline = new Date(deadline).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    const whatsappNumber = devPhone.replace(/[^0-9]/g, '');

    return `
        <div style="background-color: #f4f4f7; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(to right, #6366f1, #a855f7); color: #ffffff; padding: 24px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">${title}</h1>
                </div>
                <div style="padding: 24px; line-height: 1.6;">
                    <p style="font-size: 16px;">${lang === 'bn' ? `নমস্কার ${client},` : `Hello ${client},`}</p>
                    <p style="font-size: 16px;">${isNew ? (lang === 'bn' ? 'আপনার জন্য একটি নতুন প্রজেক্ট তৈরি করা হয়েছে। নিচে বিস্তারিত দেওয়া হলো:' : 'A new project has been created for you. Below are the details:') : (lang === 'bn' ? 'আপনার প্রজেক্ট আপডেট করা হয়েছে। সর্বশেষ তথ্য নিচে দেওয়া হলো:' : 'Your project has been updated. Here are the latest details:')}</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 15px;">
                        <tr style="background-color: #f9f9f9;"><td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600;">${lang === 'bn' ? 'প্রজেক্টের নাম' : 'Project Name'}:</td><td style="padding: 12px; border: 1px solid #e5e7eb;">${name}</td></tr>
                        <tr><td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600;">${lang === 'bn' ? 'ডেডলাইন' : 'Deadline'}:</td><td style="padding: 12px; border: 1px solid #e5e7eb;">${formattedDeadline}</td></tr>
                        <tr style="background-color: #f9f9f9;"><td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600;">${lang === 'bn' ? 'ক্লায়েন্টের নাম' : 'Client Name'}:</td><td style="padding: 12px; border: 1px solid #e5e7eb;">${client}</td></tr>
                        <tr><td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600;">${lang === 'bn' ? 'ক্লায়েন্ট ইমেইল' : 'Client Email'}:</td><td style="padding: 12px; border: 1px solid #e5e7eb;">${clientEmail}</td></tr>
                        ${clientPhone ? `<tr style="background-color: #f9f9f9;"><td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600;">${lang === 'bn' ? 'ক্লায়েন্ট ফোন' : 'Client Phone'}:</td><td style="padding: 12px; border: 1px solid #e5e7eb;">${clientPhone}</td></tr>` : ''}
                        ${notes ? `<tr><td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; vertical-align: top;">${lang === 'bn' ? 'নোট' : 'Notes'}:</td><td style="padding: 12px; border: 1px solid #e5e7eb; white-space: pre-wrap;">${notes.replace(/\n/g, '<br>')}</td></tr>` : ''}
                        ${absoluteImageUrl ? `<tr style="background-color: #f9f9f9;"><td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; vertical-align: top;">${lang === 'bn' ? 'সংযুক্ত ছবি' : 'Attached Image'}:</td><td style="padding: 12px; border: 1px solid #e5e7eb;"><img src="${absoluteImageUrl}" alt="Project Notes Image" style="max-width: 100%; border-radius: 8px;"/></td></tr>` : ''}
                    </table>
                    
                    <p style="font-size: 16px;">${lang === 'bn' ? 'আপনার যদি কোনো প্রশ্ন থাকে বা প্রকল্পটি নিয়ে আরও আলোচনার প্রয়োজন হয়, তাহলে নির্দ্বিধায় হোয়াটসঅ্যাপ, ফেসবুক বা এই ইমেইলের উত্তরে আমার সাথে যোগাযোগ করুন।' : 'If you have any questions or need to discuss the project further, feel free to contact me via WhatsApp, Facebook, or by replying to this email.'}</p>
                </div>
                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">${devName}</h3>
                    <p style="margin: 0 0 15px 0; color: #555555; font-size: 14px;">${lang === 'bn' ? 'ইমেইল' : 'Email'}: ${devEmail} | ${lang === 'bn' ? 'ফোন' : 'Phone'}: ${devPhone}</p>
                    <div style="margin-top: 15px;">
                        <a href="https://wa.me/${whatsappNumber}" style="display: inline-block; background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px; font-size: 14px; font-weight: bold;">WhatsApp</a>
                        <a href="https://facebook.com/MoJiiB.RsM" style="display: inline-block; background-color: #1877F2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px; font-size: 14px; font-weight: bold;">Facebook</a>
                    </div>
                </div>
            </div>
        </div>
    `;
};


export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();

  const loadProjects = () => {
      const fetchedProjects = getProjects();
      setProjects(fetchedProjects);
  };

  useEffect(() => {
    if (!user) return;
    loadProjects();
  }, [user]);

  const handleAddNew = () => {
    setEditingProject(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleDelete = (projectId: string) => {
    try {
      deleteProject(projectId);
      toast({ title: "Project Deleted", description: `Project has been successfully deleted.` });
      loadProjects();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete project.", variant: "destructive" });
    }
  };
  
  const handleSave = async (formData: ProjectFormData) => {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
        return;
    }
    setIsSaving(true);

    try {
        const isNew = !editingProject;
        if (isNew) {
            const newProject: Omit<Project, 'id' | 'createdAt'> = { ...formData, userId: user.uid };
            addProject(newProject);
            toast({ title: "Project Added", description: "A new project has been successfully added." });
        } else {
            updateProject(editingProject!.id!, formData);
            toast({ title: "Project Updated", description: "The project has been successfully updated." });
        }
        
        setIsDialogOpen(false);
        setEditingProject(null);
        loadProjects();

        // Send Email
        if (formData.clientEmail) {
            const t = translations[language];
            const emailSubject = isNew
                ? `${t.portfolio.title}: ${formData.name}`
                : `${language === 'bn' ? 'আপনার প্রজেক্টের আপডেট' : 'Update on your project'}: ${formData.name}`;
            
            const emailHtml = generateProjectEmailHtml(formData, isNew, language);
            
            sendEmail({ to: formData.clientEmail, subject: emailSubject, html: emailHtml })
            .then(emailResult => {
                 addEmailLog({
                    to: formData.clientEmail,
                    subject: emailSubject,
                    html: emailHtml,
                    success: emailResult.success,
                    message: emailResult.message,
                });
                toast({
                    title: language === 'bn' ? "ইমেইল নোটিফিকেশন" : "Email Notification Status",
                    description: emailResult.message,
                    variant: emailResult.success ? 'default' : 'destructive'
                });
            });
        }
        
        // Send SMS
        if (formData.clientPhone) {
            const t = translations[language];
            const smsMessage = `${t.hero.greeting} ${formData.client}, ${isNew ? (language === 'bn' ? 'আপনার নতুন প্রজেক্ট তৈরি হয়েছে' : 'your new project has been created') : (language === 'bn' ? 'আপনার প্রজেক্ট আপডেট হয়েছে' : 'your project has been updated')}: "${formData.name}". ${t.hero.name}`;
            
            sendSms(formData.clientPhone, smsMessage)
            .then(smsResult => {
                addSmsLog({
                    to: formData.clientPhone,
                    message: smsMessage,
                    success: smsResult.success,
                    response: smsResult.message,
                });
                toast({
                    title: language === 'bn' ? "এসএমএস নোটিফিকেশন" : "SMS Notification Status",
                    description: smsResult.message,
                    variant: smsResult.success ? 'default' : 'destructive'
                });
            });
        }

    } catch (error: any) {
        console.error("Save Error:", error);
        toast({ title: "Save Error", description: error.message || "Could not save the project.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Projects</h1>
          <p className="text-muted-foreground">Add, edit, and remove projects.</p>
        </div>
        <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Project
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>A list of all projects on your portfolio.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No projects found. Add one to get started.
                    </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>
                      {project.client} <br/> 
                      <span className="text-xs text-muted-foreground">{project.clientEmail}</span>
                      {project.clientPhone && <><br/><span className="text-xs text-muted-foreground">{project.clientPhone}</span></>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(project.status) as any}>{project.status}</Badge>
                    </TableCell>
                    <TableCell>{project.deadline}</TableCell>
                     <TableCell><FormattedTimestamp timestamp={project.createdAt} format="toLocaleDateString" /></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(project)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the project from local storage.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(project.id!)} className="bg-destructive hover:bg-destructive/90">
                                  Yes, delete project
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProjectFormDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        project={editingProject} 
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}

// Sub-component for the Project Form Dialog
function ProjectFormDialog({ isOpen, onOpenChange, project, onSave, isSaving }: { isOpen: boolean; onOpenChange: (open: boolean) => void; project: Project | null; onSave: (data: ProjectFormData) => Promise<void>; isSaving: boolean; }) {
  const [formData, setFormData] = useState<ProjectFormData>({ name: '', client: '', clientEmail: '', clientPhone: '', status: 'Pending' as ProjectStatus, deadline: '', notes: '', notesImage: '' });
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  React.useEffect(() => {
    if (isOpen) {
        if (project) {
          setFormData({
              name: project.name,
              client: project.client,
              clientEmail: project.clientEmail,
              clientPhone: project.clientPhone || '',
              status: project.status,
              deadline: project.deadline,
              notes: project.notes || '',
              notesImage: project.notesImage || '',
          });
        } else {
          setFormData({ name: '', client: '', clientEmail: '', clientPhone: '', status: 'Pending', deadline: '', notes: '', notesImage: '' });
        }
    }
  }, [project, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as ProjectStatus }));
  }

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    // Specify that this upload should go to S3
    uploadFormData.append('destination', 's3');
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
        });
        const result = await response.json();
        if (response.ok && result.success) {
            setFormData(prev => ({ ...prev, notesImage: result.url }));
            toast({ title: "Image Uploaded", description: "Image is ready to be saved with the project." });
        } else {
            throw new Error(result.message || 'Upload failed');
        }
    } catch (error: any) {
        toast({ title: "Upload Error", description: error.message, variant: "destructive" });
        console.error("Upload error:", error);
    } finally {
        setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          <DialogDescription>
            {project ? 'Update the details of the existing project.' : 'Fill in the details for the new project.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Project Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">Client Name</Label>
              <Input id="client" name="client" value={formData.client} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientEmail" className="text-right">Client Email</Label>
              <Input id="clientEmail" name="clientEmail" type="email" value={formData.clientEmail} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientPhone" className="text-right">Client Phone</Label>
              <Input id="clientPhone" name="clientPhone" type="tel" value={formData.clientPhone} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select onValueChange={handleStatusChange} value={formData.status}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deadline" className="text-right">Deadline</Label>
              <Input id="deadline" name="deadline" type="date" value={formData.deadline} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right pt-2">Notes</Label>
                <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} className="col-span-3" placeholder="Add any notes about the project..."/>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notesImage" className="text-right pt-2">Notes Image</Label>
              <div className="col-span-3 space-y-2">
                <Input 
                  id="notesImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                  disabled={isUploading}
                />
                {isUploading && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
                {formData.notesImage && !isUploading && (
                  <div className="relative w-32 h-32 border rounded-md overflow-hidden mt-2">
                    <Image src={formData.notesImage} alt="Notes preview" layout="fill" objectFit="cover" unoptimized />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSaving}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
