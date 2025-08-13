
'use server';

import { db } from '@/services/firestore';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';

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

interface BlogContent {
  title: string;
  description: string;
  viewAll: string;
  readMore: string;
  posts: Post[];
}

interface BlogUpdatePayload {
  en: BlogContent;
  bn: BlogContent;
}

const DOC_ID = "singleton"; // Using a single document to store all blog content

export async function updateBlogPosts(data: BlogUpdatePayload): Promise<{ success: boolean; message: string }> {
  try {
    const blogRef = doc(db, "content", "blog");
    await setDoc(blogRef, data);
    return { success: true, message: 'Blog posts updated successfully and saved to Firebase.' };
  } catch (error) {
    console.error('Failed to update blog posts on Firebase:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to save to Firebase: ${errorMessage}` };
  }
}

export async function getBlogPosts(): Promise<BlogUpdatePayload> {
    const blogRef = doc(db, "content", "blog");
    const docSnap = await getDocs(query(collection(db, "content"), where('__name__', '==', 'blog')));
    
    if (!docSnap.empty) {
        return docSnap.docs[0].data() as BlogUpdatePayload;
    } else {
        console.log("Blog document not found, returning default structure.");
        // If the document doesn't exist, return a default structure.
        // It will be created on the first update.
        const defaultContent: BlogUpdatePayload = {
            en: {
                title: "From My Blog",
                description: "Here are some of my thoughts on web development, design, and technology.",
                viewAll: "View All Posts",
                readMore: "Read More",
                posts: []
            },
            bn: {
                title: "আমার ব্লগ থেকে",
                description: "ওয়েব ডেভেলপমেন্ট, ডিজাইন এবং প্রযুক্তি সম্পর্কে আমার কিছু চিন্তাভাবনা এখানে দেওয়া হলো।",
                viewAll: "সব পোস্ট দেখুন",
                readMore: "আরও পড়ুন",
                posts: []
            }
        };
        // Optionally create the document here with default content
        // await setDoc(blogRef, defaultContent);
        return defaultContent;
    }
}
