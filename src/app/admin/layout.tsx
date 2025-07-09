'use client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, FolderKanban, ClipboardList, LayoutDashboard, LogOut, MessageSquare, History, Settings, LineChart, Newspaper, FileImage } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { LanguageSwitcher } from '@/components/language-switcher';

const adminNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/analytics", label: "Analytics", icon: LineChart },
    { href: "/admin/content", label: "Content", icon: FileText },
    { href: "/admin/blog", label: "Blog", icon: Newspaper },
    { href: "/admin/projects", label: "Projects", icon: FolderKanban },
    { href: "/admin/media", label: "Media", icon: FileImage },
    { href: "/admin/requests", label: "Requests", icon: ClipboardList },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare },
    { href: "/admin/history", label: "History", icon: History },
    { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push(`/login?redirectTo=${pathname}`);
    }
  }, [isLoggedIn, loading, router, pathname]);
  
  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" suppressHydrationWarning>
        <p>Loading access control...</p>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <div className="flex h-screen items-center justify-center" suppressHydrationWarning>
        <p>Redirecting to login...</p>
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
                            <AvatarImage src={t.site.logo} alt={t.site.title}/>
                            <AvatarFallback>{t.site.title.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                            <span className="text-sm font-semibold">{t.site.title}</span>
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
        <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
                <div className="lg:hidden">
                    <SidebarTrigger />
                </div>
                <div className="flex-1">
                     <h1 className="text-lg font-semibold">{adminNavItems.find(i => i.href === pathname)?.label || 'Admin'}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                    <Button variant="ghost" size="icon" className="rounded-full" asChild>
                        <Link href="/admin/content">
                            <Avatar>
                                <AvatarImage src={t.site.adminAvatar} alt={t.site.title} />
                                <AvatarFallback>{t.site.title.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
