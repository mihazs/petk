function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
import { parseYaml } from '@petk/utils';
export function parseDirective(yaml, type) {
    var data;
    try {
        data = parseYaml(yaml);
    } catch (e) {
        throw new Error('YAML parsing error: ' + (_instanceof(e, Error) ? e.message : String(e)));
    }
    if (type === 'include') {
        if (!data || typeof data.path !== 'string') {
            throw new Error('Invalid include directive: missing or invalid path');
        }
        return {
            type: type,
            path: data.path
        };
    }
    if (type === 'var') {
        if (!data || typeof data.name !== 'string' || !('value' in data)) {
            throw new Error('Invalid var directive: missing name or value');
        }
        return {
            type: type,
            name: data.name,
            value: data.value
        };
    }
    if (type === 'if') {
        if (!data || !('condition' in data)) {
            throw new Error('Invalid if directive: missing condition');
        }
        return {
            type: type,
            condition: data.condition
        };
    }
    throw new Error('Invalid directive type: ' + type);
}

//# sourceMappingURL=parse-directive.js.map