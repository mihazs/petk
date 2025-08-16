// Returns true if the input value is null, undefined, or an empty string/array/object.
export function isEmpty(value: unknown): boolean {
    if (value == null) return true;
    if (typeof value === "string" || Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") return Object.keys(value as object).length === 0;
    return false;
}