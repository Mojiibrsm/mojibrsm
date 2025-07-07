'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const messages = [
  {
    id: 1,
    sender: 'Mojib Rsm',
    subject: 'Re: Project Update',
    snippet: 'Hey, just wanted to give you a quick update on the e-commerce redesign. We are on track...',
    avatar: 'https://placehold.co/40x40.png',
    read: false,
  },
  {
    id: 2,
    sender: 'Client Support',
    subject: 'Your request #REQ-002 has been received',
    snippet: 'Thank you for your request. We have received it and will get back to you shortly.',
    avatar: 'https://placehold.co/40x40.png',
    read: true,
  },
  {
    id: 3,
    sender: 'Mojib Rsm',
    subject: 'Welcome to the platform!',
    snippet: 'Hi there, welcome! Let me know if you have any questions about getting started.',
    avatar: 'https://placehold.co/40x40.png',
    read: true,
  },
];

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Your inbox for all communications.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>You have {messages.filter(m => !m.read).length} unread messages.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {messages.map((message) => (
              <li key={message.id} className={`p-4 rounded-lg flex items-start gap-4 cursor-pointer hover:bg-muted/50 ${!message.read ? 'bg-muted' : ''}`}>
                <Avatar>
                  <AvatarImage src={message.avatar} />
                  <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
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
    </div>
  );
}
