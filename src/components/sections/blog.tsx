'use client';
import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

export default function Blog() {
  const { t } = useLanguage();
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

  // Show only the first 3 posts on the homepage
  const blogPosts = t.blog.posts.slice(0, 3);

  return (
    <section id="blog" className="w-full py-16 md:py-24 bg-background">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12">
            <h2 className="text-4xl font-bold font-headline">{t.blog.title}</h2>
        </motion.div>
        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {blogPosts.map((post) => (
            <motion.div key={post.title} variants={itemVariants} className="relative group h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-secondary rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
              <Card className="relative overflow-hidden shadow-md transition-all duration-300 rounded-2xl flex flex-col bg-card h-full">
                <div className="relative overflow-hidden rounded-t-2xl">
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover"
                      data-ai-hint={post.imageHint}
                    />
                  </motion.div>
                </div>
                <div className='relative bg-card rounded-b-2xl flex flex-col flex-grow p-6'>
                    <p className="text-sm text-muted-foreground mb-2">{post.date}</p>
                    <CardTitle className="mb-2 text-xl flex-grow">{post.title}</CardTitle>
                    <div className="mt-auto pt-4">
                        <Button asChild className="w-full">
                            <Link href={post.link}>
                                {t.blog.readMore}
                            </Link>
                        </Button>
                    </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.5 }}
        >
            <Button size="lg" variant="outline" asChild>
                <Link href="/blog">{t.blog.viewAll}</Link>
            </Button>
        </motion.div>
      </div>
    </section>
  );
}
