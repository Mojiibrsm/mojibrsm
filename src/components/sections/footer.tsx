'use client';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-card border-t">
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="font-bold text-lg">Mojib Rsm</span>
            <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-center">
               <Button variant="link" asChild>
                  <Link href="#home" className="text-muted-foreground hover:text-primary">{t.footer.nav.home}</Link>
              </Button>
              <Button variant="link" asChild>
                  <Link href="#about" className="text-muted-foreground hover:text-primary">{t.footer.nav.about}</Link>
              </Button>
               <Button variant="link" asChild>
                  <Link href="/blog" className="text-muted-foreground hover:text-primary">{t.footer.nav.blog}</Link>
              </Button>
              <Button variant="link" asChild>
                  <Link href="#portfolio" className="text-muted-foreground hover:text-primary">{t.footer.nav.portfolio}</Link>
              </Button>
              <Button variant="link" asChild>
                  <Link href="#contact" className="text-muted-foreground hover:text-primary">{t.footer.nav.contact}</Link>
              </Button>
            </div>
        </div>
        <div className="text-center text-sm text-muted-foreground mt-6 pt-6 border-t">
          {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
