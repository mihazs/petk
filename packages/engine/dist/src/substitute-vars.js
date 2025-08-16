function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
export function substituteVars(input, vars) {
    if (!input || typeof input !== 'string' || !vars || (typeof vars === "undefined" ? "undefined" : _type_of(vars)) !== 'object') return input;
    // Only replace {{key}} with no spaces and exactly two braces
    return input.replace(RegExp("(?<!{){{([a-zA-Z0-9_]+)}}(?!})", "g"), function(match, key) {
        return Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match;
    });
}

//# sourceMappingURL=substitute-vars.js.map