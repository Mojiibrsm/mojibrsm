
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getAwsSettings } from '@/config/settings';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const destination = data.get('destination') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file found.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    if (destination === 's3') {
      // --- S3 Upload Logic ---
      const awsSettings = await getAwsSettings();
      if (!awsSettings.accessKeyId || !awsSettings.secretAccessKey || !awsSettings.bucketName || !awsSettings.region) {
        return NextResponse.json({ success: false, message: 'AWS S3 is not configured in admin settings.' }, { status: 500 });
      }
      
      const s3Client = new S3Client({
        region: awsSettings.region,
        credentials: {
          accessKeyId: awsSettings.accessKeyId,
          secretAccessKey: awsSettings.secretAccessKey,
        },
      });

      const command = new PutObjectCommand({
        Bucket: awsSettings.bucketName,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
      });

      await s3Client.send(command);

      const publicUrl = `https://${awsSettings.bucketName}.s3.${awsSettings.region}.amazonaws.com/${filename}`;
      return NextResponse.json({ success: true, url: publicUrl });
    } else {
      // --- Local Upload Logic ---
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      const filePath = path.join(uploadDir, filename);

      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e: any) {
        if (e.code !== 'EEXIST') throw e;
      }

      await writeFile(filePath, buffer);
      const publicUrl = `/uploads/${filename}`;
      return NextResponse.json({ success: true, url: publicUrl });
    }
  } catch (error) {
    console.error('Upload failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during upload.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
