
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutDashboard, User, Folder, MessageCircle, Settings, LogOut, GitPullRequest } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

const dashboardNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/profile", label: "My Profile", icon: User },
    { href: "/dashboard/projects", label: "My Projects", icon: Folder },
    { href: "/dashboard/requests", label: "My Requests", icon: GitPullRequest },
    { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login?redirectTo=/dashboard');
    }
  }, [isLoggedIn, loading, router]);
  
  const handleLogout = () => {
    logout();
  };

  if (loading || !isLoggedIn || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
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
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'}/>
                            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                            <span className="text-sm font-semibold">{user.displayName}</span>
                            <span className="text-xs text-muted-foreground">Client</span>
                        </div>
                    </div>
                </SidebarHeader>
                 <SidebarMenu className="flex-1">
                     {dashboardNavItems.map(item => (
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
                     <h1 className="text-lg font-semibold">{dashboardNavItems.find(i => i.href === pathname)?.label || 'Dashboard'}</h1>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                    <Link href="/"><Avatar><AvatarFallback>H</AvatarFallback></Avatar></Link>
                </Button>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
