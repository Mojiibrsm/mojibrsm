
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { getAwsSettings, saveAwsSettings, AwsSettings } from '@/config/settings';
import { translations } from '@/lib/translations';
import type { Translations } from '@/lib/translations';

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

export type SiteSettings = Translations['en']['site'];

export async function getSiteSettingsAction(): Promise<SiteSettings> {
    // We can just return the 'en' version as they should be identical for these fields
    return translations.en.site;
}

export async function updateSiteSettingsAction(newSettings: SiteSettings): Promise<{ success: boolean; message: string }> {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'translations.ts');

    try {
        // Create a deep copy to avoid modifying the cached version in memory
        const updatedTranslations = JSON.parse(JSON.stringify(translations));
        
        // Update both English and Bengali site settings to keep them in sync
        updatedTranslations.en.site = newSettings;
        // Also update the bn site object, ensuring fields like URL are consistent
        updatedTranslations.bn.site.url = newSettings.url;
        updatedTranslations.bn.site.logo = newSettings.logo;
        updatedTranslations.bn.site.adminAvatar = newSettings.adminAvatar;
        // Keep language-specific title if it exists, otherwise use the new one
        updatedTranslations.bn.site.title = newSettings.title || updatedTranslations.bn.site.title;


        const newFileContent = `export const translations = ${JSON.stringify(updatedTranslations, null, 2)};\n\nexport type Translations = typeof translations;`;

        await fs.writeFile(filePath, newFileContent, 'utf-8');
        return { success: true, message: 'Site settings updated successfully! Refresh to see changes in the admin panel.' };
    } catch (error) {
        console.error('Failed to write to translations.ts:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to update settings file on the server: ${errorMessage}` };
    }
}
