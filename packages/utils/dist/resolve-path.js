import path from 'path';
export var resolvePath = function(basePath, targetPath) {
    if (typeof basePath !== "string" || typeof targetPath !== "string") throw new Error("resolvePath: invalid inputs");
    return path.resolve(basePath, targetPath);
};

//# sourceMappingURL=resolve-path.js.map