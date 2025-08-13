
'use server';

import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/services/firestore';
import { translations } from '@/lib/translations';

// --- SITE SETTINGS ---
export type SiteSettings = typeof translations.en.site;

export async function getSiteSettingsAction(): Promise<SiteSettings> {
    const docRef = doc(db, "content", "site");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().en) {
        return docSnap.data().en as SiteSettings;
    }
    return translations.en.site; // Fallback to local
}

export async function updateSiteSettingsAction(newEnSettings: SiteSettings, newBnSettings: SiteSettings): Promise<{ success: boolean; message: string }> {
    try {
        const docRef = doc(db, "content", "site");
        await setDoc(docRef, { en: newEnSettings, bn: newBnSettings }, { merge: true });
        return { success: true, message: 'Settings updated successfully in Firebase.' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to update settings: ${errorMessage}` };
    }
}


// --- CONTACT SETTINGS ---
export type ContactSettings = typeof translations.en.contact;

export async function getContactSettingsAction(): Promise<ContactSettings> {
    const docRef = doc(db, "content", "contact");
    const docSnap = await getDoc(docRef);
     if (docSnap.exists() && docSnap.data().en) {
        return docSnap.data().en as ContactSettings;
    }
    return translations.en.contact; // Fallback to local
}

export async function updateContactSettingsAction(newEnData: ContactSettings, newBnData: ContactSettings): Promise<{ success: boolean; message: string }> {
     try {
        const docRef = doc(db, "content", "contact");
        await setDoc(docRef, { en: newEnData, bn: newBnData }, { merge: true });
        return { success: true, message: 'Contact settings updated successfully in Firebase.' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to update settings: ${errorMessage}` };
    }
}


// --- DATABASE SEEDING ---
export async function seedDatabaseAction(): Promise<{ success: boolean; message: string }> {
    try {
        const batch = writeBatch(db);
        const sections = Object.keys(translations.en) as Array<keyof typeof translations.en>;

        for (const section of sections) {
            // We skip 'blog' as it's managed separately
            if (section === 'blog') continue;

            const docRef = doc(db, "content", section);
            const data = {
                en: translations.en[section],
                bn: translations.bn[section],
            };
            batch.set(docRef, data);
        }

        await batch.commit();

        return { success: true, message: 'Database successfully seeded with initial content.' };
    } catch (error) {
        console.error("Database seeding failed:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to seed database: ${errorMessage}` };
    }
}
