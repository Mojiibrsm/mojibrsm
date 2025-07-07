
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const messages = [
  {
    id: 1,
    sender: 'Mojib Rsm',
    subject: 'Re: Project Update',
    snippet: 'Hey, just wanted to give you a quick update on the e-commerce redesign. We are on track...',
    content: 'Hey, just wanted to give you a quick update on the e-commerce redesign. We are on track to meet the deadline. The latest mockups are attached. Please review and provide feedback. Thanks!',
    avatar: 'https://placehold.co/40x40.png',
    read: false,
  },
  {
    id: 2,
    sender: 'Client Support',
    subject: 'Your request #REQ-002 has been received',
    snippet: 'Thank you for your request. We have received it and will get back to you shortly.',
    content: 'Thank you for your request. We have received it and will get back to you shortly. Our team will review the details and provide an update within 24 hours.',
    avatar: 'https://placehold.co/40x40.png',
    read: true,
  },
  {
    id: 3,
    sender: 'Mojib Rsm',
    subject: 'Welcome to the platform!',
    snippet: 'Hi there, welcome! Let me know if you have any questions about getting started.',
    content: 'Hi there, welcome! We are thrilled to have you on board. Let me know if you have any questions about getting started. You can check our documentation or reply to this message directly.',
    avatar: 'https://placehold.co/40x40.png',
    read: true,
  },
];

type Message = typeof messages[0];

export default function MessagesPage() {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Your inbox for all communications.</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>You have {messages.filter(m => !m.read).length} unread messages.</CardDescription>
            </div>
            <Button onClick={() => setIsComposeOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Message
            </Button>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {messages.map((message) => (
              <li key={message.id} className={`p-4 rounded-lg flex items-start gap-4 cursor-pointer hover:bg-muted/50 ${!message.read ? 'bg-muted' : ''}`} onClick={() => handleViewMessage(message)}>
                <Avatar>
                  <AvatarImage src={message.avatar} />
                  <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1 flex-1">
                    <div className="flex items-center justify-between">
                        <p className={`font-semibold ${!message.read ? 'text-foreground' : ''}`}>{message.sender}</p>
                        {!message.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                  <p className={`text-sm ${!message.read ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{message.subject}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{message.snippet}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      {/* View Message Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>From: {selectedMessage?.sender}</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            {selectedMessage?.content}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Compose Message Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compose New Message</DialogTitle>
            <DialogDescription>
              Send a message to the site owner.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Your message subject" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="body">Message</Label>
              <Textarea id="body" placeholder="Please describe your message..." className="min-h-[120px]" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsComposeOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={() => setIsComposeOpen(false)}>Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
