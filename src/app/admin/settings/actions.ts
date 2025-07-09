
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { getAwsSettings, saveAwsSettings, AwsSettings } from '@/config/settings';
import { site as enSite } from '@/lib/translations/en/site';
import { contact as enContactData } from '@/lib/translations/en/contact';
import { contact as bnContactData } from '@/lib/translations/bn/contact';

// --- AWS Settings ---

export async function updateAwsSettingsAction(data: AwsSettings): Promise<{ success: boolean, message: string }> {
    // Basic validation to prevent saving completely empty secrets
    if (data.accessKeyId && !data.secretAccessKey) {
        return { success: false, message: 'Secret Access Key cannot be empty if Access Key ID is provided.' };
    }
    return await saveAwsSettings(data);
}

export async function getAwsSettingsAction(): Promise<AwsSettings> {
    return await getAwsSettings();
}

// --- Site Settings ---

export type SiteSettings = typeof enSite;

export async function getSiteSettingsAction(): Promise<SiteSettings> {
    // We can just return the 'en' version as they should be identical for these fields
    return enSite;
}

export async function updateSiteSettingsAction(newSettings: SiteSettings): Promise<{ success: boolean; message: string }> {
    const enFilePath = path.join(process.cwd(), 'src', 'lib', 'translations', 'en', 'site.ts');
    const bnFilePath = path.join(process.cwd(), 'src', 'lib', 'translations', 'bn', 'site.ts');
    
    try {
        const enContent = `export const site = ${JSON.stringify(newSettings, null, 2)};`;

        // Keep Bengali site settings in sync for consistency
        const bnSettings = {
            title: newSettings.title,
            url: newSettings.url,
            logo: newSettings.logo,
            publicLogo: newSettings.publicLogo,
            adminAvatar: newSettings.adminAvatar,
        };
        const bnContent = `export const site = ${JSON.stringify(bnSettings, null, 2)};`;

        await Promise.all([
            fs.writeFile(enFilePath, enContent, 'utf-8'),
            fs.writeFile(bnFilePath, bnContent, 'utf-8'),
        ]);

        return { success: true, message: 'Site settings updated successfully! Refresh to see changes.' };
    } catch (error) {
        console.error('Failed to write site settings:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to update settings file on the server: ${errorMessage}` };
    }
}


// --- Contact Settings ---

export type ContactSettings = typeof enContactData;

export async function getContactSettingsAction(): Promise<ContactSettings> {
    return enContactData;
}

async function writeContactFile(lang: 'en' | 'bn', data: ContactSettings): Promise<void> {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'translations', lang, `contact.ts`);
    const newFileContent = `export const contact = ${JSON.stringify(data, null, 2)};`;
    await fs.writeFile(filePath, newFileContent, 'utf-8');
}

export async function updateContactSettingsAction(newEnData: ContactSettings): Promise<{ success: boolean; message: string }> {
  try {
    // Create the new BN data by merging new details with existing BN text
    const newBnData: ContactSettings = {
        ...bnContactData, // preserves title, description, form fields in Bengali
        details: newEnData.details // syncs the contact details from the EN form
    };
    
    await Promise.all([
        writeContactFile('en', newEnData),
        writeContactFile('bn', newBnData),
    ]);
    return { success: true, message: 'Contact settings updated successfully!' };
  } catch (error) {
    console.error('Failed to write contact settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to update settings file on the server: ${errorMessage}` };
  }
}
