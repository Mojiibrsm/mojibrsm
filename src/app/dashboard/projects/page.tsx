
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth-context';
import { getProjects, Project } from '@/services/data';
import { FormattedTimestamp } from '@/components/formatted-timestamp';

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const allProjects = getProjects();
      const userProjects = allProjects.filter(p => p.userId === user.uid);
      setProjects(userProjects);
    }
  }, [user]);

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
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    You have no projects yet.
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(project.status) as any}>{project.status}</Badge>
                    </TableCell>
                    <TableCell>{project.deadline}</TableCell>
                    <TableCell><FormattedTimestamp timestamp={project.createdAt} format="toLocaleDateString" /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewProject(project)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Project</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
          <div className="py-4 space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground mb-1">Client:</p>
              <p>{selectedProject?.client}</p>
            </div>
            {selectedProject?.notes && (
                <div>
                    <p className="font-semibold text-foreground mb-1">Notes:</p>
                    <p className="p-3 bg-muted/50 rounded-md">{selectedProject.notes}</p>
                </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
