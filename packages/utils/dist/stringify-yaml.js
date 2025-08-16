import yaml from 'js-yaml';
export var stringifyYaml = function(value) {
    return value === undefined ? yaml.dump(null) : yaml.dump(value);
};

//# sourceMappingURL=stringify-yaml.js.map