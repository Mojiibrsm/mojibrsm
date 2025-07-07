'use client';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, PenTool, LineChart, Server, Smartphone } from 'lucide-react';
import React from 'react';

const iconComponents: { [key: string]: React.ElementType } = {
  web: Code,
  uiux: PenTool,
  marketing: LineChart,
  android: Smartphone,
  maintenance: Server,
};


export default function Services() {
  const { t } = useLanguage();

  return (
    <section id="services" className="w-full py-16 md:py-24 bg-card">
      <div className="container">
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-headline">{t.services.title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.services.items.map((service, index) => {
              const Icon = iconComponents[service.icon] || Code;
              return (
                <Card key={index} className="text-center p-6 flex flex-col items-center shadow-lg hover:shadow-primary/20 hover:-translate-y-2 transition-all duration-300">
                  <CardHeader className="p-0">
                    <div className="p-4 bg-primary/10 rounded-full mb-4 inline-block">
                      <Icon className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle>{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow p-0 mt-4">
                    <CardDescription>{service.description}</CardDescription>
                  </CardContent>
                  <div className="mt-6 w-full">
                     <Button asChild>
                        <a href="#contact">{t.services.button}</a>
                    </Button>
                  </div>
                </Card>
              );
            })}
        </div>
      </div>
    </section>
  );
}
