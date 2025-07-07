
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
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
  LayoutDashboard,
  User,
  FolderKanban,
  GitPullRequest,
  MessageSquare,
  Settings,
  LogOut,
  Github,
  Home,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>WhatsApp</title>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c0-5.45 4.434-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 0 5.495 0 12.05c0 2.16.56 4.208 1.588 6.024L0 24l6.176-1.648a11.819 11.819 0 005.868 1.49c6.554 0 11.85-5.338 11.85-11.85 0-3.187-1.24-6.202-3.483-8.452z" />
    </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Facebook</title>
      <path d="M22.675 0h-21.35C.59 0 0 .59 0 1.325v21.35C0 23.41.59 24 1.325 24H12.82v-9.29H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.735 0 1.325-.59 1.325-1.325V1.325C24 .59 23.41 0 22.675 0z" />
    </svg>
);

const Logo = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path d="M50 0 L100 25 V75 L50 100 L0 75 V25 Z" fill="url(#grad1)" />
        <text x="50" y="62" fontSize="40" fill="hsl(var(--primary-foreground))" textAnchor="middle" dy=".3em" fontFamily="sans-serif" fontWeight="bold">M</text>
    </svg>
)

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/profile', label: 'My Profile', icon: User },
    { href: '/dashboard/projects', label: 'My Projects', icon: FolderKanban },
    { href: '/dashboard/requests', label: 'My Requests', icon: GitPullRequest },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
           <Link href="/dashboard" className="flex items-center gap-3">
             <Logo />
             <span className="font-bold text-xl group-data-[collapsible=icon]:hidden">Mojib Rsm</span>
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
            <div className="group-data-[collapsible=icon]:hidden px-2">
                <Separator className="mb-4 bg-sidebar-border" />
                <p className="text-xs font-medium text-muted-foreground mb-2">Contact Owner</p>
                <div className="flex items-center justify-start gap-2">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"><a href="https://wa.me/8801601519007" target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="h-5 w-5 fill-current"/></a></Button>
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"><a href="https://facebook.com/mojibrsm" target="_blank" rel="noopener noreferrer"><FacebookIcon className="h-5 w-5 fill-current"/></a></Button>
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"><a href="https://github.com/mojibrsm" target="_blank" rel="noopener noreferrer"><Github className="h-5 w-5"/></a></Button>
                </div>
            </div>

            <Separator className="bg-sidebar-border"/>
            
            <div className="flex items-center gap-3 p-2">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-semibold">{user.displayName || "User"}</span>
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
                <h1 className="text-lg font-semibold hidden md:block">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
                <ThemeSwitcher />
                <Button variant="outline" asChild>
                    <Link href="/" target="_blank" rel="noopener noreferrer">
                        <Home className="mr-2 h-4 w-4" />
                        View Site
                    </Link>
                </Button>
                {user && (
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
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
                         <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                            <User className="mr-2 h-4 w-4" />
                            <span>My Profile</span>
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
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
                )}
            </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/40 overflow-auto relative">
            {children}
            <Button
                asChild
                className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
                size="icon"
            >
                <a href="https://wa.me/8801601519007" target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="h-6 w-6" />
                    <span className="sr-only">Chat with us</span>
                </a>
            </Button>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
