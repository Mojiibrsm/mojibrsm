
'use server';

import { getAwsSettings, saveAwsSettings, AwsSettings } from '@/config/settings';

export async function updateAwsSettings(data: AwsSettings): Promise<{ success: boolean, message: string }> {
    // Basic validation to prevent saving completely empty secrets
    if (data.accessKeyId && !data.secretAccessKey) {
        return { success: false, message: 'Secret Access Key cannot be empty if Access Key ID is provided.' };
    }
    return await saveAwsSettings(data);
}

export async function getAwsSettingsForForm(): Promise<AwsSettings> {
    return await getAwsSettings();
}
