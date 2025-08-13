
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Loader2 } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useContent } from '@/hooks/use-content';

export default function Experience() {
  const { content, isLoading } = useContent();
  const t = content?.experience;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };
  
  if (isLoading) {
    return (
        <section id="experience" className="w-full py-16 md:py-24 bg-card flex justify-center items-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin" />
        </section>
    );
  }
  
  if (!t) return null;

  return (
    <section id="experience" className="w-full py-16 md:py-24 bg-card" suppressHydrationWarning>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold font-headline">{t.title}</h2>
          <div className="mt-4 h-1.5 w-24 bg-gradient-to-r from-primary via-accent to-secondary mx-auto rounded-full"></div>
        </motion.div>
        
        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {t.jobs.map((job, index) => (
            <motion.div key={index} variants={itemVariants} className="relative group h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-secondary rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
              <Card className="relative w-full p-6 rounded-2xl shadow-lg transition-all duration-300 h-full bg-card">
                  <CardHeader className="p-0">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Briefcase className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-xl font-bold text-foreground">{job.role}</CardTitle>
                            <p className="text-md font-semibold text-primary">{job.company}</p>
                            <p className="text-xs text-muted-foreground mt-1 font-mono">{job.period}</p>
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 mt-4">
                    <ul className="space-y-2 text-muted-foreground list-disc list-inside pl-2">
                        {job.responsibilities.map((resp, i) => (
                            <li key={i}>{resp}</li>
                        ))}
                    </ul>
                  </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
