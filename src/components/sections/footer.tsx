
'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useContent } from '@/hooks/use-content';
import { Loader2 } from 'lucide-react';

export default function Footer() {
  const { content, isLoading } = useContent();
  const t = content?.footer;
  const site = content?.site;

  if (isLoading) {
    return <footer className="w-full bg-card border-t h-24 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></footer>
  }

  if (!t || !site) return null;

  return (
    <footer className="w-full bg-card border-t" suppressHydrationWarning>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {site.publicLogo ? (
              <Image
                src={site.publicLogo}
                alt={site.title}
                width={140}
                height={35}
                className="h-8 w-auto object-contain"
                priority
                unoptimized
              />
            ) : (
              <span className="font-bold text-lg">{site.title}</span>
            )}
            <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-center">
               <Button variant="link" asChild>
                  <Link href="#home" className="text-muted-foreground hover:text-primary">{t.nav.home}</Link>
              </Button>
              <Button variant="link" asChild>
                  <Link href="#about" className="text-muted-foreground hover:text-primary">{t.nav.about}</Link>
              </Button>
              <Button variant="link" asChild>
                  <Link href="#portfolio" className="text-muted-foreground hover:text-primary">{t.nav.portfolio}</Link>
              </Button>
               <Button variant="link" asChild>
                  <Link href="#gallery" className="text-muted-foreground hover:text-primary">{t.nav.gallery}</Link>
              </Button>
               <Button variant="link" asChild>
                  <Link href="/blog" className="text-muted-foreground hover:text-primary">{t.nav.blog}</Link>
              </Button>
              <Button variant="link" asChild>
                  <Link href="#contact" className="text-muted-foreground hover:text-primary">{t.nav.contact}</Link>
              </Button>
            </div>
        </div>
        <div className="text-center text-sm text-muted-foreground mt-6 pt-6 border-t">
          {t.copyright}
        </div>
      </div>
    </footer>
  );
}
