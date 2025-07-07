
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Send, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const mockMessages = [
  {
    id: 1,
    clientName: 'Alice Johnson',
    lastMessage: 'Sure, that sounds good. Please send over the invoice.',
    timestamp: '2 hours ago',
    avatar: 'https://placehold.co/40x40.png',
    unread: true,
    thread: [
        { from: 'client', text: 'Hey, I reviewed the mockups. They look great!' },
        { from: 'admin', text: 'Glad you like them! Any changes needed?' },
        { from: 'client', text: 'Sure, that sounds good. Please send over the invoice.' },
    ]
  },
  {
    id: 2,
    clientName: 'Bob Williams',
    lastMessage: 'Can we schedule a call for tomorrow to discuss the project?',
    timestamp: '1 day ago',
    avatar: 'https://placehold.co/40x40.png',
    unread: false,
     thread: [
        { from: 'client', text: 'Can we schedule a call for tomorrow to discuss the project?' },
    ]
  },
];

type MessageThread = typeof mockMessages[0];

export default function AdminMessagesPage() {
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const handleViewThread = (thread: MessageThread) => {
    setSelectedThread(thread);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold">Manage Messages</h1>
        <p className="text-muted-foreground">View and respond to all client conversations.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Client Conversations</CardTitle>
           <CardDescription>You have {mockMessages.filter(m => m.unread).length} unread conversations.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {mockMessages.map((thread) => (
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
