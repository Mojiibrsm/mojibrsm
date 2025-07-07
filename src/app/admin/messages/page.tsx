
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Send, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Note: Real data will be fetched from a database. This is a placeholder type.
type MessageThread = {
    id: number;
    clientName: string;
    lastMessage: string;
    timestamp: string;
    avatar: string;
    unread: boolean;
    thread: { from: 'client' | 'admin'; text: string }[];
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const { toast } = useToast();

  const handleViewThread = (thread: MessageThread) => {
    setSelectedThread(thread);
    setIsViewOpen(true);
  };
  
  const handleSendMessage = () => {
      toast({
          title: "Message Sent",
          description: "Your message has been sent to the user.",
      });
      setIsComposeOpen(false);
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
                        <DialogDescription>Send a direct message to a user.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                           <Label htmlFor="email">Recipient Email</Label>
                           <Input id="email" type="email" placeholder="user@example.com" />
                        </div>
                        <div className="grid gap-2">
                           <Label htmlFor="message">Message</Label>
                           <Textarea id="message" placeholder="Type your message..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSendMessage}>
                            <Send className="mr-2 h-4 w-4"/>
                            Send Message
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Client Conversations</CardTitle>
           <CardDescription>You have {messages.filter(m => m.unread).length} unread conversations.</CardDescription>
        </CardHeader>
        <CardContent>
           {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                    <p>No messages yet.</p>
                    <p className="text-sm">When a client sends a message, it will appear here.</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {messages.map((thread) => (
                    <li key={thread.id} className={`p-4 rounded-lg flex items-start gap-4 cursor-pointer hover:bg-muted/50 ${thread.unread ? 'bg-muted' : ''}`} onClick={() => handleViewThread(thread)}>
                        <Avatar className="h-12 w-12">
                        <AvatarImage src={thread.avatar} />
                        <AvatarFallback>{thread.clientName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1 flex-1">
                            <div className="flex items-center justify-between">
                                <p className={`font-semibold ${thread.unread ? 'text-foreground' : ''}`}>{thread.clientName}</p>
                                <p className="text-xs text-muted-foreground">{thread.timestamp}</p>
                            </div>
                        <p className={`text-sm text-muted-foreground line-clamp-2 ${thread.unread ? 'font-medium text-foreground' : ''}`}>{thread.lastMessage}</p>
                        </div>
                        {thread.unread && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1" />}
                    </li>
                    ))}
                </ul>
            )}
        </CardContent>
      </Card>
      
      {/* View Message Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[625px] flex flex-col h-[70vh]">
          <DialogHeader>
            <DialogTitle>Conversation with {selectedThread?.clientName}</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex-1 overflow-y-auto space-y-4 pr-4">
            {selectedThread?.thread.map((message, index) => (
                <div key={index} className={`flex items-end gap-2 ${message.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                   {message.from === 'client' && <Avatar className="h-8 w-8"><AvatarImage src={selectedThread.avatar} /><AvatarFallback>{selectedThread.clientName.charAt(0)}</AvatarFallback></Avatar>}
                   <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${message.from === 'admin' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                        <p className="text-sm">{message.text}</p>
                   </div>
                </div>
            ))}
          </div>
          <DialogFooter className="mt-auto pt-4 border-t">
            <div className="relative w-full">
                 <Textarea placeholder="Type your message..." className="pr-12" rows={1} />
                 <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8">
                    <Send className="h-4 w-4"/>
                 </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
