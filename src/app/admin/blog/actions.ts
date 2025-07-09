
'use server';

import { promises as fs } from 'fs';
import path from 'path';

// Define the type for a single blog post based on the existing structure
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

interface BlogUpdatePayload {
  en: Post[];
  bn: Post[];
}

async function writeBlogFile(lang: 'en' | 'bn', posts: Post[]): Promise<void> {
    const data = {
        title: lang === 'en' ? "From My Blog" : "আমার ব্লগ থেকে",
        description: lang === 'en' ? "Here are some of my thoughts on web development, design, and technology." : "ওয়েব ডেভেলপমেন্ট, ডিজাইন এবং প্রযুক্তি সম্পর্কে আমার কিছু চিন্তাভাবনা এখানে দেওয়া হলো।",
        viewAll: lang === 'en' ? "View All Posts" : "সব পোস্ট দেখুন",
        readMore: lang === 'en' ? "Read More" : "আরও পড়ুন",
        posts: posts
    };
    const filePath = path.join(process.cwd(), 'src', 'lib', 'translations', lang, 'blog.ts');
    const newFileContent = `export const blog = ${JSON.stringify(data, null, 2)};`;
    await fs.writeFile(filePath, newFileContent, 'utf-8');
}


export async function updateBlogPosts(data: BlogUpdatePayload) {
  try {
    await Promise.all([
        writeBlogFile('en', data.en),
        writeBlogFile('bn', data.bn),
    ]);
    return { success: true, message: 'Blog posts updated successfully! Changes will be live after a page refresh.' };
  } catch (error) {
    console.error('Failed to write blog posts:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to update blog posts on the server: ${errorMessage}` };
  }
}
