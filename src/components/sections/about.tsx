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
    <section id="about" className="w-full py-16 md:py-24">
      <motion.div
        ref={ref}
        className="container"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div variants={itemVariants} className="relative group w-full max-w-md mx-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
             <Image
              src="https://storage.googleapis.com/aip-dev-img-repo/6a297298-0c64-4e42-a982-f79a9f24e4c2.png"
              alt="Mojib Rsm"
              width={600}
              height={600}
              className="relative rounded-lg shadow-lg w-full"
            />
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-4xl font-bold text-foreground font-headline leading-tight">{t.about.title}</h2>
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
