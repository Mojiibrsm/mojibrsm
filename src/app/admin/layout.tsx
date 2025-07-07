
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  LayoutGrid,
  FolderKanban,
  GitPullRequest,
  MessageSquare,
  Settings,
  LogOut,
  Home,
  Users,
  LineChart,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// IMPORTANT: Replace this with your actual Firebase Admin User UID
// You can find your UID in the Firebase console under Authentication > Users tab.
const ADMIN_UID = 'YL4kT1aXv5WU8QUhfeY2FhfeJFu2';

const Logo = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path d="M50 0 L100 25 V75 L50 100 L0 75 V25 Z" fill="url(#grad1)" />
        <path d="M35 65 L50 35 L65 65 M42 55 L58 55" stroke="hsl(var(--primary-foreground))" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.uid !== ADMIN_UID) {
        // If not an admin, redirect to the user dashboard
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutGrid },
    { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
    { href: '/admin/requests', label: 'Requests', icon: GitPullRequest },
    { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/analytics', label: 'Analytics', icon: LineChart },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  if (!isClient || loading || !user || user.uid !== ADMIN_UID) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <p>Verifying admin access...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
           <Link href="/admin" className="flex items-center gap-3">
             <Logo />
             <span className="font-bold text-xl group-data-[collapsible=icon]:hidden">Admin Panel</span>
           </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="mt-auto flex flex-col gap-4">
            <div className="flex items-center gap-3 p-2">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Admin'} />
                    <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-semibold">{user.displayName || "Admin"}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto group-data-[collapsible=icon]:hidden text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleLogout}>
                   <LogOut className="h-4 w-4"/>
                </Button>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-40">
            <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold hidden md:block">Admin</h1>
            </div>
            <div className="flex items-center gap-4">
                <ThemeSwitcher />
                <Button variant="outline" asChild>
                    <Link href="/" target="_blank" rel="noopener noreferrer">
                        <Home className="mr-2 h-4 w-4" />
                        View Site
                    </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Admin'} />
                          <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                     <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.displayName}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                     </DropdownMenuLabel>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                     </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/40 overflow-auto">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
