'use client';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Download, Briefcase, Send } from 'lucide-react';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section id="home" className="w-full py-24 md:py-32 lg:py-40 bg-card">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <span className="text-primary font-semibold tracking-wide">{t.hero.greeting}</span>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                {t.hero.name}
              </h1>
              <h2 className="text-2xl font-medium text-primary sm:text-3xl font-headline">
                {t.hero.title}
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                {t.hero.tagline}
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <a href="/mojib-rsm-cv.pdf" download>
                  <Download className="mr-2 h-5 w-5" />
                  {t.hero.cv}
                </a>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <a href="#portfolio">
                  <Briefcase className="mr-2 h-5 w-5" />
                  {t.hero.work}
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#contact">
                  <Send className="mr-2 h-5 w-5" />
                  {t.hero.contact}
                </a>
              </Button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-full max-w-md mx-auto aspect-square rounded-full bg-gradient-to-tr from-primary/20 via-primary/50 to-accent/30 p-2">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                 <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 200 200"
                    className="w-4/5 h-4/5 text-primary"
                    fill="currentColor"
                  >
                    <path
                      d="M62.5,-63.9C77.4,-49.9,83.5,-24.9,82.4,-0.8C81.3,23.4,73,46.8,56.6,59.3C40.2,71.8,15.7,73.4,-6.9,71.1C-29.5,68.8,-50.2,62.6,-62,49.8C-73.8,37,-76.8,17.7,-74,0.1C-71.2,-17.4,-62.6,-34.8,-50.1,-48.7C-37.6,-62.6,-21.2,-73,-2.3,-71.8C16.5,-70.6,33.1,-58.9,46.2,-48.9C49.5,-56.4,52.8,-60.9,62.5,-63.9Z"
                      transform="translate(100 100)"
                    ></path>
                 </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
