
'use client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutDashboard, Users, FolderKanban, GitPullRequest, MessageSquare, BarChart2, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

const adminNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/projects", label: "Projects", icon: FolderKanban },
    { href: "/admin/requests", label: "Requests", icon: GitPullRequest },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login?redirectTo=/admin');
    }
  }, [isLoggedIn, loading, router]);
  
  const handleLogout = () => {
    logout();
  };

  if (loading || !isLoggedIn || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading access control...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-muted/40">
        <Sidebar collapsible="icon" className="hidden lg:flex">
             <SidebarContent>
                <SidebarHeader>
                    <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Admin'}/>
                            <AvatarFallback>{user.displayName?.charAt(0) || 'A'}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                            <span className="text-sm font-semibold">{user.displayName}</span>
                            <span className="text-xs text-muted-foreground">{user.role}</span>
                        </div>
                    </div>
                </SidebarHeader>
                 <SidebarMenu className="flex-1">
                     {adminNavItems.map(item => (
                        <SidebarMenuItem key={item.href}>
                             <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                                <Link href={item.href}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </Link>
                             </SidebarMenuButton>
                        </SidebarMenuItem>
                     ))}
                 </SidebarMenu>
                 <SidebarFooter>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout} tooltip="Log Out">
                            <LogOut />
                            <span>Log Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                 </SidebarFooter>
             </SidebarContent>
        </Sidebar>
        <div className="flex flex-col flex-1">
            <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
                <div className="lg:hidden">
                    <SidebarTrigger />
                </div>
                <div className="flex-1">
                     <h1 className="text-lg font-semibold">{adminNavItems.find(i => i.href === pathname)?.label || 'Admin'}</h1>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                    <Link href="/"><Avatar><AvatarFallback>P</AvatarFallback></Avatar></Link>
                </Button>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
