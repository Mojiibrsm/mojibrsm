
import { NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getAwsSettings } from '@/config/settings';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const fileKey = data.fileKey;

    if (!fileKey) {
      return NextResponse.json({ success: false, message: 'File key is required.' }, { status: 400 });
    }

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

    const command = new DeleteObjectCommand({
      Bucket: awsSettings.bucketName,
      Key: fileKey,
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true, message: 'File deleted successfully from S3.' });

  } catch (error) {
    console.error('S3 Deletion failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during deletion.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

    