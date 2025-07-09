
'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getMessageThreads, addMessageToThread, markThreadAsRead, IMessage, IMessageThread, addSmsLog, addEmailLog } from '@/services/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Send, PlusCircle, Mail, MessageSquareText, Loader2, File, X, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { FormattedTimestamp } from '@/components/formatted-timestamp';
import { Label } from '@/components/ui/label';
import { sendSms } from '@/services/sms';
import { sendEmail } from '@/services/email';
import { translations } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { Separator } from '@/components/ui/separator';


const generateDirectEmailHtml = (subject: string, message: string, attachment?: { name: string; url: string }): string => {
    const t = translations['en']; 
    const { name: devName } = t.hero;
    const { phone: devPhone, email: devEmail } = t.contact.details;
    const whatsappNumber = devPhone.replace(/[^0-9]/g, '');

    const messageBody = message.replace(/\n/g, '<br>');

    return `
        <div style="background-color: #f4f4f7; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(to right, #6366f1, #a855f7); color: #ffffff; padding: 24px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">${subject}</h1>
                </div>
                <div style="padding: 24px; line-height: 1.6; font-size: 16px;">
                    ${messageBody}
                    ${attachment ? `
                        <div style="margin-top: 25px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">Attachment:</p>
                            <a href="${attachment.url}" target="_blank" style="color: #6366f1; text-decoration: none; word-break: break-all;">${attachment.name}</a>
                        </div>
                    ` : ''}
                </div>
                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">${devName}</h3>
                    <p style="margin: 0 0 15px 0; color: #555555; font-size: 14px;">Email: ${devEmail} | Phone: ${devPhone}</p>
                    <div style="margin-top: 15px;">
                        <a href="https://wa.me/${whatsappNumber}" style="display: inline-block; background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px; font-size: 14px; font-weight: bold;">WhatsApp</a>
                        <a href="https://facebook.com/MoJiiB.RsM" style="display: inline-block; background-color: #1877F2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px; font-size: 14px; font-weight: bold;">Facebook</a>
                        <a href="https://www.mojib.oftern.com" style="display: inline-block; background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px; font-size: 14px; font-weight: bold;">Visit Website</a>
                    </div>
                </div>
            </div>
        </div>
    `;
};


