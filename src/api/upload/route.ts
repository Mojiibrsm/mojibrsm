
import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
});

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file found.' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
        return NextResponse.json({ success: false, message: 'ImageKit is not configured. Please check environment variables.' }, { status: 500 });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const response = await imagekit.upload({
        file: buffer,
        fileName: file.name,
        useUniqueFileName: true,
        folder: "/portfolio-uploads/",
    });

    return NextResponse.json({ success: true, url: response.url, fileId: response.fileId });

  } catch (error) {
    console.error('Upload failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during upload.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
