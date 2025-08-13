
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firestore';
import { translations } from '@/lib/translations';

// This file is now primarily for seeding initial data if needed,
// but the main logic is handled directly by fetching/updating documents.

export async function getSectionContent(section: string): Promise<{ en: any; bn: any }> {
  const docRef = doc(db, "content", section);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as { en: any; bn: any };
  } else {
    // Fallback to local translations if document doesn't exist in Firestore
    const localData = translations.en[section as keyof typeof translations.en];
    const localDataBn = translations.bn[section as keyof typeof translations.bn];
    if (localData && localDataBn) {
        return { en: localData, bn: localDataBn };
    }
    return { en: {}, bn: {} };
  }
}

export async function updateSectionContent(
    section: string, 
    enData: object,
    bnData: object
): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = doc(db, "content", section);
    await setDoc(docRef, { en: enData, bn: bnData });
    return { success: true, message: `Content for '${section}' updated successfully in Firestore.` };
  } catch (error) {
    console.error(`Failed to write content for section '${section}':`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to update content in Firestore: ${errorMessage}` };
  }
}
