export type Vars = Record<string, string | number | boolean>

export function substituteVars(input: string, vars: Vars): string {
    if (!input || typeof input !== 'string' || !vars || typeof vars !== 'object') return input
    // Only replace {{key}} with no spaces and exactly two braces
    return input.replace(/(?<!{){{([a-zA-Z0-9_]+)}}(?!})/g, (match, key) =>
        Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match
    )
}