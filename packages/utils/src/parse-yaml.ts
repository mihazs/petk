import yaml from 'js-yaml';

export const parseYaml = (text: string): unknown => {
    if (typeof text !== "string") throw new Error("parseYaml: invalid input");
    return yaml.load(text) as unknown;
};