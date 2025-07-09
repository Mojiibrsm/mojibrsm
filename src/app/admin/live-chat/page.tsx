'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircleOff } from 'lucide-react';

export default function AdminLiveChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Live Chat</h1>
        <p className="text-muted-foreground">This feature has been replaced with a WhatsApp widget.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Live Chat Feature Removed</CardTitle>
          <CardDescription>
            The integrated live chat system has been disabled to improve performance and reliability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
              <MessageCircleOff className="h-12 w-12 mb-4" />
              <p className="font-semibold">The live chat feature has been disabled.</p>
              <p className="text-sm mt-1">Please use the new WhatsApp widget on the main site for direct client communication.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
