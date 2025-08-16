import yaml from 'js-yaml';
export var parseYaml = function(text) {
    if (typeof text !== "string") throw new Error("parseYaml: invalid input");
    return yaml.load(text);
};

//# sourceMappingURL=parse-yaml.js.map