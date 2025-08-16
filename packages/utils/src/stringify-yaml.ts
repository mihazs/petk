import yaml from 'js-yaml';

export const stringifyYaml = (value: unknown): string =>
    value === undefined ? yaml.dump(null) : yaml.dump(value as any);