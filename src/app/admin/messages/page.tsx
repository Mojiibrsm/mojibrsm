
'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getMessageThreads, addMessageToThread, markThreadAsRead, createMessageThread, IMessage, IMessageThread } from '@/services/firestore';
import { Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Send, PlusCircle, Mail, MessageSquareText, FileKey, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { FormattedTimestamp } from '@/components/formatted-timestamp';
import { Label } from '@/components/ui/label';
import { sendOtp } from '@/services/sms';

export default function AdminMessagesPage() {
  const [threads, setThreads] = useState<IMessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<IMessageThread | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [newThreadData, setNewThreadData] = useState({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      subject: '',
      message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
      if (!user) return;
      const unsubscribe = getMessageThreads((fetchedThreads) => {
          setThreads(fetchedThreads);
          if (selectedThread) {
            const updatedThread = fetchedThreads.find(t => t.id === selectedThread.id);
            if (updatedThread) setSelectedThread(updatedThread);
          }
      });
      return () => unsubscribe();
  }, [user, selectedThread]);

  const handleViewThread = async (thread: IMessageThread) => {
    setSelectedThread(thread);
    setIsViewOpen(true);
    if (thread.id && thread.unreadByAdmin) {
        await markThreadAsRead(thread.id, 'admin');
    }
  };
  
  const handleReply = async () => {
    if (!selectedThread?.id || !replyText || !user) return;
    const newMessage: IMessage = { from: 'admin', text: replyText, timestamp: Timestamp.now() };
    try {
        await addMessageToThread(selectedThread.id, newMessage, 'admin');
        setReplyText("");
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to send reply." });
    }
  };

  const handleComposeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setNewThreadData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateThread = async () => {
      if (!user || !newThreadData.clientEmail || !newThreadData.subject || !newThreadData.message) {
          toast({ variant: "destructive", title: "Missing Information", description: "Client email, subject, and message are required." });
          return;
      }
      setIsSending(true);

      const threadData = {
          userId: newThreadData.clientEmail, // Using email as a unique user ID for simplicity
          clientName: newThreadData.clientName || 'N/A',
          clientEmail: newThreadData.clientEmail,
          clientAvatar: `https://placehold.co/100x100.png`,
          clientPhone: newThreadData.clientPhone || 'N/A',
          subject: newThreadData.subject,
          unreadByAdmin: false,
          unreadByUser: true,
      };

      const initialMessage: IMessage = {
          from: 'admin',
          text: newThreadData.message,
          timestamp: Timestamp.now(),
      };

      try {
          await createMessageThread(threadData, initialMessage);
          toast({ title: "Message Sent", description: `A new conversation has been started with ${newThreadData.clientName || newThreadData.clientEmail}.` });
          setIsComposeOpen(false);
          setNewThreadData({ clientName: '', clientEmail: '', clientPhone: '', subject: '', message: '' });
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Failed to create new conversation." });
      } finally {
          setIsSending(false);
      }
  };
  
  const handleSendOtp = async () => {
      if (!newThreadData.clientPhone) {
           toast({ variant: "destructive", title: "Missing Phone Number", description: "Please enter a client phone number to send an OTP." });
           return;
      }
      setIsSendingOtp(true);
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
      const result = await sendOtp(newThreadData.clientPhone, otp);
      toast({
          title: result.success ? "OTP Status" : "OTP Failed",
          description: result.message,
          variant: result.success ? "default" : "destructive",
      });
      setIsSendingOtp(false);
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">Manage Messages</h1>
                <p className="text-muted-foreground">View and respond to all client conversations.</p>
            </div>
            <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Message
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Compose New Message</DialogTitle>
                        <DialogDescription>Manually start a new conversation with a client.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="clientName" className="text-right">Client Name</Label>
                            <Input id="clientName" name="clientName" value={newThreadData.clientName} onChange={handleComposeChange} className="col-span-3" placeholder="John Doe"/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="clientEmail" className="text-right">Client Email</Label>
                            <Input id="clientEmail" name="clientEmail" type="email" value={newThreadData.clientEmail} onChange={handleComposeChange} className="col-span-3" placeholder="client@example.com" required/>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="clientPhone" className="text-right">Client Phone</Label>
                            <Input id="clientPhone" name="clientPhone" value={newThreadData.clientPhone} onChange={handleComposeChange} className="col-span-3" placeholder="+1234567890"/>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subject" className="text-right">Subject</Label>
                            <Input id="subject" name="subject" value={newThreadData.subject} onChange={handleComposeChange} className="col-span-3" placeholder="Regarding your project..." required/>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="message" className="text-right pt-2">Message</Label>
                            <Textarea id="message" name="message" value={newThreadData.message} onChange={handleComposeChange} className="col-span-3" placeholder="Type your message here." required/>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <Button variant="outline" onClick={handleSendOtp} disabled={isSendingOtp || !newThreadData.clientPhone}>
                            {isSendingOtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileKey className="mr-2 h-4 w-4"/>}
                            Send OTP
                        </Button>
                        <div className="flex gap-2">
                          <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                          <Button onClick={handleCreateThread} disabled={isSending}>
                              {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                              Send Message
                          </Button>
                        </div>
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
            {selectedThread?.messages.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis()).map((message, index) => (
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
