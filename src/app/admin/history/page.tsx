
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getLogs, EmailLog, SmsLog } from '@/services/data';
import { FormattedTimestamp } from '@/components/formatted-timestamp';
import { Mail, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminHistoryPage() {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);

  useEffect(() => {
    const { email, sms } = getLogs();
    setEmailLogs(email);
    setSmsLogs(sms);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Communication History</h1>
        <p className="text-muted-foreground">View logs for all sent emails and SMS messages.</p>
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {emailLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">No email logs found.</TableCell>
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {smsLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">No SMS logs found.</TableCell>
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
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
