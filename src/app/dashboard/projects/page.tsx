'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

const projects = [
  {
    id: 'PROJ-001',
    name: 'E-commerce Platform Redesign',
    status: 'In Progress',
    deadline: '2025-08-30',
  },
  {
    id: 'PROJ-002',
    name: 'Mobile App for Booking',
    status: 'Completed',
    deadline: '2025-06-15',
  },
  {
    id: 'PROJ-003',
    name: 'Corporate Website Development',
    status: 'Pending',
    deadline: '2025-09-10',
  },
];

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
                <TableHead>Actions</TableHead>
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
                  <TableCell>
                    <Button variant="ghost" size="icon">
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
    </div>
  );
}
