
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getAllRequests, updateRequestStatus, IRequest, RequestStatus } from '@/services/firestore';
import { useAuth } from '@/contexts/auth-context';

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Approved': return 'default';
        case 'Pending': return 'secondary';
        case 'Rejected': return 'destructive';
        default: return 'outline';
    }
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<IRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<IRequest | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = getAllRequests((fetchedRequests) => {
        setRequests(fetchedRequests);
    });
    return () => unsubscribe();
  }, [user]);

  const handleStatusChange = async (id: string, newStatus: RequestStatus) => {
    try {
        await updateRequestStatus(id, newStatus);
        toast({
            title: `Request ${newStatus}`,
            description: `Request has been marked as ${newStatus.toLowerCase()}.`,
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to update request status.'
        });
    }
  };
  
  const handleViewRequest = (request: IRequest) => {
    setSelectedRequest(request);
    setIsViewOpen(true);
  }

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
              {requests.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No client requests found.
                    </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.clientName}</TableCell>
                    <TableCell>{request.service}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(request.status) as any}>{request.status}</Badge>
                    </TableCell>
                    <TableCell>{request.createdAt.toDate().toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewRequest(request)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                      </Button>
                      {request.status === 'Pending' && request.id && (
                          <>
                          <Button variant="outline" size="icon" className="text-green-600 hover:text-green-500 hover:border-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 border-green-600/50" onClick={() => handleStatusChange(request.id!, 'Approved')}>
                              <Check className="h-4 w-4" />
                              <span className="sr-only">Approve</span>
                          </Button>
                          <Button variant="outline" size="icon" className="text-red-600 hover:text-red-500 hover:border-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 border-red-600/50" onClick={() => handleStatusChange(request.id!, 'Rejected')}>
                              <X className="h-4 w-4" />
                              <span className="sr-only">Reject</span>
                          </Button>
                          </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* View Request Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>From: {selectedRequest?.clientName} ({selectedRequest?.clientEmail})</DialogDescription>
          </DialogHeader>
          <div className="py-4 grid gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-foreground">Service Requested</h4>
              <p className="text-muted-foreground">{selectedRequest?.service}</p>
            </div>
             <div>
              <h4 className="font-semibold text-foreground">Date Submitted</h4>
              <p className="text-muted-foreground">{selectedRequest?.createdAt.toDate().toLocaleString()}</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Current Status</h4>
              <Badge variant={getStatusVariant(selectedRequest?.status || '') as any}>{selectedRequest?.status}</Badge>
            </div>
             <div>
              <h4 className="font-semibold text-foreground">Details</h4>
              <p className="text-muted-foreground bg-muted/50 p-3 rounded-md">{selectedRequest?.details}</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
            {/* Logic to reply to user can be added here, perhaps opening a message dialog */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
