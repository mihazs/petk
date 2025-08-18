import { parseYaml } from '@petk/utils';
import type { Directive, DirectiveType } from './types';

export function parseDirective(yaml: string, type: DirectiveType): Directive {
    let data: any;
    try {
        data = parseYaml(yaml);
    } catch (e) {
        throw new Error('YAML parsing error: ' + (e instanceof Error ? e.message : String(e)));
    }

    if (type === 'include') {
        if (data && typeof data.path === 'string') {
            return { type, path: data.path };
        }
        if (data && (typeof data.glob === 'string' || Array.isArray(data.glob))) {
            return { type, ...data };
        }
        throw new Error('Invalid include directive: missing or invalid path or glob');
    }
    if (type === 'var') {
        if (!data || typeof data.name !== 'string' || !('value' in data)) {
            throw new Error('Invalid var directive: missing name or value');
        }
        return { type, name: data.name, value: data.value };
    }
    if (type === 'if') {
        if (!data || !('condition' in data)) {
            throw new Error('Invalid if directive: missing condition');
        }
        return { type, condition: data.condition };
    }
    throw new Error('Invalid directive type: ' + type);
}