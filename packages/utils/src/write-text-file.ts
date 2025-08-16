import fs from 'fs';
import path from 'path';

export const writeTextFile = (pathStr: string, content: string): string => {
    if (typeof pathStr !== "string" || pathStr.length === 0) throw new Error("writeTextFile: invalid path");
    if (typeof content !== "string") throw new Error("writeTextFile: invalid content");
    fs.mkdirSync(path.dirname(pathStr), { recursive: true });
    fs.writeFileSync(pathStr, content, "utf8");
    return pathStr;
};