
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// --- IMPORTANT ---
// For this to work, you must create a .env.local file in the root of your project
// and add your AWS credentials and S3 bucket details like this:
//
// AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
// AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
// AWS_S3_BUCKET_NAME=your-s3-bucket-name
// AWS_S3_REGION=your-s3-bucket-region 
// e.g., AWS_S3_REGION=eu-north-1

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: Request) {
  if (!process.env.AWS_S3_BUCKET_NAME || !process.env.AWS_S3_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return NextResponse.json({ success: false, message: 'AWS S3 is not configured. Please set environment variables.' }, { status: 500 });
  }

  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file found.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read', // Make the file publicly accessible
    });

    await s3Client.send(command);

    // Construct the public URL (virtual-hosted-style)
    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${filename}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('S3 Upload failed:', error);
    return NextResponse.json({ success: false, message: 'File upload to S3 failed.' }, { status: 500 });
  }
}
