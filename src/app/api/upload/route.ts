
import { NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/services/firestore';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file found.' }, { status: 400 });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a storage reference
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const storageRef = ref(storage, `uploads/${filename}`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, buffer, {
      contentType: file.type,
    });
    
    // Get the download URL
    const publicUrl = await getDownloadURL(snapshot.ref);

    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error) {
    console.error('Upload failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during upload.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
