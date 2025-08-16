import { readFile } from 'fs/promises';

export const readTextFile = (filePath: string): Promise<string> =>
    readFile(filePath, 'utf8');