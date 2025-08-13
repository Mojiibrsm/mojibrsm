
'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code2, Palette, LineChart, TerminalSquare, Loader2 } from 'lucide-react';
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useContent } from '@/hooks/use-content';

const icons: { [key: string]: React.ElementType } = {
  development: Code2,
  design: Palette,
  marketing: LineChart,
  tools: TerminalSquare,
};

export default function Skills() {
  const { content, isLoading } = useContent();
  const t = content?.skills;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  if (isLoading) {
    return (
        <section id="skills" className="w-full py-16 md:py-24 bg-card flex justify-center items-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin" />
        </section>
    );
  }
  
  if (!t) return null;


  return (
    <section id="skills" className="w-full py-16 md:py-24 bg-card" suppressHydrationWarning>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold font-headline">{t.title}</h2>
          <div className="mt-4 h-1.5 w-24 bg-gradient-to-r from-primary via-accent to-secondary mx-auto rounded-full"></div>
        </motion.div>
        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {Object.entries(t.categories).map(([key, category]) => {
            const Icon = icons[key];
            return (
              <motion.div key={category.title} variants={itemVariants}>
                <Card className="text-center hover:shadow-lg transition-shadow duration-300 h-full">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="mt-4">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap justify-center gap-2">
                      {category.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-sm">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
