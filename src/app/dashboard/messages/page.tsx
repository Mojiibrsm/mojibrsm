
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { createMessageThread, getMessageThreadsForUser, addMessageToThread, markThreadAsRead, IMessage, IMessageThread } from '@/services/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlusCircle, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FormattedTimestamp } from '@/components/formatted-timestamp';

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<IMessageThread[]>([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedThread, setSelectedThread] = useState<IMessageThread | null>(null);
  const [replyText, setReplyText] = useState("");
  const [newMessageSubject, setNewMessageSubject] = useState("");
  const [newMessageBody, setNewMessageBody] = useState("");

  const loadThreads = () => {
    if(!user) return;
    const fetchedThreads = getMessageThreadsForUser(user.uid);
    setThreads(fetchedThreads);
    if (selectedThread) {
        const updatedThread = fetchedThreads.find(t => t.id === selectedThread.id);
        if (updatedThread) {
            setSelectedThread(updatedThread);
        }
    }
  }

  useEffect(() => {
    loadThreads();
  }, [user]);

  const handleViewMessage = (thread: IMessageThread) => {
    setSelectedThread(thread);
    setIsViewOpen(true);
    if (thread.id && thread.unreadByUser) {
        markThreadAsRead(thread.id, 'user');
        loadThreads();
    }
  };

  const handleSendMessage = () => {
    if (!user || !newMessageSubject || !newMessageBody) {
        toast({ variant: "destructive", title: "Error", description: "Subject and message body cannot be empty." });
        return;
    }
    
    try {
        const threadData = {
            userId: user.uid,
            clientName: user.displayName || user.phoneNumber || 'Anonymous',
            clientEmail: user.email || 'N/A',
            clientAvatar: user.photoURL || '',
            clientPhone: user.phoneNumber || 'N/A',
            subject: newMessageSubject,
            unreadByAdmin: true,
            unreadByUser: false,
        };

        const initialMessage: IMessage = {
            from: 'client',
            text: newMessageBody,
            timestamp: new Date().toISOString(),
        };
        
        createMessageThread(threadData, initialMessage);

        toast({ title: "Message Sent", description: "Your message has been sent to the site owner." });
        setIsComposeOpen(false);
        setNewMessageSubject("");
        setNewMessageBody("");
        loadThreads();
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Error", description: "Failed to send message. Please try again." });
    }
  };
  
  const handleReply = () => {
    if (!selectedThread?.id || !replyText) return;

    const newMessage: IMessage = {
        from: 'client',
        text: replyText,
        timestamp: new Date().toISOString()
    };
    
    try {
        addMessageToThread(selectedThread.id, newMessage, 'client');
        setReplyText("");
        loadThreads();
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to send reply." });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Your inbox for all communications.</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>You have {threads.filter(t => t.unreadByUser).length} unread messages.</CardDescription>
            </div>
            <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                <DialogTrigger asChild>
                    <Button><PlusCircle className="mr-2 h-4 w-4" />New Message</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Compose New Message</DialogTitle>
                        <DialogDescription>Send a message to the site owner.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Input id="subject" placeholder="Your message subject" value={newMessageSubject} onChange={(e) => setNewMessageSubject(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="body">Message</Label>
                          <Textarea id="body" placeholder="Please describe your message..." className="min-h-[120px]" value={newMessageBody} onChange={(e) => setNewMessageBody(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsComposeOpen(false)} variant="outline">Cancel</Button>
                        <Button onClick={handleSendMessage}>Send Message</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
          {threads.length === 0 ? (
             <div className="text-center text-muted-foreground py-12">
                <p>No messages yet.</p>
                <p className="text-sm">Click "New Message" to start a conversation.</p>
            </div>
          ) : (
             <ul className="space-y-2">
                {threads.map((thread) => (
                <li key={thread.id} className={`p-4 rounded-lg flex items-start gap-4 cursor-pointer hover:bg-muted/50 ${thread.unreadByUser ? 'bg-primary/10' : ''}`} onClick={() => handleViewMessage(thread)}>
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={thread.clientAvatar} alt="Admin" />
                        <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1 flex-1">
                        <div className="flex items-center justify-between">
                            <p className={`font-semibold ${thread.unreadByUser ? 'text-primary' : ''}`}>{thread.subject}</p>
                            <FormattedTimestamp timestamp={thread.lastMessageTimestamp} className="text-xs text-muted-foreground" />
                        </div>
                    <p className={`text-sm text-muted-foreground line-clamp-2 ${thread.unreadByUser ? 'font-medium text-foreground' : ''}`}>{thread.lastMessage}</p>
                    </div>
                    {thread.unreadByUser && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1" />}
                </li>
                ))}
            </ul>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[625px] flex flex-col h-[70vh]">
          <DialogHeader>
            <DialogTitle>{selectedThread?.subject}</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex-1 overflow-y-auto space-y-4 pr-4">
            {selectedThread?.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((message, index) => (
                <div key={index} className={`flex items-end gap-2 ${message.from === 'client' ? 'justify-end' : 'justify-start'}`}>
                   {message.from === 'admin' && <Avatar className="h-8 w-8"><AvatarImage src={''} alt="Admin" /><AvatarFallback>A</AvatarFallback></Avatar>}
                   <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${message.from === 'client' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                        <p className="text-sm">{message.text}</p>
                        <FormattedTimestamp timestamp={message.timestamp} className="text-xs text-right mt-1 opacity-70" />
                   </div>
                   {message.from === 'client' && user && <Avatar className="h-8 w-8"><AvatarImage src={user.photoURL || ''} alt={user.displayName || 'You'} /><AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback></Avatar>}
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
  );
}
