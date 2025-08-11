'use client';
import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function Gallery() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <section id="gallery" className="w-full py-16 md:py-24 bg-card" suppressHydrationWarning>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold font-headline">{t.gallery.title}</h2>
          <div className="mt-4 h-1.5 w-24 bg-gradient-to-r from-primary via-accent to-secondary mx-auto rounded-full"></div>
          <p className="max-w-2xl mx-auto text-muted-foreground mt-4">{t.gallery.description}</p>
        </motion.div>
        <motion.div
          ref={ref}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {t.gallery.images.map((image, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <motion.div variants={itemVariants} className="group relative cursor-pointer">
                    <Card className="overflow-hidden rounded-lg shadow-lg">
                        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                             <Image
                                src={image.src}
                                alt={image.alt}
                                width={400}
                                height={400}
                                className="w-full h-auto object-cover aspect-square"
                                data-ai-hint={image.imageHint}
                            />
                        </motion.div>
                    </Card>
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 rounded-lg">
                        <p className="text-white text-center text-sm font-semibold">{image.alt}</p>
                    </div>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl p-2">
                 <DialogHeader className="sr-only">
                    <DialogTitle>{image.alt}</DialogTitle>
                 </DialogHeader>
                 <Image
                    src={image.src}
                    alt={image.alt}
                    width={1200}
                    height={800}
                    className="w-full h-auto object-contain rounded-md"
                    data-ai-hint={image.imageHint}
                />
              </DialogContent>
            </Dialog>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
