import { parseYaml } from '@petk/utils';
import type { Directive, DirectiveType } from './types';

export function parseDirective(yaml: string, type: DirectiveType): Directive {
    let data: unknown;
    try {
        data = parseYaml(yaml);
    } catch (e) {
        throw new Error('YAML parsing error: ' + (e instanceof Error ? e.message : String(e)));
    }

    if (type === 'include') {
        if (data && typeof data === 'object' && data !== null) {
            const dataObj = data as Record<string, unknown>;
            if (typeof dataObj.path === 'string') {
                return { type, path: dataObj.path };
            }
            if (typeof dataObj.glob === 'string' || Array.isArray(dataObj.glob)) {
                return { type, ...dataObj } as Directive;
            }
        }
        throw new Error('Invalid include directive: missing or invalid path or glob');
    }
    if (type === 'var') {
        if (data && typeof data === 'object' && data !== null) {
            const dataObj = data as Record<string, unknown>;
            if (typeof dataObj.name === 'string' && 'value' in dataObj) {
                return { type, name: dataObj.name, value: dataObj.value };
            }
        }
        throw new Error('Invalid var directive: missing name or value');
    }
    if (type === 'if') {
        if (data && typeof data === 'object' && data !== null && 'condition' in data) {
            const dataObj = data as Record<string, unknown>;
            return { type, condition: dataObj.condition };
        }
        throw new Error('Invalid if directive: missing condition');
    }
    throw new Error('Invalid directive type: ' + type);
}