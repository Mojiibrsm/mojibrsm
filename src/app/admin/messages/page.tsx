'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getMessageThreads, addMessageToThread, markThreadAsRead, IMessage, IMessageThread, addSmsLog, addEmailLog } from '@/services/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Send, Mail, MessageSquareText, Loader2, Phone, MessageCircle, FileText } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';


const generateReplyEmailHtml = (threadSubject: string, clientName: string, replyMessage: string): string => {
    const t = translations['en']; 
    const { name: devName } = t.hero;
    const { phone: devPhone, email: devEmail } = t.contact.details;
    const siteUrl = t.site.url;
    const whatsappNumber = devPhone.replace(/[^0-9]/g, '');

    const messageBody = replyMessage.replace(/\n/g, '<br>');

    return `
        <div style="background-color: #f4f4f7; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(to right, #6366f1, #a855f7); color: #ffffff; padding: 24px; text-align: left;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Re: ${threadSubject}</h1>
                </div>
                <div style="padding: 24px; line-height: 1.6; font-size: 16px;">
                    <p>Hello ${clientName},</p>
                    ${messageBody}
                </div>
                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">${devName}</h3>
                    <p style="margin: 0 0 15px 0; color: #555555; font-size: 14px;">Email: ${devEmail} | Phone: ${devPhone}</p>
                    <div style="margin-top: 15px;">
                        <a href="https://wa.me/${whatsappNumber}" style="display: inline-block; background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px; font-size: 14px; font-weight: bold;">WhatsApp</a>
                        <a href="https://facebook.com/MoJiiB.RsM" style="display: inline-block; background-color: #1877F2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px; font-size: 14px; font-weight: bold;">Facebook</a>
                        <a href="${siteUrl}" style="display: inline-block; background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px; font-size: 14px; font-weight: bold;">Visit Website</a>
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
  const [isSending, setIsSending] = useState(false);
  const [isSmsDialogOpen, setIsSmsDialogOpen] = useState(false);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsText, setSmsText] = useState('');

  const { toast } = useToast();
  const { user } = useAuth();
  const adminAvatar = translations.en.site.adminAvatar;
  const lastNotifiedTimestamp = useRef<string | null>(null);


  const loadThreads = useCallback(() => {
    const fetchedThreads = getMessageThreads();
    setThreads(fetchedThreads);
  }, []);

  useEffect(() => {
    if (user) {
      loadThreads();
    }
  }, [user, loadThreads]);

  useEffect(() => {
    // Live notification polling
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    const intervalId = setInterval(() => {
        const newTimestamp = localStorage.getItem('new_live_chat_message_timestamp');
        if (newTimestamp && newTimestamp !== lastNotifiedTimestamp.current) {
            lastNotifiedTimestamp.current = newTimestamp;
            loadThreads(); // Refresh data to get the new message
            
            const threads = getMessageThreads();
            const lastLiveChat = threads.find(t => t.type === 'live' && t.lastMessageTimestamp === newTimestamp);

            if (Notification.permission === "granted" && lastLiveChat) {
                const notification = new Notification(`New Live Chat from ${lastLiveChat.clientName}`, {
                    body: lastLiveChat.lastMessage,
                    icon: translations.en.site.publicLogo,
                });
                notification.onclick = () => {
                    router.push('/admin/messages');
                    window.focus();
                };
            }
        }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId);
  }, [router, loadThreads]);

  // This effect ensures the selected thread's data is fresh if the list changes
  useEffect(() => {
    if (!selectedThread) return;

    const updatedThread = threads.find(t => t.id === selectedThread.id);
    if (updatedThread) {
      if (JSON.stringify(updatedThread) !== JSON.stringify(selectedThread)) {
        setSelectedThread(updatedThread);
      }
    } else {
      setSelectedThread(null);
      setIsViewOpen(false);
    }
  }, [threads, selectedThread]);

  const handleViewThread = (thread: IMessageThread) => {
    setSelectedThread(thread);
    setIsViewOpen(true);
    if (thread.id && thread.unreadByAdmin) {
        markThreadAsRead(thread.id, 'admin');
        loadThreads();
    }
  };
  
  const handleSendReply = async () => {
    if (!selectedThread?.id || !replyText || !user) {
        toast({ variant: "destructive", title: "Error", description: "Cannot send reply. Information is missing." });
        return;
    }

    setIsSending(true);

    try {
        // Handle Live Chat reply differently
        if (selectedThread.type === 'live') {
            const newMessage: IMessage = { from: 'admin', text: replyText, timestamp: new Date().toISOString() };
            addMessageToThread(selectedThread.id, newMessage, 'admin');
            setReplyText("");
            loadThreads();
            toast({ title: "Reply Sent", description: "Your reply has been added to the live chat." });
            return;
        }

        // Handle Contact Form (email) reply
        const clientEmail = selectedThread.clientEmail;
        if (!clientEmail || clientEmail === 'N/A') {
            toast({ variant: "destructive", title: "Error", description: "This user does not have an email address to reply to." });
            return;
        }

        const emailHtml = generateReplyEmailHtml(selectedThread.subject, selectedThread.clientName, replyText);
        const emailSubject = `Re: ${selectedThread.subject}`;

        const result = await sendEmail({
            to: clientEmail,
            subject: emailSubject,
            html: emailHtml,
        });

        addEmailLog({
            to: clientEmail,
            subject: emailSubject,
            html: emailHtml,
            success: result.success,
            message: result.message
        });

        if (result.success) {
            const newMessage: IMessage = { from: 'admin', text: replyText, timestamp: new Date().toISOString() };
            addMessageToThread(selectedThread.id, newMessage, 'admin');
            setReplyText("");
            loadThreads();
            toast({ title: "Reply Sent", description: "Your email reply has been sent successfully." });
        } else {
            throw new Error(result.message);
        }

    } catch (error: any) {
        toast({ variant: "destructive", title: "Reply Failed", description: error.message || "Could not send the reply." });
    } finally {
        setIsSending(false);
    }
  };
  
  const handleSendSmsReply = async () => {
      if (!selectedThread?.clientPhone || !smsText) {
           toast({ variant: "destructive", title: "Missing Info", description: "Recipient phone number and a message are required." });
           return;
      }
      setIsSendingSms(true);
      try {
          const result = await sendSms(selectedThread.clientPhone, smsText);
          
          addSmsLog({
              to: selectedThread.clientPhone,
              message: smsText,
              success: result.success,
              response: result.message,
          });

          toast({
              title: result.success ? "SMS Sent" : "SMS Failed",
              description: result.message,
              variant: result.success ? "default" : "destructive",
          });

          if(result.success) {
            const newMessage: IMessage = { from: 'admin', text: `(SMS Sent) ${smsText}`, timestamp: new Date().toISOString() };
            addMessageToThread(selectedThread.id!, newMessage, 'admin');
            setSmsText('');
            setIsSmsDialogOpen(false);
            loadThreads();
          }

      } catch (error: any) {
          toast({ title: 'SMS Error', description: error.message, variant: 'destructive' });
      } finally {
        setIsSendingSms(false);
      }
  }

  const ThreadList = ({ threadType }: { threadType: 'contact' | 'live' }) => {
    const filteredThreads = threads.filter(t => t.type === threadType);
    
    return (
        filteredThreads.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
                <p>No messages of this type yet.</p>
            </div>
        ) : (
            <ul className="space-y-2">
                {filteredThreads.map((thread) => (
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
        )
    );
  };
  
  const unreadCount = threads.filter(t => t.unreadByAdmin).length;
  const unreadContactCount = threads.filter(t => t.type === 'contact' && t.unreadByAdmin).length;
  const unreadLiveCount = threads.filter(t => t.type === 'live' && t.unreadByAdmin).length;

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">Manage Messages</h1>
                <p className="text-muted-foreground">View client conversations from all sources.</p>
            </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
           <CardDescription>You have {unreadCount} unread conversations.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="contact">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="contact">
                        <FileText className="mr-2 h-4 w-4" />
                        Contact Forms {unreadContactCount > 0 && <Badge className="ml-2">{unreadContactCount}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="live">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Live Chats {unreadLiveCount > 0 && <Badge className="ml-2">{unreadLiveCount}</Badge>}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="contact" className="mt-4">
                    <ThreadList threadType="contact" />
                </TabsContent>
                <TabsContent value="live" className="mt-4">
                    <ThreadList threadType="live" />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
      
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[625px] flex flex-col h-[70vh]">
            <DialogHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <DialogTitle>Conversation with {selectedThread?.clientName}</DialogTitle>
                        <DialogDescription asChild>
                            <div className="text-sm text-muted-foreground space-y-1 text-left">
                                <div>Subject: {selectedThread?.subject}</div>
                                <div className="text-xs flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                                    {selectedThread?.clientEmail && selectedThread.clientEmail !== 'N/A' && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {selectedThread?.clientEmail}</div>}
                                    {selectedThread?.clientPhone && selectedThread.clientPhone !== 'N/A' && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {selectedThread.clientPhone}</div>}
                                </div>
                            </div>
                        </DialogDescription>
                    </div>
                    
                    <Dialog open={isSmsDialogOpen} onOpenChange={(open) => { if(!isSendingSms) setIsSmsDialogOpen(open) }}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={!selectedThread?.clientPhone || selectedThread?.clientPhone === 'N/A'}>
                                <MessageSquareText className="mr-2 h-4 w-4"/> SMS
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Send SMS to {selectedThread?.clientName}</DialogTitle>
                                <DialogDescription>To: {selectedThread?.clientPhone}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2 py-4">
                                <Label htmlFor="sms-message">Message</Label>
                                <Textarea id="sms-message" value={smsText} onChange={(e) => setSmsText(e.target.value)} placeholder="Type your SMS here..."/>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsSmsDialogOpen(false)} disabled={isSendingSms}>Cancel</Button>
                                <Button onClick={handleSendSmsReply} disabled={isSendingSms || !smsText}>
                                    {isSendingSms ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Send SMS
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </DialogHeader>
            <div className="py-4 flex-1 overflow-y-auto space-y-4 pr-4">
                {selectedThread?.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((message, index) => (
                    <div key={index} className={`flex items-end gap-2 ${message.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    {message.from === 'client' && <Avatar className="h-8 w-8"><AvatarImage src={selectedThread.clientAvatar} alt={selectedThread.clientName}/><AvatarFallback>{selectedThread.clientName.charAt(0)}</AvatarFallback></Avatar>}
                    <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${message.from === 'admin' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                            <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
                            <FormattedTimestamp timestamp={message.timestamp} className="text-xs text-right mt-1 opacity-70" />
                    </div>
                    {message.from === 'admin' && user && <Avatar className="h-8 w-8"><AvatarImage src={adminAvatar} alt={user.displayName || 'Admin'} /><AvatarFallback>{user.displayName?.charAt(0) || 'A'}</AvatarFallback></Avatar>}
                    </div>
                ))}
            </div>
            <DialogFooter className="mt-auto pt-4 border-t">
                <div className="relative w-full flex items-center gap-2">
                    <Textarea placeholder={selectedThread?.type === 'live' ? "Type your chat reply..." : "Type your email reply..."} className="pr-12" rows={1} value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey && !isSending) { e.preventDefault(); handleSendReply(); } }} />
                    <Button size="icon" className="h-9 w-9" onClick={handleSendReply} disabled={!replyText || isSending}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
