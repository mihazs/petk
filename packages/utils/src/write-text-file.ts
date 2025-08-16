import { writeFile } from 'fs/promises';

export const writeTextFile = (filePath: string, content: string): Promise<void> =>
    writeFile(filePath, content, 'utf8');