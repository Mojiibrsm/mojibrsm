
import { NextResponse } from 'next/server';
import { ref, deleteObject } from 'firebase/storage';
import { storage } from '@/services/firestore';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const fileUrl = data.fileUrl; // We will pass the full file URL

    if (!fileUrl) {
      return NextResponse.json({ success: false, message: 'File URL is required.' }, { status: 400 });
    }

    // Create a reference to the file to delete
    const fileRef = ref(storage, fileUrl);

    // Delete the file
    await deleteObject(fileRef);

    return NextResponse.json({ success: true, message: 'File deleted successfully from Firebase Storage.' });

  } catch (error) {
    console.error('Firebase Storage Deletion failed:', error);
    let errorMessage = 'An unknown error occurred during deletion.';
    if (error instanceof Error) {
        // Check for specific Firebase storage errors
        if ('code' in error) {
            const firebaseError = error as { code: string; message: string };
            if (firebaseError.code === 'storage/object-not-found') {
                return NextResponse.json({ success: false, message: 'File not found in storage.' }, { status: 404 });
            }
        }
        errorMessage = error.message;
    }
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
