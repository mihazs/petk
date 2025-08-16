import fs from 'fs';

export const readTextFile = (pathStr: string): string => {
    if (typeof pathStr !== "string" || pathStr.length === 0) throw new Error("readTextFile: invalid path");
    return fs.readFileSync(pathStr, "utf8");
};