'use client';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, PenTool, Rocket, ChevronDown } from 'lucide-react';
import Image from 'next/image';

const icons = [Code, PenTool, Rocket];

export default function Services() {
  const { t } = useLanguage();

  return (
    <section id="services" className="w-full py-16 md:py-24">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <div className="space-y-6">
                {t.services.items.map((service, index) => {
                  const Icon = icons[index % icons.length];
                  return (
                    <Card key={service.title} className="flex items-center p-4 gap-4 shadow-sm hover:shadow-lg transition-shadow rounded-2xl bg-gradient-to-r from-card to-accent/50">
                        <div className="p-3 bg-card rounded-full shadow">
                            <Icon className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{service.title}</h3>
                            <p className="text-muted-foreground">{service.description}</p>
                        </div>
                    </Card>
                  );
                })}
            </div>
            <div className="text-center mt-6">
                <Button variant="outline" size="lg" className="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <ChevronDown className="mr-2 h-5 w-5"/>
                    More
                </Button>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold font-headline leading-tight">{t.services.title}</h2>
            <p className="text-muted-foreground">{t.services.description1}</p>
            <p className="text-muted-foreground">{t.services.description2}</p>
            <Button size="lg" asChild>
                <a href="#contact">{t.services.hire}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
