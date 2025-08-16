function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
import { parseAll } from './parser';
import { substituteVars } from './substitute-vars';
import { assertNoCycle } from './cycle-detection';
function isPlainPrimitiveObject(obj) {
    if ((typeof obj === "undefined" ? "undefined" : _type_of(obj)) !== 'object' || obj === null || Array.isArray(obj)) return false;
    return Object.values(obj).every(function(v) {
        return [
            'string',
            'number',
            'boolean'
        ].includes(typeof v === "undefined" ? "undefined" : _type_of(v));
    });
}
export function processTemplate(input, options) {
    var chain = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [];
    var output = input;
    var localVars = options.vars ? _object_spread({}, options.vars) : {};
    // Keep processing until no more directives are found
    while(true){
        var directives = parseAll(output);
        if (directives.length === 0) break;
        var changed = false;
        // Process all directives in reverse order to avoid messing up ranges
        for(var i = directives.length - 1; i >= 0; i--){
            var directive = directives[i];
            if (directive.type === 'var') {
                var payload = undefined;
                // DEBUG: Log every var directive encountered
                // eslint-disable-next-line no-console
                console.log('DEBUG var directive:', JSON.stringify(directive));
                if ('payload' in directive && directive.payload !== undefined) {
                    payload = directive.payload;
                } else if ('value' in directive && directive.value !== undefined) {
                    payload = directive.value;
                } else if ('content' in directive && directive.content !== undefined) {
                    payload = directive.content;
                }
                // DEBUG: Log payload type for troubleshooting test failure
                // eslint-disable-next-line no-console
                console.log('DEBUG var payload:', typeof payload === "undefined" ? "undefined" : _type_of(payload), JSON.stringify(payload));
                // Only allow plain objects as payload for var
                if ((typeof payload === "undefined" ? "undefined" : _type_of(payload)) !== 'object' || payload === null || Array.isArray(payload)) {
                    throw new Error('Invalid var payload');
                }
                // Extra guard: reject objects with non-Object prototype (e.g. Date, Array, etc)
                if (Object.getPrototypeOf(payload) !== Object.prototype) {
                    throw new Error('Invalid var payload');
                }
                // TypeScript: payload is now a plain object
                var varPayload = payload;
                localVars = _object_spread({}, localVars, Object.fromEntries(Object.entries(varPayload).filter(function(param) {
                    var _param = _sliced_to_array(param, 2), v = _param[1];
                    return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
                })));
                var _directive_range = directive.range, start = _directive_range.start, end = _directive_range.end;
                output = output.slice(0, start) + output.slice(end);
                changed = true;
            } else if (directive.type === 'include') {
                var _directive_payload;
                var payload1 = (_directive_payload = directive.payload) !== null && _directive_payload !== void 0 ? _directive_payload : directive;
                var resolved = options.include(payload1, chain);
                if (!resolved || (typeof resolved === "undefined" ? "undefined" : _type_of(resolved)) !== 'object' || typeof resolved.id !== 'string' || typeof resolved.content !== 'string') {
                    throw new Error('Invalid include resolution');
                }
                var nextChain = assertNoCycle(chain, resolved.id);
                var included = processTemplate(resolved.content, _object_spread_props(_object_spread({}, options), {
                    vars: localVars
                }), nextChain);
                var _directive_range1 = directive.range, start1 = _directive_range1.start, end1 = _directive_range1.end;
                output = output.slice(0, start1) + included + output.slice(end1);
                changed = true;
            }
        // if and unknown directives are left untouched
        }
        if (!changed) break;
    }
    // After all replacements, substitute variables
    return substituteVars(output, localVars);
}

//# sourceMappingURL=resolve-recursive.js.map