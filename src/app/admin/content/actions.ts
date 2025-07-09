
'use server';

import { promises as fs } from 'fs';
import path from 'path';

async function writeContentFile(lang: 'en' | 'bn', section: string, data: object): Promise<void> {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'translations', lang, `${section}.ts`);
    const newFileContent = `export const ${section} = ${JSON.stringify(data, null, 2)};`;
    await fs.writeFile(filePath, newFileContent, 'utf-8');
}


export async function updateSectionContent(
    section: string, 
    enData: object,
    bnData: object
): Promise<{ success: boolean; message: string }> {
  try {
    await Promise.all([
        writeContentFile('en', section, enData),
        writeContentFile('bn', section, bnData),
    ]);
    return { success: true, message: `Content for '${section}' updated successfully! Changes may require a server restart to be visible.` };
  } catch (error) {
    console.error(`Failed to write content for section '${section}':`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to update content file on the server: ${errorMessage}` };
  }
}
