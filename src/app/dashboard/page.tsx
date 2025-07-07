'use client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, FolderKanban, MessageSquare, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        // Show the welcome dialog only once per session
        if (!sessionStorage.getItem('welcomeShown')) {
            setShowWelcome(true);
            sessionStorage.setItem('welcomeShown', 'true');
        }
    }, []);

    if (loading) {
      return (
           <div className="flex items-center justify-center h-screen bg-background text-foreground">
              <p>Loading...</p>
          </div>
      )
    }
    
    // The layout should handle redirecting unauthenticated users.
    if (!user) {
        return null;
    }

    const stats = [
        { title: "Active Projects", value: "2", icon: FolderKanban, description: "1 waiting for review" },
        { title: "Pending Requests", value: "1", icon: Bell, description: "Awaiting approval" },
        { title: "Unread Messages", value: "3", icon: MessageSquare, description: "+2 from yesterday" },
    ];
    
    const quickActions = [
        { label: "Make a New Request", icon: PlusCircle, href: "/dashboard/requests" },
        { label: "View Messages", icon: MessageSquare, href: "/dashboard/messages" },
        { label: "View My Projects", icon: FolderKanban, href: "/dashboard/projects" },
    ];

    return (
        <>
            <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Welcome to your Dashboard, {user.displayName || 'User'}!</DialogTitle>
                        <DialogDescription className="pt-4">
                            This is your personal space to manage projects, requests, and messages.
                            Feel free to explore the sections using the sidebar. If you have any questions,
                            don't hesitate to reach out!
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowWelcome(false)}>Got it!</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Welcome, {user.displayName || user.email}!</h1>
                    <p className="text-muted-foreground">Here's a summary of your account.</p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                     {stats.map((stat, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">{stat.description}</p>
                            </CardContent>
                        </Card>
                     ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Easily access your most frequent tasks.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4">
                         {quickActions.map((action, index) => (
                            <Button key={index} onClick={() => router.push(action.href)}>
                                <action.icon className="mr-2 h-4 w-4" />
                                {action.label}
                            </Button>
                         ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
