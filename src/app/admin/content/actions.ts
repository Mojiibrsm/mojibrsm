'use server';

import { promises as fs } from 'fs';
import path from 'path';

export async function updateTranslationsFile(content: string) {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'translations.ts');
  const newFileContent = `export const translations = ${content};\n\nexport type Translations = typeof translations;`;

  try {
    await fs.writeFile(filePath, newFileContent, 'utf-8');
    return { success: true, message: 'Content updated successfully! Changes will be live after a page refresh.' };
  } catch (error) {
    console.error('Failed to write to translations.ts:', error);
    return { success: false, message: 'Failed to update content file on the server.' };
  }
}
