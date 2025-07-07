'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Eye } from 'lucide-react';

const requests = [
  { id: 'REQ-001', service: 'Web Development (Basic)', status: 'Approved', date: '2025-07-20', client: 'Client A' },
  { id: 'REQ-002', service: 'SEO & Digital Marketing', status: 'Pending', date: '2025-07-22', client: 'Client B' },
  { id: 'REQ-003', service: 'Android App Development', status: 'Rejected', date: '2025-07-18', client: 'Client C' },
  { id: 'REQ-004', service: 'UI/UX Design', status: 'Pending', date: '2025-07-23', client: 'Client D' },
];

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Approved': return 'default';
        case 'Pending': return 'secondary';
        case 'Rejected': return 'destructive';
        default: return 'outline';
    }
}

export default function AdminRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Client Requests</h1>
        <p className="text-muted-foreground">Review and manage all incoming service requests.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>A list of all service requests from clients.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.client}</TableCell>
                   <TableCell>{request.service}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(request.status) as any}>{request.status}</Badge>
                  </TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                    {request.status === 'Pending' && (
                        <>
                        <Button variant="outline" size="icon" className="text-green-600 hover:border-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 border-green-600/50">
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Approve</span>
                        </Button>
                         <Button variant="outline" size="icon" className="text-red-600 hover:border-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 border-red-600/50">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Reject</span>
                        </Button>
                        </>
                    )}
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
