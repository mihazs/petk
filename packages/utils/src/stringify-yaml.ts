import { dump } from 'js-yaml';

export const stringifyYaml = (value: unknown): string =>
    dump(value);