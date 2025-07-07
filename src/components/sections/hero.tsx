'use client';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="w-full py-24 md:py-32 lg:py-40">
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                {t.hero.greeting} <span className="text-primary">{t.hero.name}</span>
              </h1>
              <h2 className="text-2xl font-semibold text-foreground/90 sm:text-3xl font-headline">
                {t.hero.title}
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                {t.hero.tagline}
              </p>
            </div>
            <div className="flex flex-col gap-3 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <a href="#">
                  {t.hero.buttons.cv}
                </a>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <a href="#portfolio">
                  {t.hero.buttons.work}
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#contact">
                  {t.hero.buttons.contact}
                </a>
              </Button>
            </div>
          </div>
          <div className="relative flex justify-center items-center">
            <div className="absolute w-full h-full max-w-xs bg-primary/20 rounded-full blur-3xl"></div>
            <Image
              src="https://placehold.co/600x600.png"
              alt="Mojib Rsm"
              width={600}
              height={600}
              className="relative mx-auto rounded-full object-cover aspect-square w-full max-w-sm"
              data-ai-hint="man developer portrait"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
