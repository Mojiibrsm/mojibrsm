
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
import { addProject, getProjects, updateProject, deleteProject, Project, ProjectStatus, addEmailLog } from '@/services/data';
import { FormattedTimestamp } from '@/components/formatted-timestamp';
import { sendEmail } from '@/services/email';

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'In Progress': return 'secondary';
        case 'Completed': return 'default';
        case 'Pending': return 'outline';
        default: return 'secondary';
    }
}

type ProjectFormData = Omit<Project, 'id' | 'userId' | 'createdAt'>;

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
        if (editingProject) {
            updateProject(editingProject.id!, formData);
            toast({ title: "Project Updated", description: "The project has been successfully updated." });
        } else {
            const newProject: Omit<Project, 'id' | 'createdAt'> = { ...formData, userId: user.uid };
            addProject(newProject);
            toast({ title: "Project Added", description: "A new project has been successfully added." });
        }

        setIsDialogOpen(false);
        setEditingProject(null);
        loadProjects();

        // Send email in the background without awaiting it
        if (formData.clientEmail) {
            const isNew = !editingProject;
            const emailSubject = isNew
                ? `New Project Created: ${formData.name}`
                : `Update on your project: ${formData.name}`;
            const emailHtml = isNew
                ? `<h1>New Project Started</h1><p>A new project, <strong>${formData.name}</strong>, has been created for you.</p><p>The current status is: <strong>${formData.status}</strong>.</p><p>You can track its progress in your dashboard.</p>`
                : `<h1>Project Updated</h1><p>The status of your project, <strong>${formData.name}</strong>, has been updated to: <strong>${formData.status}</strong>.</p><p>You can view details in your dashboard.</p>`;
            
            sendEmail({ to: formData.clientEmail, subject: emailSubject, html: emailHtml })
                .then(emailResult => {
                    addEmailLog({
                        to: formData.clientEmail,
                        subject: emailSubject,
                        success: emailResult.success,
                        message: emailResult.message,
                    });
                    toast({
                        title: "Email Notification",
                        description: emailResult.message,
                        variant: emailResult.success ? 'default' : 'destructive'
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
  const [formData, setFormData] = useState<ProjectFormData>({ name: '', client: '', clientEmail: '', clientPhone: '', status: 'Pending' as ProjectStatus, deadline: '', notes: '' });
  
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
          });
        } else {
          setFormData({ name: '', client: '', clientEmail: '', clientPhone: '', status: 'Pending', deadline: '', notes: '' });
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
