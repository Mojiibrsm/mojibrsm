'use client';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useContent } from '@/hooks/use-content';
import { useLanguage } from '@/contexts/language-context';
import { Loader2 } from 'lucide-react';

export default function Portfolio() {
  const { allContent, isLoading } = useContent();
  const { language } = useLanguage();
  const t = allContent[language]?.portfolio;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };
  
  if (isLoading) {
    return (
        <section id="portfolio" className="w-full py-16 md:py-24 bg-card flex justify-center items-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin" />
        </section>
    );
  }
  
  if (!t) return null;

  return (
    <section id="portfolio" className="w-full py-16 md:py-24 bg-card" suppressHydrationWarning>
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12">
            <h2 className="text-4xl font-bold font-headline">{t.title}</h2>
            <div className="mt-4 h-1.5 w-24 bg-gradient-to-r from-primary via-accent to-secondary mx-auto rounded-full"></div>
        </motion.div>
        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {t.projects.map((project, index) => (
            <motion.div key={project.title} variants={itemVariants} className="relative group h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-secondary rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
              <Card className="relative overflow-hidden shadow-md transition-all duration-300 rounded-2xl flex flex-col bg-card h-full">
                <div className="relative overflow-hidden rounded-t-2xl">
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                    <Image
                      src={project.image}
                      alt={project.title}
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover"
                      data-ai-hint={project.imageHint}
                    />
                  </motion.div>
                </div>
                <div className='relative bg-card rounded-b-2xl flex flex-col flex-grow'>
                    <CardHeader>
                      <CardTitle>{project.title}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">{t.techUsed}</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.tech.map((tech) => (
                            <Badge key={tech} variant="secondary">{tech}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="mt-auto">
                          <Button asChild className="w-full">
                              <a href={project.link} target="_blank" rel="noopener noreferrer">
                                  {t.viewButton}
                              </a>
                          </Button>
                      </div>
                    </CardContent>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
