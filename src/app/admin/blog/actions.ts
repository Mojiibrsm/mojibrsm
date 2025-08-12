
'use server';

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getAwsSettings } from '@/config/settings';

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

const BUCKET_FILE_KEY = 'blog.json';

// Helper function to get the S3 client
async function getS3Client() {
    const awsSettings = await getAwsSettings();
    if (!awsSettings.accessKeyId || !awsSettings.secretAccessKey || !awsSettings.bucketName || !awsSettings.region) {
        throw new Error('AWS S3 is not configured in admin settings.');
    }
    return new S3Client({
        region: awsSettings.region,
        credentials: {
            accessKeyId: awsSettings.accessKeyId,
            secretAccessKey: awsSettings.secretAccessKey,
        },
    });
}


export async function updateBlogPosts(data: BlogUpdatePayload): Promise<{ success: boolean; message: string }> {
  try {
    const s3Client = await getS3Client();
    const awsSettings = await getAwsSettings();
    
    const command = new PutObjectCommand({
      Bucket: awsSettings.bucketName,
      Key: BUCKET_FILE_KEY,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    });

    await s3Client.send(command);

    return { success: true, message: 'Blog posts updated successfully and saved to S3.' };
  } catch (error) {
    console.error('Failed to update blog posts on S3:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to save to S3: ${errorMessage}` };
  }
}

export async function getBlogPosts(): Promise<BlogUpdatePayload> {
    const s3Client = await getS3Client();
    const awsSettings = await getAwsSettings();

    const command = new GetObjectCommand({
        Bucket: awsSettings.bucketName,
        Key: BUCKET_FILE_KEY,
    });

    try {
        const response = await s3Client.send(command);
        const str = await response.Body?.transformToString();
        if (!str) throw new Error("Empty file content from S3");
        return JSON.parse(str) as BlogUpdatePayload;
    } catch (error: any) {
        if (error.name === 'NoSuchKey') {
            console.log("blog.json not found on S3, returning default structure.");
            // If the file doesn't exist, return a default structure.
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
            return defaultContent;
        }
        console.error("Failed to fetch blog posts from S3:", error);
        throw error;
    }
}
