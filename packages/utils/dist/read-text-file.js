import fs from 'fs';
export var readTextFile = function(pathStr) {
    if (typeof pathStr !== "string" || pathStr.length === 0) throw new Error("readTextFile: invalid path");
    return fs.readFileSync(pathStr, "utf8");
};

//# sourceMappingURL=read-text-file.js.map