export default function AdminMessagesPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<IMessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<IMessageThread | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState({
      recipients: '',
      phones: '',
      subject: '',
      message: ''
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadThreads = () => {
    const fetchedThreads = getMessageThreads();
    setThreads(fetchedThreads);
    if (selectedThread) {
        const updatedThread = fetchedThreads.find(t => t.id === selectedThread.id);
        if (updatedThread) setSelectedThread(updatedThread);
    }
  }

  useEffect(() => {
      if (!user) return;
      loadThreads();
  }, [user, selectedThread]);

  const handleViewThread = (thread: IMessageThread) => {
    setSelectedThread(thread);
    setIsViewOpen(true);
    if (thread.id && thread.unreadByAdmin) {
        markThreadAsRead(thread.id, 'admin');
        loadThreads();
    }
  };
  
  const handleReply = async () => {
    if (!selectedThread?.id || !replyText || !user) return;
    const newMessage: IMessage = { from: 'admin', text: replyText, timestamp: new Date().toISOString() };
    try {
        addMessageToThread(selectedThread.id, newMessage, 'admin');
        setReplyText("");
        loadThreads();
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to send reply." });
    }
  };

  const handleComposeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setComposeData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleContactFileUpload = async (file: File) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
        try {
            const content = e.target?.result;
            if (!content) {
                toast({ variant: "destructive", title: "File Error", description: "Could not read the file." });
                return;
            }

            let contacts: string[] = [];
            const fileName = file.name.toLowerCase();

            if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
                contacts = (content as string).split(/[\n,;\s]+/).filter(Boolean);
            } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                const workbook = XLSX.read(content, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                contacts = (jsonData as any[][]).flat().map(String).filter(Boolean);
            } else {
                toast({ variant: "destructive", title: "Unsupported File", description: "Please upload a CSV, TXT, or Excel file." });
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            // A more general regex for phone numbers that can include country codes
            const phoneRegex = /^\+?[0-9\s-()]{7,}$/;

            const importedEmails: string[] = [];
            const importedPhones: string[] = [];

            contacts.forEach(contact => {
                const trimmedContact = contact.trim();
                if (emailRegex.test(trimmedContact)) {
                    importedEmails.push(trimmedContact);
                } else if (phoneRegex.test(trimmedContact)) {
                    importedPhones.push(trimmedContact.replace(/[-\s()]/g, ''));
                }
            });

            if (importedEmails.length === 0 && importedPhones.length === 0) {
                 toast({ variant: "destructive", title: "No Contacts Found", description: "No valid email addresses or phone numbers were found in the file." });
                 return;
            }

            setComposeData(prev => ({
                ...prev,
                recipients: [...(prev.recipients ? prev.recipients.split(/[,;\s]+/).filter(Boolean) : []), ...importedEmails].join(', '),
                phones: [...(prev.phones ? prev.phones.split(/[,;\s]+/).filter(Boolean) : []), ...importedPhones].join(', ')
            }));
            
            toast({ title: "Contacts Imported", description: `Added ${importedEmails.length} emails and ${importedPhones.length} phone numbers.` });

        } catch (error) {
            console.error("Error parsing contact file:", error);
            toast({ variant: "destructive", title: "Parsing Error", description: "Could not parse the contact file." });
        }
    };
    
    reader.onerror = () => {
         toast({ variant: "destructive", title: "File Read Error", description: "There was an error reading the file." });
    }

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };


  const clearForm = () => {
    setComposeData({ recipients: '', phones: '', subject: '', message: '' });
    setAttachment(null);
  }

  const handleSendEmail = async () => {
    if (!composeData.recipients || !composeData.subject || !composeData.message) {
        toast({ variant: "destructive", title: "Missing Information", description: "Recipient emails, subject, and a message are required." });
        return;
    }
    setIsSendingEmail(true);
    let attachmentPayload;

    try {
        if (attachment) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', attachment);
            formData.append('destination', 's3');
            
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            const result = await response.json();
            
            if (!response.ok || !result.success) throw new Error(result.message || 'File upload failed');
            
            attachmentPayload = { filename: attachment.name, path: result.url };
            setIsUploading(false);
        }

        const recipients = composeData.recipients.split(/[,;\s]+/).map(e => e.trim()).filter(e => e);
        if (recipients.length === 0) {
            toast({ variant: "destructive", title: "No Recipients", description: "Please provide at least one valid email address." });
            setIsSendingEmail(false);
            return;
        }

        const emailHtml = generateDirectEmailHtml(composeData.subject, composeData.message, attachment ? { name: attachment.name, url: attachmentPayload!.path } : undefined);
        
        const result = await sendEmail({
            to: recipients,
            subject: composeData.subject,
            html: emailHtml,
            attachments: attachmentPayload ? [attachmentPayload] : undefined
        });

        addEmailLog({
            to: recipients.join(', '),
            subject: composeData.subject,
            html: `(Direct Message Sent) - ${composeData.message}`,
            success: result.success,
            message: result.message,
        });

        toast({
            title: result.success ? "Email Sent" : "Email Failed",
            description: result.message,
            variant: result.success ? "default" : "destructive",
            onClick: () => router.push('/admin/history'),
            className: 'cursor-pointer hover:bg-muted'
        });

        if (result.success) {
            setIsComposeOpen(false);
            clearForm();
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'An Error Occurred', description: error.message });
    } finally {
        setIsSendingEmail(false);
        setIsUploading(false);
    }
  };
  
  const handleSendSms = async () => {
      if (!composeData.phones || !composeData.message) {
           toast({ variant: "destructive", title: "Missing Info", description: "Recipient phone numbers and a message are required." });
           return;
      }
      setIsSendingSms(true);
      const phones = composeData.phones.split(/[,;\s]+/).map(p => p.trim()).filter(p => p);
       if (phones.length === 0) {
           toast({ variant: "destructive", title: "No Recipients", description: "Please provide at least one valid phone number." });
           setIsSendingSms(false);
           return;
      }

      try {
          const results = await Promise.all(
              phones.map(phone => sendSms(phone, composeData.message))
          );
          
          results.forEach((result, index) => {
              addSmsLog({
                  to: phones[index],
                  message: composeData.message,
                  success: result.success,
                  response: result.message,
              });
          });

          const successCount = results.filter(r => r.success).length;
          toast({
              title: "SMS Sending Complete",
              description: `${successCount} of ${phones.length} messages sent successfully. Check history for details.`,
              onClick: () => router.push('/admin/history'),
              className: 'cursor-pointer hover:bg-muted'
          });

          setIsComposeOpen(false);
          clearForm();

      } catch (error: any) {
          toast({ title: 'SMS Error', description: error.message, variant: 'destructive' });
      } finally {
        setIsSendingSms(false);
      }
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">Manage Messages</h1>
                <p className="text-muted-foreground">View client conversations and send direct messages.</p>
            </div>
            <Dialog open={isComposeOpen} onOpenChange={(open) => { setIsComposeOpen(open); if(!open) clearForm(); }}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Direct Message
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Send a Direct Message</DialogTitle>
                        <DialogDescription>Send an email or SMS to multiple recipients. This will be logged in your history.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                        <div className="space-y-2">
                            <Label htmlFor="contact-file">Import Contacts from File</Label>
                            <Input 
                                id="contact-file" 
                                type="file" 
                                accept=".csv,.txt,.xlsx,.xls"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        handleContactFileUpload(e.target.files[0]);
                                        e.target.value = ''; // Reset file input
                                    }
                                }}
                            />
                            <p className="text-xs text-muted-foreground">Upload a CSV, TXT, or Excel file to add recipients automatically.</p>
                        </div>
                        <Separator className="my-4" />
                        <div className="grid gap-2">
                            <Label htmlFor="recipients">Recipient Emails</Label>
                            <Textarea id="recipients" name="recipients" value={composeData.recipients} onChange={handleComposeChange} placeholder="john@example.com, jane@example.com"/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phones">Recipient Phones</Label>
                            <Textarea id="phones" name="phones" value={composeData.phones} onChange={handleComposeChange} placeholder="+8801..., 017..."/>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="subject">Subject (for Email)</Label>
                            <Input id="subject" name="subject" value={composeData.subject} onChange={handleComposeChange} placeholder="Your message subject..."/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" name="message" value={composeData.message} onChange={handleComposeChange} className="min-h-[120px]" placeholder="Type your email or SMS content here." required/>
                        </div>
                        <div className="grid gap-2">
                           <Label htmlFor="attachment">Attachment (for Email)</Label>
                           <Input id="attachment" type="file" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
                           {attachment && (
                             <div className="text-sm text-muted-foreground flex items-center justify-between p-2 bg-muted rounded-md">
                               <span>{attachment.name}</span>
                               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAttachment(null)}>
                                 <X className="h-4 w-4"/>
                               </Button>
                             </div>
                           )}
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:justify-end border-t pt-4">
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <Button variant="outline" onClick={handleSendSms} disabled={isSendingSms || isSendingEmail || !composeData.phones || !composeData.message}>
                            {(isSendingSms) ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MessageSquareText className="mr-2 h-4 w-4"/>}
                            Send as SMS
                        </Button>
                        <Button onClick={handleSendEmail} disabled={isSendingEmail || isSendingSms || isUploading || !composeData.recipients || !composeData.subject || !composeData.message}>
                            {(isUploading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : (isSendingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Mail className="mr-2 h-4 w-4"/>)}
                            {isUploading ? 'Uploading...' : 'Send as Email'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Client Conversations</CardTitle>
           <CardDescription>You have {threads.filter(t => t.unreadByAdmin).length} unread conversations.</CardDescription>
        </CardHeader>
        <CardContent>
           {threads.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                    <p>No messages yet.</p>
                    <p className="text-sm">When a client sends a message, it will appear here.</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {threads.map((thread) => (
                    <li key={thread.id} className={`p-4 rounded-lg flex items-start gap-4 cursor-pointer hover:bg-muted/50 ${thread.unreadByAdmin ? 'bg-primary/10' : ''}`} onClick={() => handleViewThread(thread)}>
                        <Avatar className="h-12 w-12">
                        <AvatarImage src={thread.clientAvatar} alt={thread.clientName} />
                        <AvatarFallback>{thread.clientName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1 flex-1">
                            <div className="flex items-center justify-between">
                                <p className={`font-semibold ${thread.unreadByAdmin ? 'text-primary' : ''}`}>{thread.clientName} - <span className="font-normal text-muted-foreground">{thread.subject}</span></p>
                                <FormattedTimestamp timestamp={thread.lastMessageTimestamp} className="text-xs text-muted-foreground" />
                            </div>
                        <p className={`text-sm text-muted-foreground line-clamp-2 ${thread.unreadByAdmin ? 'font-medium text-foreground' : ''}`}>{thread.lastMessage}</p>
                        </div>
                        {thread.unreadByAdmin && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1" />}
                    </li>
                    ))}
                </ul>
            )}
        </CardContent>
      </Card>
      
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[625px] flex flex-col h-[70vh]">
          <DialogHeader>
            <div className="flex justify-between items-center">
                <div>
                    <DialogTitle>Conversation with {selectedThread?.clientName}</DialogTitle>
                    <DialogDescription>{selectedThread?.subject}</DialogDescription>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" disabled={!selectedThread?.clientEmail}>
                        <a href={`mailto:${selectedThread?.clientEmail}`}><Mail className="mr-2 h-4 w-4"/> Email</a>
                    </Button>
                    <Button asChild variant="outline" size="sm" disabled={!selectedThread?.clientPhone}>
                        <a href={`sms:${selectedThread?.clientPhone}`}><MessageSquareText className="mr-2 h-4 w-4"/> SMS</a>
                    </Button>
                </div>
            </div>
          </DialogHeader>
          <div className="py-4 flex-1 overflow-y-auto space-y-4 pr-4">
            {selectedThread?.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((message, index) => (
                <div key={index} className={`flex items-end gap-2 ${message.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                   {message.from === 'client' && <Avatar className="h-8 w-8"><AvatarImage src={selectedThread.clientAvatar} alt={selectedThread.clientName}/><AvatarFallback>{selectedThread.clientName.charAt(0)}</AvatarFallback></Avatar>}
                   <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${message.from === 'admin' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                        <p className="text-sm">{message.text}</p>
                        <FormattedTimestamp timestamp={message.timestamp} className="text-xs text-right mt-1 opacity-70" />
                   </div>
                   {message.from === 'admin' && user && <Avatar className="h-8 w-8"><AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Admin'} /><AvatarFallback>{user.displayName?.charAt(0) || 'A'}</AvatarFallback></Avatar>}
                </div>
            ))}
          </div>
          <DialogFooter className="mt-auto pt-4 border-t">
            <div className="relative w-full flex items-center gap-2">
                 <Textarea placeholder="Type your message..." className="pr-12" rows={1} value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }} />
                 <Button size="icon" className="h-9 w-9" onClick={handleReply} disabled={!replyText}>
                    <Send className="h-4 w-4"/>
                 </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
