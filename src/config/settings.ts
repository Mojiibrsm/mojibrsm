
'use server';

import { promises as fs } from 'fs';
import path from 'path';

export interface AwsSettings {
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    region: string;
}

// NOTE: In a Vercel environment, this file path might not be persistent across deployments.
// Environment variables are the recommended way to store secrets.
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
    // Prioritize environment variables for production/hosting environments
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_BUCKET_NAME && process.env.AWS_REGION) {
        return {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            bucketName: process.env.AWS_BUCKET_NAME,
            region: process.env.AWS_REGION,
        };
    }

    // Fallback to JSON file for local development or if env vars are not set
    await ensureFileExists();
    try {
        const fileContent = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8');
        const settingsFromFile = JSON.parse(fileContent);
        return settingsFromFile;
    } catch (error) {
        console.error('Failed to read AWS settings file:', error);
        // Return empty settings on error
        return initialSettings;
    }
}

export async function saveAwsSettings(settings: AwsSettings): Promise<{ success: boolean; message: string }> {
    try {
        await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), 'utf-8');
        return { success: true, message: 'AWS settings saved successfully. They will be used if environment variables are not set.' };
    } catch (error) {
        console.error('Failed to save AWS settings:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to save AWS settings on the server: ${errorMessage}` };
    }
}
