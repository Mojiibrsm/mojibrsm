'use client';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Laptop, PenTool, LineChart, Smartphone, Wrench, ArrowRight } from 'lucide-react';

const icons = [Laptop, PenTool, LineChart, Smartphone, Wrench];

export default function Services() {
  const { t } = useLanguage();

  return (
    <section id="services" className="w-full py-16 md:py-24 bg-card">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12 font-headline">{t.services.title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.services.items.map((service, index) => {
            const Icon = icons[index % icons.length];
            return (
              <Card key={service.title} className="flex flex-col text-center hover:border-primary transition-colors duration-300 shadow-sm hover:shadow-xl">
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="pt-4">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{service.description}</CardDescription>
                </CardContent>
                <CardFooter className="justify-center">
                  <Button variant="ghost" className="text-primary hover:text-primary">
                    {service.action}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
