
'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getMessageThreads, addMessageToThread, markThreadAsRead, IMessage, IMessageThread } from '@/services/firestore';
import { Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Send, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { FormattedTimestamp } from '@/components/formatted-timestamp';

export default function AdminMessagesPage() {
  const [threads, setThreads] = useState<IMessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<IMessageThread | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
      if (!user) return;
      const unsubscribe = getMessageThreads((fetchedThreads) => {
          setThreads(fetchedThreads);
          // If a thread is being viewed, update its content in real-time
          if (selectedThread) {
            const updatedThread = fetchedThreads.find(t => t.id === selectedThread.id);
            if (updatedThread) {
                setSelectedThread(updatedThread);
            }
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

    const newMessage: IMessage = {
        from: 'admin',
        text: replyText,
        timestamp: Timestamp.now()
    };
    
    try {
        await addMessageToThread(selectedThread.id, newMessage, 'admin');
        setReplyText("");
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to send reply." });
    }
  }

  // Note: 'New Message' from Admin is a more complex feature (requires user selection)
  // and is scoped out for this update to focus on fixing replies.
  // A placeholder dialog is kept for future implementation.

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">Manage Messages</h1>
                <p className="text-muted-foreground">View and respond to all client conversations.</p>
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button disabled>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Message
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Compose New Message</DialogTitle>
                        <DialogDescription>This feature is under development. You can reply to existing conversations.</DialogDescription>
                    </DialogHeader>
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
            <DialogTitle>Conversation with {selectedThread?.clientName}</DialogTitle>
            <DialogDescription>{selectedThread?.subject}</DialogDescription>
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
