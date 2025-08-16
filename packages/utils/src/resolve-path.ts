import { resolve, normalize } from 'path';

export const resolvePath = (filePath: string, baseDir?: string): string =>
    normalize(baseDir ? resolve(baseDir, filePath) : resolve(filePath));