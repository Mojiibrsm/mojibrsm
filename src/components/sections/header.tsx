'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { LanguageSwitcher } from '../language-switcher';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


export default function Header() {
  const { t } = useLanguage();
  const { user } = useAuth();
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
  
  const navLinks = [
    { href: '/#home', label: t.nav.home },
    { href: '/#about', label: t.nav.about },
    { href: '/#services', label: t.nav.services },
    { href: '/#experience', label: t.nav.experience },
    { href: '/#skills', label: t.nav.skills },
    { href: '/#portfolio', label: t.nav.portfolio },
    { href: '/#pricing', label: t.nav.pricing },
    { href: '/blog', label: t.nav.blog },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

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
          <LanguageSwitcher />
          <Button asChild className="hidden md:inline-flex rounded-lg">
            <a href="#contact">{t.nav.contact}</a>
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-9 w-9">
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
                 <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                 </DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                 </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="icon" asChild>
              <Link href="/login">
                  <User className="h-5 w-5" />
                  <span className="sr-only">{t.login.title}</span>
              </Link>
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
                   <Button asChild className="w-full justify-start mt-4">
                    <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.contact}</a>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
