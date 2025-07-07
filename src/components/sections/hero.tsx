'use client';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Award, Code, Droplet, Rss } from 'lucide-react';

export default function Hero() {
  const { t } = useLanguage();

  const brands = [
    { name: "Brand 1", icon: <Code className="h-6 w-6" /> },
    { name: "Brand 2", icon: <Award className="h-6 w-6" /> },
    { name: "Brand 3", icon: <Droplet className="h-6 w-6" /> },
    { name: "Brand 4", icon: <Rss className="h-6 w-6" /> },
  ]

  return (
    <section id="home" className="w-full pt-16 md:pt-24 lg:pt-32">
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none font-headline">
                {t.hero.greeting} <span className="text-primary">{t.hero.name}</span>
              </h1>
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl font-headline">
                {t.hero.title}
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                {t.hero.tagline}
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <a href="#contact">
                  {t.hero.hire}
                </a>
              </Button>
            </div>
          </div>
          <div className="relative">
            <Image
              src="https://placehold.co/600x700.png"
              alt="Brunao Dev"
              width={600}
              height={700}
              className="mx-auto aspect-[6/7] overflow-hidden rounded-xl object-cover"
              data-ai-hint="man developer"
            />
            <div className="absolute top-1/4 -left-12 bg-card/80 backdrop-blur-sm p-4 rounded-lg shadow-lg flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                    <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                    <p className="font-bold">{t.hero.awards}</p>
                </div>
            </div>
            <div className="absolute bottom-1/4 -right-12 bg-card/80 backdrop-blur-sm p-4 rounded-lg shadow-lg flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                    <span className="text-2xl">🎉</span>
                </div>
                <div>
                    <p className="font-bold">{t.hero.uiUx}</p>
                    <p className="text-sm text-muted-foreground">{t.hero.uiUxDesc}</p>
                </div>
            </div>
          </div>
        </div>
        <div className="mt-16 md:mt-24">
            <h3 className="text-center text-lg font-semibold text-muted-foreground mb-6">{t.hero.brandsTitle}</h3>
            <div className="flex flex-wrap justify-center items-center gap-x-8 md:gap-x-12 gap-y-4">
                {brands.map((brand, index) => (
                    <div key={index} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        {brand.icon}
                        <span className="font-semibold text-lg">{brand.name}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
}
