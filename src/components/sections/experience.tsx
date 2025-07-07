'use client';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Experience() {
  const { t } = useLanguage();
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

  return (
    <section id="experience" className="w-full py-16 md:py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold font-headline">{t.experience.title}</h2>
          <div className="mt-4 h-1.5 w-24 bg-primary mx-auto rounded-full"></div>
        </motion.div>
        
        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {t.experience.jobs.map((job, index) => (
            <motion.div key={index} variants={itemVariants} className="h-full">
              <Card className="h-full flex flex-col shadow-lg hover:shadow-primary/20 transition-shadow duration-300 rounded-xl bg-card">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <div className="p-4 bg-primary/10 rounded-lg text-primary">
                            <Briefcase className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-xl font-bold mb-1">{job.role}</CardTitle>
                            <p className="text-primary font-semibold text-lg">{job.company}</p>
                            <p className="text-sm text-muted-foreground mt-1">{job.period}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-2">
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
