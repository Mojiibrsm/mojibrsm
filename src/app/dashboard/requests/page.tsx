'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, PlusCircle } from 'lucide-react';

const requests = [
  {
    id: 'REQ-001',
    service: 'Web Development (Basic)',
    status: 'Approved',
    date: '2025-07-20',
  },
  {
    id: 'REQ-002',
    service: 'SEO & Digital Marketing',
    status: 'Pending',
    date: '2025-07-22',
  },
  {
    id: 'REQ-003',
    service: 'Android App Development',
    status: 'Rejected',
    date: '2025-07-18',
  },
];

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Approved':
            return 'default';
        case 'Pending':
            return 'secondary';
        case 'Rejected':
            return 'destructive';
        default:
            return 'outline';
    }
}

export default function RequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Requests</h1>
        <p className="text-muted-foreground">Track the status of your service requests.</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Service Requests</CardTitle>
              <CardDescription>A list of all your service requests.</CardDescription>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Request
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.service}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(request.status) as any}>{request.status}</Badge>
                  </TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
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
