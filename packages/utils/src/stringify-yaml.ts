import yaml from 'js-yaml';

export const stringifyYaml = (value: unknown): string => yaml.dump(value as any);