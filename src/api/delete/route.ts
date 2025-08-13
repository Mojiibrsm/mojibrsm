
import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const fileId = data.fileId; 

    if (!fileId) {
      return NextResponse.json({ success: false, message: 'File ID is required.' }, { status: 400 });
    }

     if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
        return NextResponse.json({ success: false, message: 'ImageKit is not configured. Please check environment variables.' }, { status: 500 });
    }

    // Delete the file from ImageKit
    await imagekit.deleteFile(fileId);

    return NextResponse.json({ success: true, message: 'File deleted successfully from ImageKit.' });

  } catch (error) {
    console.error('ImageKit Deletion failed:', error);
    let errorMessage = 'An unknown error occurred during deletion.';
     if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
