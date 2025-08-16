import path from 'path';

export const resolvePath = (basePath: string, targetPath: string): string => {
    if (typeof basePath !== "string" || typeof targetPath !== "string") throw new Error("resolvePath: invalid inputs");
    return path.resolve(basePath, targetPath);
};