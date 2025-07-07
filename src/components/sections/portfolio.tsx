'use client';
import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Portfolio() {
  const { t } = useLanguage();

  return (
    <section id="portfolio" className="w-full py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-headline">{t.portfolio.title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.portfolio.projects.map((project, index) => (
            <Card key={project.title} className="overflow-hidden group shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl flex flex-col bg-card">
              <div className="relative">
                <Image
                  src={project.image}
                  alt={project.title}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  data-ai-hint={project.imageHint}
                />
              </div>
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground">{t.portfolio.techUsed}</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <Badge key={tech} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-auto">
                    <Button asChild className="w-full">
                        <a href={project.link} target="_blank" rel="noopener noreferrer">
                            {t.portfolio.viewButton}
                        </a>
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
