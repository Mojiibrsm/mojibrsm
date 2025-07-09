'use client';
import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function About() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        ease: 'easeOut'
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="about" className="w-full py-16 md:py-24 bg-card" suppressHydrationWarning>
      <motion.div
        ref={ref}
        className="container"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div variants={itemVariants} className="relative group w-full max-w-md mx-auto">
             <div className="absolute -inset-1.5 bg-gradient-to-r from-primary via-accent to-secondary rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
             <div className="relative rounded-lg shadow-lg overflow-hidden">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                 <Image
                  src={t.about.image}
                  alt={t.hero.name}
                  width={600}
                  height={600}
                  className="w-full h-auto"
                  data-ai-hint={t.about.imageHint}
                />
                </motion.div>
             </div>
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-6">
             <div className="space-y-4">
                <h2 className="text-4xl font-bold text-foreground font-headline leading-tight">{t.about.title}</h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-primary via-accent to-secondary rounded-full"></div>
            </div>
            <p className="text-muted-foreground">{t.about.bio}</p>
            <p className="text-muted-foreground">{t.about.mission}</p>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{t.about.educationTitle}</h3>
              <p className="text-muted-foreground">{t.about.education}</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
