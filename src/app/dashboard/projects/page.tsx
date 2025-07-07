
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const projects = [
  {
    id: 'PROJ-001',
    name: 'E-commerce Platform Redesign',
    status: 'In Progress',
    deadline: '2025-08-30',
    description: 'A complete overhaul of the existing e-commerce website to improve user experience and performance. This includes a new design, mobile optimization, and faster checkout process.'
  },
  {
    id: 'PROJ-002',
    name: 'Mobile App for Booking',
    status: 'Completed',
    deadline: '2025-06-15',
    description: 'A native mobile application for both iOS and Android that allows users to book appointments and services on the go. Integrated with a custom backend and payment gateway.'
  },
  {
    id: 'PROJ-003',
    name: 'Corporate Website Development',
    status: 'Pending',
    deadline: '2025-09-10',
    description: 'Development of a new corporate website from scratch. The project is currently in the requirement gathering and planning phase.'
  },
];

type Project = typeof projects[0];

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'In Progress':
            return 'secondary';
        case 'Completed':
            return 'default';
        case 'Pending':
            return 'outline';
        default:
            return 'secondary';
    }
}

export default function ProjectsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Projects</h1>
        <p className="text-muted-foreground">Here is a list of your projects and their current status.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>A list of all your ongoing and completed projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(project.status) as any}>{project.status}</Badge>
                  </TableCell>
                  <TableCell>{project.deadline}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleViewProject(project)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Project</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProject?.name}</DialogTitle>
            <DialogDescription>
              Status: <Badge variant={getStatusVariant(selectedProject?.status || '') as any}>{selectedProject?.status}</Badge> | Deadline: {selectedProject?.deadline}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            {selectedProject?.description}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
