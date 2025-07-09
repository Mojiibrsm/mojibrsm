'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getMessageThreads, addMessageToThread, markThreadAsRead, IMessage, IMessageThread, addSmsLog } from '@/services/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Send, Mail, MessageSquareText, Loader2, Phone, MessageCircle, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { FormattedTimestamp } from '@/components/formatted-timestamp';
import { Label } from '@/components/ui/label';
import { sendSms } from '@/services/sms';
import { translations } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export default function AdminLiveChatPage() {
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
    const fetchedThreads = getMessageThreads().filter(t => t.type === 'live');
    setThreads(fetchedThreads);
  }, []);

  useEffect(() => {
    if (user) {
      loadThreads();
    }
  }, [user, loadThreads]);

  useEffect(() => {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    const intervalId = setInterval(() => {
        const newTimestamp = localStorage.getItem('new_live_chat_message_timestamp');
        if (newTimestamp && newTimestamp !== lastNotifiedTimestamp.current) {
            lastNotifiedTimestamp.current = newTimestamp;
            loadThreads(); 
            
            const threads = getMessageThreads();
            const lastLiveChat = threads.find(t => t.type === 'live' && t.lastMessageTimestamp === newTimestamp);

            if (Notification.permission === "granted" && lastLiveChat) {
                const notification = new Notification(`New Live Chat from ${lastLiveChat.clientName}`, {
                    body: lastLiveChat.lastMessage,
                    icon: translations.en.site.publicLogo,
                });
                notification.onclick = () => {
                    router.push('/admin/live-chat');
                    window.focus();
                };
            }
        }
    }, 3000); 

    return () => clearInterval(intervalId);
  }, [router, loadThreads]);

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
        const newMessage: IMessage = { from: 'admin', text: replyText, timestamp: new Date().toISOString() };
        addMessageToThread(selectedThread.id, newMessage, 'admin');
        setReplyText("");
        loadThreads();
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

  const unreadCount = threads.filter(t => t.unreadByAdmin).length;

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">Live Chat</h1>
                <p className="text-muted-foreground">View and respond to live chat conversations from your website.</p>
            </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Live Chat Inbox</CardTitle>
           <CardDescription>You have {unreadCount} unread conversations.</CardDescription>
        </CardHeader>
        <CardContent>
            {threads.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                    <p>No live chats yet.</p>
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
                                    <p className={`font-semibold ${thread.unreadByAdmin ? 'text-primary' : ''}`}>{thread.clientName}</p>
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
                <div className="flex justify-between items-start">
                    <div>
                        <DialogTitle>Chat with {selectedThread?.clientName}</DialogTitle>
                         <DialogDescription asChild>
                            <div className="text-sm text-muted-foreground space-y-1 text-left">
                                <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {selectedThread?.clientPhone || 'N/A'}</div>
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
                    <Textarea placeholder="Type your chat reply..." className="pr-12" rows={1} value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey && !isSending) { e.preventDefault(); handleSendReply(); } }} />
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
