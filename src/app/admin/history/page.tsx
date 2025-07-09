
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getLogs, deleteEmailLog, deleteSmsLog, EmailLog, SmsLog, addEmailLog, addSmsLog } from '@/services/data';
import { sendEmail } from '@/services/email';
import { sendSms } from '@/services/sms';
import { FormattedTimestamp } from '@/components/formatted-timestamp';
import { Mail, MessageSquare, Trash2, Send, Loader2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Type guard to differentiate logs. `subject` is unique to email logs.
function isEmailLog(log: any): log is EmailLog {
  return log && typeof log.subject !== 'undefined';
}

export default function AdminHistoryPage() {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<EmailLog | SmsLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  const loadLogs = useCallback(() => {
    const { email, sms } = getLogs();
    setEmailLogs(email);
    setSmsLogs(sms);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);
  
  const handleViewLog = (log: EmailLog | SmsLog) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  const handleDeleteLog = () => {
    if (!selectedLog) return;
    
    if (isEmailLog(selectedLog)) {
        deleteEmailLog(selectedLog.id);
    } else {
        deleteSmsLog(selectedLog.id);
    }
    
    toast({ title: 'Log Deleted', description: 'The log has been removed from history.' });
    setIsDialogOpen(false);
    setSelectedLog(null);
    loadLogs();
  };
  
  const handleResend = async () => {
    if (!selectedLog) return;
    setIsResending(true);

    let result: { success: boolean; message: string };

    try {
        if (isEmailLog(selectedLog)) {
            result = await sendEmail({ to: selectedLog.to, subject: selectedLog.subject, html: selectedLog.html });
            addEmailLog({ 
                to: selectedLog.to, 
                subject: selectedLog.subject, 
                html: selectedLog.html, 
                success: result.success, 
                message: result.message 
            });
        } else {
            // It's an SMS log
            const smsLog = selectedLog as SmsLog;
            result = await sendSms(smsLog.to, smsLog.message);
            addSmsLog({ 
                to: smsLog.to, 
                message: smsLog.message, 
                success: result.success, 
                response: result.message 
            });
        }

        toast({
            title: result.success ? 'Message Resent' : 'Resend Failed',
            description: result.message,
            variant: result.success ? 'default' : 'destructive',
        });
    } catch (error: any) {
        toast({
            title: 'An Error Occurred',
            description: 'Could not complete the resend action.',
            variant: 'destructive',
        });
        console.error("Resend error:", error);
    } finally {
        setIsResending(false);
        setIsDialogOpen(false);
        setSelectedLog(null);
        loadLogs();
    }
  };
  
  const renderLogDetails = () => {
    if (!selectedLog) return null;
    
    if (isEmailLog(selectedLog)) {
        return (
            <>
                <DialogTitle>Email Details</DialogTitle>
                <DialogDescription>To: {selectedLog.to} | Sent: <FormattedTimestamp timestamp={selectedLog.timestamp} /></DialogDescription>
                <div className="py-4 grid gap-4 text-sm">
                    <div>
                        <h4 className="font-semibold text-foreground">Subject</h4>
                        <p className="text-muted-foreground">{selectedLog.subject}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground">Status</h4>
                        <p className="text-muted-foreground">{selectedLog.message}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground">Content</h4>
                        <div className="mt-2 border rounded-md p-4 bg-muted/30 h-64 overflow-y-auto text-xs">
                             <div dangerouslySetInnerHTML={{ __html: selectedLog.html }} />
                        </div>
                    </div>
                </div>
            </>
        )
    } else {
        return (
             <>
                <DialogTitle>SMS Details</DialogTitle>
                <DialogDescription>To: {selectedLog.to} | Sent: <FormattedTimestamp timestamp={selectedLog.timestamp} /></DialogDescription>
                 <div className="py-4 grid gap-4 text-sm">
                    <div>
                        <h4 className="font-semibold text-foreground">Message</h4>
                        <p className="text-muted-foreground bg-muted/50 p-3 rounded-md">{selectedLog.message}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-foreground">API Response</h4>
                        <p className="text-muted-foreground">{selectedLog.response}</p>
                    </div>
                </div>
            </>
        )
    }
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Communication History</h1>
        <p className="text-muted-foreground">View, resend, or delete logs for all sent emails and SMS messages.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email History
                </CardTitle>
                <CardDescription>A log of all emails sent from the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>To</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {emailLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">No email logs found.</TableCell>
                            </TableRow>
                        ) : (
                            emailLogs.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell className="truncate max-w-[150px]">{log.to}</TableCell>
                                    <TableCell>{log.subject}</TableCell>
                                    <TableCell>
                                        <Badge variant={log.success ? 'default' : 'destructive'}>
                                            {log.success ? 'Sent' : 'Failed'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <FormattedTimestamp timestamp={log.timestamp} format="toLocaleString" />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleViewLog(log)}>
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
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    SMS History
                </CardTitle>
                <CardDescription>A log of all SMS messages sent from the system.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>To</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {smsLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">No SMS logs found.</TableCell>
                            </TableRow>
                        ) : (
                            smsLogs.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell>{log.to}</TableCell>
                                    <TableCell className="truncate max-w-[150px]">{log.message}</TableCell>
                                    <TableCell>
                                        <Badge variant={log.success ? 'default' : 'destructive'}>
                                            {log.success ? 'Sent' : 'Failed'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <FormattedTimestamp timestamp={log.timestamp} format="toLocaleString" />
                                    </TableCell>
                                     <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleViewLog(log)}>
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
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                {renderLogDetails()}
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-end mt-4">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Log
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this log entry.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteLog} className="bg-destructive hover:bg-destructive/90">
                            Yes, delete it
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Button onClick={handleResend} disabled={isResending}>
                    {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                     Resend
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
