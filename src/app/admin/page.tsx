
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { FolderKanban, ClipboardList, MessageSquare, Users, PlusCircle, LineChart } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useEffect, useState } from 'react';
import { getProjects, getMessageThreads, getAllRequests } from '@/services/data';
import { useLanguage } from '@/contexts/language-context';

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();
    const [chartData, setChartData] = useState<any[]>([]);
    const [stats, setStats] = useState([
        { title: "Total Projects", value: "0", icon: FolderKanban, description: "0 active projects" },
        { title: "Pending Requests", value: "0", icon: ClipboardList, description: "Awaiting approval" },
        { title: "Site Visitors", value: "0", icon: Users, description: "From the last 30 days" },
        { title: "New Messages", value: "0", icon: MessageSquare, description: "No new messages" },
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch all data concurrently
                const [projects, requests, threads] = await Promise.all([
                    getProjects(),
                    getAllRequests(),
                    getMessageThreads()
                ]);

                // Update stats based on fetched data
                setStats(prev => prev.map(s => {
                    switch (s.title) {
                        case "Total Projects":
                            return { ...s, value: projects.length.toString(), description: `${projects.filter(p => p.status === 'In Progress').length} active projects` };
                        case "Pending Requests":
                            const pending = requests.filter(r => r.status === 'Pending').length;
                            return { ...s, value: pending.toString(), description: `Awaiting approval` };
                        case "New Messages":
                            const unread = threads.filter(t => t.unreadByAdmin).length;
                            return { ...s, value: unread.toString(), description: `${unread} unread messages` };
                        default:
                            return s;
                    }
                }));

            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            }
        };

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
        
        const visitorCount = Math.floor(Math.random() * 2000) + 500;
        setStats(prev => prev.map(s => s.title === "Site Visitors" ? { ...s, value: visitorCount.toLocaleString(), description: `From the last 30 days` } : s));

        fetchStats();

    }, []);

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {t.site.title || 'Admin'}!</p>
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
                        <CardTitle>Website Traffic</CardTitle>
                         <CardDescription>A demo of your monthly website visitors.</CardDescription>
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
                                tickFormatter={(value) => value.toLocaleString()}
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
                       <Button variant="secondary" onClick={() => router.push('/admin/analytics')}>
                         <LineChart className="mr-2 h-4 w-4" />
                         View Analytics
                       </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
