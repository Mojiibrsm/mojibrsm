
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { LanguageSwitcher } from '../language-switcher';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu } from 'lucide-react';
import { ThemeSwitcher } from '../theme-switcher';

export default function Header() {
  const { t } = useLanguage();
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

          <Button asChild className="hidden md:inline-flex rounded-lg">
            <Link href="/#contact">{t.nav.contact}</Link>
          </Button>

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
                    <a href="/#contact" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.contact}</a>
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
