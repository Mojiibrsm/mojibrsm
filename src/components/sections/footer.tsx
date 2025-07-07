'use client';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full">
      <div className="bg-background">
        <div className="container py-16 md:py-24 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 font-headline">{t.footer.ctaTitle}</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                {t.footer.ctaSubtitle}
            </p>
            <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-base font-bold">
                {t.footer.ctaButton}
            </Button>
        </div>
      </div>
      <div className="bg-card border-t">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="font-bold text-lg">Mrstudio</span>
              <div className="flex items-center gap-4">
                 <Button variant="link" asChild>
                    <Link href="#home" className="text-muted-foreground hover:text-primary">{t.footer.nav.home}</Link>
                </Button>
                <Button variant="link" asChild>
                    <Link href="#about" className="text-muted-foreground hover:text-primary">{t.footer.nav.about}</Link>
                </Button>
                <Button variant="link" asChild>
                    <Link href="#services" className="text-muted-foreground hover:text-primary">{t.footer.nav.services}</Link>
                </Button>
              </div>
          </div>
          <div className="text-center text-sm text-muted-foreground mt-6 pt-6 border-t">
            {t.footer.copyright}
          </div>
        </div>
      </div>
    </footer>
  );
}
