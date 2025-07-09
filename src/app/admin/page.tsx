
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { FolderKanban, ClipboardList, MessageSquare, Users, PlusCircle } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useEffect, useState } from 'react';
import { getProjects, getMessageThreads, getAllRequests } from '@/services/data';

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [chartData, setChartData] = useState<any[]>([]);
    const [stats, setStats] = useState([
        { title: "Total Projects", value: "0", icon: FolderKanban, description: "0 active projects" },
        { title: "Pending Requests", value: "0", icon: ClipboardList, description: "Awaiting approval" },
        { title: "Total Users", value: "1", icon: Users, description: "1 admin user" },
        { title: "New Messages", value: "0", icon: MessageSquare, description: "No new messages" },
    ]);

    useEffect(() => {
        // This useEffect will run only once on the client-side for chart data
        const generateChartData = () => {
          return [
            { name: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Feb", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Apr", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "May", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Jul", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Aug", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Sep", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Oct", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Nov", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Dec", total: Math.floor(Math.random() * 5000) + 1000 },
          ];
        };
        setChartData(generateChartData());

        // Fetch real data for stats
        const projects = getProjects();
        setStats(prev => prev.map(s => s.title === "Total Projects" ? { ...s, value: projects.length.toString(), description: `${projects.filter(p => p.status === 'In Progress').length} active projects` } : s));

        const requests = getAllRequests();
        const pending = requests.filter(r => r.status === 'Pending').length;
        setStats(prev => prev.map(s => s.title === "Pending Requests" ? { ...s, value: pending.toString(), description: `Awaiting approval` } : s));

        const threads = getMessageThreads();
        const unread = threads.filter(t => t.unreadByAdmin).length;
        setStats(prev => prev.map(s => s.title === "New Messages" ? { ...s, value: unread.toString(), description: `${unread} unread messages` } : s));

    }, []);

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.displayName || 'Admin'}!</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                         <CardDescription>Monthly revenue overview.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                         <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData}>
                                <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                />
                                <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `৳${value}`}
                                />
                                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Quickly manage your site.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                       <Button onClick={() => router.push('/admin/projects')}>
                         <PlusCircle className="mr-2 h-4 w-4" />
                         Add New Project
                       </Button>
                       <Button variant="secondary" onClick={() => router.push('/admin/requests')}>
                         <ClipboardList className="mr-2 h-4 w-4" />
                         Review Requests
                       </Button>
                        <Button variant="secondary" onClick={() => router.push('/admin/messages')}>
                         <MessageSquare className="mr-2 h-4 w-4" />
                         View Messages
                       </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
