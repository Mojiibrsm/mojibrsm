
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { translations } from '@/lib/translations';

// Define the type for a single blog post based on the existing structure
type Post = (typeof translations.en.blog.posts)[0];

interface BlogUpdatePayload {
  en: Post[];
  bn: Post[];
}

export async function updateBlogPosts(data: BlogUpdatePayload) {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'translations.ts');
  
  try {
    // Deep copy to avoid mutating the original object in memory
    const updatedTranslations = JSON.parse(JSON.stringify(translations));

    // Update the blog posts for both languages
    updatedTranslations.en.blog.posts = data.en;
    updatedTranslations.bn.blog.posts = data.bn;

    const newFileContent = `export const translations = ${JSON.stringify(updatedTranslations, null, 2)};\n\nexport type Translations = typeof translations;`;

    await fs.writeFile(filePath, newFileContent, 'utf-8');
    return { success: true, message: 'Blog posts updated successfully! Changes will be live after a page refresh.' };
  } catch (error) {
    console.error('Failed to write blog posts to translations.ts:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to update blog posts on the server: ${errorMessage}` };
  }
}
