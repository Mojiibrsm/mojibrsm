'use client';
import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { getBlogPosts } from '@/app/admin/blog/actions';

type Post = {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    imageHint: string;
    date: string;
    tags: string[];
    metaTitle: string;
    metaDescription: string;
};

interface BlogContent {
  title: string;
  description: string;
  viewAll: string;
  readMore: string;
  posts: Post[];
}

export default function Blog() {
  const { language } = useLanguage();
  const [blogContent, setBlogContent] = useState<BlogContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  useEffect(() => {
    const fetchPosts = async () => {
        try {
            setIsLoading(true);
            const data = await getBlogPosts();
            setBlogContent(data[language]);
        } catch (error) {
            console.error("Failed to fetch blog posts:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchPosts();
  }, [language]);


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  if (isLoading || !blogContent || blogContent.posts.length === 0) {
    return null; // Don't render the section if there are no posts or data
  }

  const blogPosts = blogContent.posts.slice(0, 3);

  return (
    <section id="blog" className="w-full py-16 md:py-24 bg-card" suppressHydrationWarning>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12">
          <h2 className="text-4xl font-bold font-headline">{blogContent.title}</h2>
          <div className="mt-4 h-1.5 w-24 bg-gradient-to-r from-primary via-accent to-secondary mx-auto rounded-full"></div>
        </motion.div>
        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {blogPosts.map((post) => (
            <motion.div key={post.slug} variants={itemVariants} className="relative group h-full">
              <Link href={`/blog/${post.slug}`} className="block h-full">
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
                        unoptimized
                      />
                    </motion.div>
                  </div>
                  <div className='relative bg-card rounded-b-2xl flex flex-col flex-grow p-6'>
                    <p className="text-sm text-muted-foreground mb-2">{post.date}</p>
                    <CardTitle className="mb-2 text-xl flex-grow">{post.title}</CardTitle>
                    <div className="mt-auto pt-4">
                      <Button asChild className="w-full">
                        <span>{blogContent.readMore}</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
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
            <Link href="/blog">{blogContent.viewAll}</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
