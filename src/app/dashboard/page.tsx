'use client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, Eye, FolderKanban, FilePlus2, MessageSquare } from 'lucide-react';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

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
        { title: "Today's Notifications", value: "12", icon: Bell, description: "+5% from yesterday" },
        { title: "Total Projects", value: "35", icon: FolderKanban, description: "2 ongoing, 3 completed" },
        { title: "Today's Visitors", value: "1,204", icon: Eye, description: "+15% from last week" },
    ];
    
    const quickActions = [
        { label: "Add New Project", icon: FilePlus2, href: "/dashboard/projects/add" },
        { label: "View Portfolio", icon: FolderKanban, href: "/#portfolio" },
        { label: "Contact Client", icon: MessageSquare, href: "/dashboard/messages" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Welcome, {user.displayName || user.email}!</h1>
                <p className="text-muted-foreground">Here's a quick overview of your dashboard.</p>
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
                    <CardDescription>Get started with your most common tasks.</CardDescription>
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
    );
}
