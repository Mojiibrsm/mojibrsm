'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Pencil, Trash2 } from 'lucide-react';

const projects = [
  { id: 'PROJ-001', name: 'E-commerce Platform Redesign', status: 'In Progress', client: 'Client A', deadline: '2025-08-30' },
  { id: 'PROJ-002', name: 'Mobile App for Booking', status: 'Completed', client: 'Client B', deadline: '2025-06-15' },
  { id: 'PROJ-003', name: 'Corporate Website Development', status: 'Pending', client: 'Client C', deadline: '2025-09-10' },
  { id: 'PROJ-004', name: 'SEO Campaign', status: 'In Progress', client: 'Client D', deadline: '2025-10-01' },
];

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'In Progress': return 'secondary';
        case 'Completed': return 'default';
        case 'Pending': return 'outline';
        default: return 'secondary';
    }
}

export default function AdminProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Projects</h1>
          <p className="text-muted-foreground">Add, edit, and remove projects.</p>
        </div>
        <Button>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(project.status) as any}>{project.status}</Badge>
                  </TableCell>
                  <TableCell>{project.deadline}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                         <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
