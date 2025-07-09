'use client';

import { translations } from '@/lib/translations';
import { useLanguage } from '@/contexts/language-context';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type Post = (typeof translations.en.blog.posts)[0];

export default function BlogPostContent({ slug }: { slug: string }) {
    const { language } = useLanguage();
    const [post, setPost] = useState<Post | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const currentPost = translations[language].blog.posts.find((p) => p.slug === slug);
        // Fallback to English if not found in current language, as the server component
        // has already verified that the slug exists in at least one language.
        const fallbackPost = translations.en.blog.posts.find((p) => p.slug === slug);
        const finalPost = currentPost || fallbackPost;
        
        setPost(finalPost);
        setIsLoading(false);
    }, [slug, language]);

    if (isLoading || !post) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <p>Loading post...</p>
            </div>
        );
    }
    
    return (
        <article className="container py-12 md:py-20">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 text-center">
                    <p className="text-sm text-muted-foreground mb-2">{post.date}</p>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">{post.title}</h1>
                    <div className="flex justify-center flex-wrap gap-2">
                        {post.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                </header>

                <Image
                    src={post.image}
                    alt={post.title}
                    width={1200}
                    height={600}
                    className="w-full h-auto object-cover rounded-2xl shadow-lg mb-8"
                    data-ai-hint={post.imageHint}
                    priority
                />

                <div className="prose prose-lg dark:prose-invert max-w-full mx-auto"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </div>
        </article>
    );
}
