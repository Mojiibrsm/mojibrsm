
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/language-context';
import { createMessageThread, addMessageToThread, getMessageThreads, IMessage, IMessageThread } from '@/services/data';
import { FormattedTimestamp } from './formatted-timestamp';

export default function LiveChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [threadId, setThreadId] = useState<string | null>(null);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const { t } = useLanguage();
    const adminAvatar = t.site.adminAvatar;
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Effect for initial load from localStorage
    useEffect(() => {
        const storedThreadId = localStorage.getItem('live_chat_thread_id');
        if (storedThreadId) {
            setThreadId(storedThreadId);
            const threads = getMessageThreads();
            const currentThread = threads.find(t => t.id === storedThreadId);
            if (currentThread) {
                setMessages(currentThread.messages);
            }
        }
    }, []);
    
    // Effect for polling for new messages from admin
    useEffect(() => {
        if (threadId) {
            const intervalId = setInterval(() => {
                const threads = getMessageThreads();
                const currentThread = threads.find(t => t.id === threadId);
                // Check if there are new messages before updating state to prevent re-renders
                if (currentThread && JSON.stringify(currentThread.messages) !== JSON.stringify(messages)) {
                    setMessages(currentThread.messages);
                }
            }, 3000); // Poll every 3 seconds
            
            return () => clearInterval(intervalId);
        }
    }, [threadId, messages]);

    // Effect for scrolling to the bottom of the chat
    useEffect(() => {
        if (isOpen && scrollAreaRef.current) {
            setTimeout(() => {
                 scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
            }, 100);
        }
    }, [messages, isOpen]);

    const handleSendMessage = () => {
        if (!inputText.trim()) return;

        const newMessage: IMessage = {
            from: 'client',
            text: inputText.trim(),
            timestamp: new Date().toISOString(),
        };

        if (threadId) {
            addMessageToThread(threadId, newMessage, 'client');
            setMessages(prev => [...prev, newMessage]);
        } else {
            const newThreadData = {
                userId: `live-chat-visitor-${Date.now()}`,
                clientName: 'Live Chat Visitor',
                clientEmail: 'N/A',
                clientAvatar: 'https://i.postimg.cc/8P04g40T/man.png',
                clientPhone: 'N/A',
                subject: 'Live Chat Conversation',
                unreadByAdmin: true,
                unreadByUser: false,
                type: 'live' as const,
            };
            const newThread = createMessageThread(newThreadData, newMessage);
            setThreadId(newThread.id);
            localStorage.setItem('live_chat_thread_id', newThread.id);
            setMessages([newMessage]);
        }
        
        // This key is polled by the admin panel to trigger notifications
        localStorage.setItem('new_live_chat_message_timestamp', new Date().toISOString());

        setInputText('');
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="fixed bottom-24 right-4 z-50 w-80"
                    >
                        <Card className="flex flex-col h-[28rem] shadow-2xl">
                            <CardHeader className="flex flex-row items-center justify-between p-3 bg-primary text-primary-foreground rounded-t-lg">
                                <CardTitle className="text-lg">{t.chat.title}</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-7 w-7 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
                                    <X className="h-5 w-5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0 flex-1">
                                <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                                    <div className="space-y-4">
                                        <div className="text-center text-xs text-muted-foreground">{t.chat.greeting}</div>
                                        {messages.map((message, index) => (
                                            <div key={index} className={`flex items-end gap-2 ${message.from === 'client' ? 'justify-end' : 'justify-start'}`}>
                                                {message.from === 'admin' && <Avatar className="h-8 w-8"><AvatarImage src={adminAvatar} /><AvatarFallback>A</AvatarFallback></Avatar>}
                                                <div className={`max-w-xs p-3 rounded-2xl text-sm ${message.from === 'client' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                                                    <p style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
                                                    <FormattedTimestamp timestamp={message.timestamp} className="text-xs text-right mt-1 opacity-70" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="p-2 border-t">
                                <div className="flex w-full items-center gap-2">
                                    <Input 
                                        placeholder={t.chat.placeholder} 
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => { if(e.key === 'Enter') handleSendMessage() }}
                                    />
                                    <Button size="icon" onClick={handleSendMessage} disabled={!inputText.trim()}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
            >
                <Button
                    size="icon"
                    className="fixed bottom-4 right-4 z-50 h-16 w-16 rounded-full shadow-lg"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="h-8 w-8" /> : <MessageSquare className="h-8 w-8" />}
                </Button>
            </motion.div>
        </>
    );
}
