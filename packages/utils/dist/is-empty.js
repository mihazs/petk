// Returns true if the input value is null, undefined, or an empty string/array/object.
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
export function isEmpty(value) {
    if (value == null) return true;
    if (typeof value === "string" || Array.isArray(value)) return value.length === 0;
    if ((typeof value === "undefined" ? "undefined" : _type_of(value)) === "object") return Object.keys(value).length === 0;
    return false;
}

//# sourceMappingURL=is-empty.js.map