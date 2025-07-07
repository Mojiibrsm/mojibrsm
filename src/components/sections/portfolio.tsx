'use client';
import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

export default function Portfolio() {
  const { t } = useLanguage();
  const imageHints = ["web app", "ecommerce", "mobile app"];

  return (
    <section id="portfolio" className="w-full py-16 md:py-24">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12 font-headline">{t.portfolio.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.portfolio.projects.map((project, index) => (
            <Card key={project.title} className="overflow-hidden flex flex-col group shadow-md hover:shadow-2xl transition-all duration-300">
              <div className="overflow-hidden">
                <Image
                  src={`https://placehold.co/600x400.png`}
                  alt={project.title}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  data-ai-hint={imageHints[index % imageHints.length]}
                />
              </div>
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{project.description}</CardDescription>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <Badge key={tech} variant="outline">{tech}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <a href={project.link} target="_blank" rel="noopener noreferrer">
                    {project.action} <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
