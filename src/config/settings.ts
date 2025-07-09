
'use server';

import { promises as fs } from 'fs';
import path from 'path';

export interface AwsSettings {
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    region: string;
}

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'aws-settings.json');

const initialSettings: AwsSettings = {
    accessKeyId: '',
    secretAccessKey: '',
    bucketName: '',
    region: '',
};

// Ensure the file exists before trying to read it.
const ensureFileExists = async () => {
    try {
        await fs.access(SETTINGS_FILE_PATH);
    } catch {
        // File doesn't exist, create it with empty values
        await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(initialSettings, null, 2), 'utf-8');
    }
};

export async function getAwsSettings(): Promise<AwsSettings> {
    await ensureFileExists();
    try {
        const fileContent = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Failed to read AWS settings file:', error);
        // Return empty settings on error
        return initialSettings;
    }
}

export async function saveAwsSettings(settings: AwsSettings): Promise<{ success: boolean; message: string }> {
    try {
        await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), 'utf-8');
        return { success: true, message: 'AWS settings saved successfully.' };
    } catch (error) {
        console.error('Failed to save AWS settings:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to save AWS settings on the server: ${errorMessage}` };
    }
}
