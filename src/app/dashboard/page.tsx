
'use client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FolderKanban, ClipboardList, MessageSquare, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getProjectsByUserId, getRequestsByUserId, getMessageThreadsForUser } from '@/services/data';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [showWelcome, setShowWelcome] = useState(false);
    const [stats, setStats] = useState([
        { title: "Active Projects", value: "0", icon: FolderKanban, description: "0 waiting for review" },
        { title: "Pending Requests", value: "0", icon: ClipboardList, description: "Awaiting approval" },
        { title: "Unread Messages", value: "0", icon: MessageSquare, description: "No new messages" },
    ]);

    useEffect(() => {
        const welcomeShown = sessionStorage.getItem('welcomeShown');
        if (!loading && user && !welcomeShown) {
            setShowWelcome(true);
            sessionStorage.setItem('welcomeShown', 'true');
        }

        const fetchStats = async () => {
            if(user) {
                try {
                    const [projects, requests, threads] = await Promise.all([
                        getProjectsByUserId(user.uid),
                        getRequestsByUserId(user.uid),
                        getMessageThreadsForUser(user.uid)
                    ]);

                    setStats(prev => prev.map(s => {
                        switch(s.title) {
                            case "Active Projects":
                                return { ...s, value: projects.filter(p => p.status === 'In Progress').length.toString(), description: `${projects.filter(p => p.status === 'Pending').length} waiting for review` };
                            case "Pending Requests":
                                const pending = requests.filter(r => r.status === 'Pending').length;
                                return { ...s, value: pending.toString(), description: "Awaiting approval" };
                            case "Unread Messages":
                                const unread = threads.filter(t => t.unreadByUser).length;
                                return { ...s, value: unread.toString(), description: `${unread} unread messages` };
                            default:
                                return s;
                        }
                    }));
                } catch (error) {
                    console.error("Failed to fetch user stats:", error);
                }
            }
        };

        fetchStats();
    }, [user, loading]);

    if (loading) {
      return (
           <div className="flex items-center justify-center h-full">
              <p>Loading...</p>
          </div>
      )
    }
    
    if (!user) {
        return null;
    }
    
    const quickActions = [
        { label: "Make a New Request", icon: PlusCircle, href: "/dashboard/requests" },
        { label: "View Messages", icon: MessageSquare, href: "/dashboard/messages" },
        { label: "View My Projects", icon: FolderKanban, href: "/dashboard/projects" },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

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

            <motion.div 
                className="space-y-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl font-bold">Welcome, {user.displayName || user.email}!</h1>
                    <p className="text-muted-foreground">Here's a summary of your account.</p>
                </motion.div>
                
                <motion.div
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                    variants={containerVariants}
                >
                     {stats.map((stat, index) => (
                        <motion.div key={index} variants={itemVariants}>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                     ))}
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Easily access your most frequent tasks.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            {quickActions.map((action, index) => (
                                <Button key={index} onClick={() => router.push(action.href)} variant="outline">
                                    <action.icon className="mr-2 h-4 w-4" />
                                    {action.label}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </>
    );
}
