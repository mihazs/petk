import { load } from 'js-yaml';

export const parseYaml = (yaml: string): unknown =>
    load(yaml);