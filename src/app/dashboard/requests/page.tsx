
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { addRequest, getRequestsByUserId, IRequest, RequestStatus } from '@/services/data';
import { FormattedTimestamp } from '@/components/formatted-timestamp';

const getStatusVariant = (status: RequestStatus) => {
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
  const [requests, setRequests] = useState<IRequest[]>([]);
  const [isNewRequestDialogOpen, setIsNewRequestDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<IRequest | null>(null);
  const { user } = useAuth();

  const loadRequests = () => {
    if(user) {
        const fetchedRequests = getRequestsByUserId(user.uid);
        setRequests(fetchedRequests);
    }
  }

  useEffect(() => {
    loadRequests();
  }, [user]);

  const handleViewRequest = (request: IRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleRequestAdded = () => {
    loadRequests();
  }

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
            <Button onClick={() => setIsNewRequestDialogOpen(true)}>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        You haven't made any requests yet.
                    </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                    <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.service}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(request.status)}>{request.status}</Badge>
                    </TableCell>
                    <TableCell><FormattedTimestamp timestamp={request.createdAt} format="toLocaleDateString" /></TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleViewRequest(request)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Details</span>
                        </Button>
                    </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NewRequestDialog open={isNewRequestDialogOpen} onOpenChange={setIsNewRequestDialogOpen} onSubmitted={handleRequestAdded} />
      
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRequest?.service}</DialogTitle>
            <DialogDescription>
              Status: <Badge variant={getStatusVariant(selectedRequest?.status || 'Pending')}>{selectedRequest?.status}</Badge> | Submitted: <FormattedTimestamp timestamp={selectedRequest?.createdAt} />
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-2">Details:</p>
            {selectedRequest?.details}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-component for New Request Dialog
function NewRequestDialog({ open, onOpenChange, onSubmitted }: { open: boolean, onOpenChange: (open: boolean) => void, onSubmitted: () => void }) {
    const [service, setService] = useState('');
    const [details, setDetails] = useState('');
    const { user } = useAuth();
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to make a request.' });
            return;
        }
        if (!service || !details) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a service and provide details.' });
            return;
        }

        const newRequest: Omit<IRequest, 'id' | 'createdAt'> = {
            userId: user.uid,
            clientName: user.displayName || user.phoneNumber || 'N/A',
            clientEmail: user.email || 'N/A',
            service,
            details,
            status: 'Pending',
        };

        try {
            addRequest(newRequest);
            toast({ title: 'Success', description: 'Your request has been submitted.' });
            setService('');
            setDetails('');
            onOpenChange(false);
            onSubmitted();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit request.' });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Make a New Service Request</DialogTitle>
                    <DialogDescription>
                        Fill out the form below and we'll get back to you as soon as possible.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="service" className="text-right">Service</Label>
                        <Select onValueChange={setService} value={service}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Web Development">Web Development</SelectItem>
                                <SelectItem value="App Development">App Development</SelectItem>
                                <SelectItem value="SEO & Marketing">SEO & Marketing</SelectItem>
                                <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="details" className="text-right">Details</Label>
                        <Textarea id="details" placeholder="Please describe your request..." className="col-span-3" value={details} onChange={(e) => setDetails(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
                    <Button onClick={handleSubmit}>Submit Request</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
