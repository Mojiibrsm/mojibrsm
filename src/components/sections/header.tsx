
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { LanguageSwitcher } from '../language-switcher';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu, LogOut, LayoutDashboard, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { ThemeSwitcher } from '../theme-switcher';
import { Skeleton } from '@/components/ui/skeleton';

export default function Header() {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };
  
  const navLinks = [
    { href: '/#home', label: t.nav.home },
    { href: '/#about', label: t.nav.about },
    { href: '/#services', label: t.nav.services },
    { href: '/#experience', label: t.nav.experience },
    { href: '/#skills', label: t.nav.skills },
    { href: '/#portfolio', label: t.nav.portfolio },
    { href: '/#gallery', label: t.nav.gallery },
    { href: '/#pricing', label: t.nav.pricing },
    { href: '/blog', label: t.nav.blog },
  ];

  const NavItems = ({ isMobile = false }) => (
    <>
      {navLinks.map((link) => (
        <Button key={link.href} variant="link" asChild>
          <Link
            href={link.href}
            className={`font-medium transition-colors hover:text-primary ${isMobile ? 'text-foreground text-lg w-full justify-start py-2' : 'text-muted-foreground text-base'}`}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          >
            {link.label}
          </Link>
        </Button>
      ))}
    </>
  );


  return (
    <header
      id="home"
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60' : 'bg-transparent'
      }`}
    >
      <div className="container flex h-20 items-center">
        <Link href="/#home" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl">Mojib Rsm</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-1 mx-auto">
          <NavItems />
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeSwitcher />
          <LanguageSwitcher />

          {loading ? (
             <Skeleton className="hidden h-10 w-24 rounded-md md:inline-flex" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'}/>
                    <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <p className="font-semibold">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(user.role === 'Admin' ? '/admin' : '/dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Button asChild className="hidden md:inline-flex rounded-lg">
              <Link href="/login">{t.nav.contact}</Link>
            </Button>
          )}

          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-2 p-4">
                  <NavItems isMobile={true}/>
                   {loading ? (
                      <Skeleton className="h-10 w-full mt-4" />
                   ) : (
                    <Button asChild className="w-full justify-start mt-4">
                      <a href={user ? (user.role === 'Admin' ? '/admin' : '/dashboard') : "/login"} onClick={() => setIsMobileMenuOpen(false)}>{user ? "Dashboard" : t.nav.contact}</a>
                    </Button>
                   )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
