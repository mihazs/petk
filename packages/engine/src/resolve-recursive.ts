import { parseAll } from './parser'
import { substituteVars, Vars } from './substitute-vars'
import { assertNoCycle } from './cycle-detection'
import type { Directive } from './types'

export type IncludeResolver = (payload: unknown, chain: readonly string[]) => { id: string; content: string }
export type ProcessOptions = { include: IncludeResolver; vars?: Vars }

function isPlainPrimitiveObject(obj: unknown): obj is Vars {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return false
    return Object.values(obj).every(
        v => ['string', 'number', 'boolean'].includes(typeof v)
    )
}

export function processTemplate(
    input: string,
    options: ProcessOptions,
    chain: readonly string[] = []
): string {
    let output = input
    let localVars: Vars = options.vars ? { ...options.vars } : {}

    // Keep processing until no more directives are found
    while (true) {
        const directives = parseAll(output)
        if (directives.length === 0) break

        let changed = false
        // Process all directives in reverse order to avoid messing up ranges
        for (let i = directives.length - 1; i >= 0; i--) {
            const directive = directives[i]
            if (directive.type === 'var') {
                let payload: unknown = undefined
                // DEBUG: Log every var directive encountered
                // eslint-disable-next-line no-console
                console.log('DEBUG var directive:', JSON.stringify(directive));
                if ('payload' in directive && directive.payload !== undefined) {
                    payload = directive.payload
                } else if ('value' in directive && directive.value !== undefined) {
                    payload = directive.value
                } else if ('content' in directive && directive.content !== undefined) {
                    payload = directive.content
                }
                // DEBUG: Log payload type for troubleshooting test failure
                // eslint-disable-next-line no-console
                console.log('DEBUG var payload:', typeof payload, JSON.stringify(payload));
                // Only allow plain objects as payload for var
                if (
                    typeof payload !== 'object' ||
                    payload === null ||
                    Array.isArray(payload)
                ) {
                    throw new Error('Invalid var payload')
                }
                // Extra guard: reject objects with non-Object prototype (e.g. Date, Array, etc)
                if (Object.getPrototypeOf(payload) !== Object.prototype) {
                    throw new Error('Invalid var payload')
                }
                // TypeScript: payload is now a plain object
                const varPayload = payload as Record<string, unknown>
                localVars = {
                    ...localVars,
                    ...(Object.fromEntries(
                        Object.entries(varPayload).filter(
                            ([, v]) =>
                                typeof v === 'string' ||
                                typeof v === 'number' ||
                                typeof v === 'boolean'
                        )
                    ) as Vars)
                }
                const { start, end } = (directive as Directive & { range: { start: number; end: number } }).range
                output =
                    output.slice(0, start) +
                    output.slice(end)
                changed = true
            } else if (directive.type === 'include') {
                const payload = (directive as any).payload ?? (directive as any)
                const resolved = options.include(payload, chain)
                if (!resolved || typeof resolved !== 'object' || typeof resolved.id !== 'string' || typeof resolved.content !== 'string') {
                    throw new Error('Invalid include resolution')
                }
                const nextChain = assertNoCycle(chain, resolved.id)
                const included = processTemplate(resolved.content, { ...options, vars: localVars }, nextChain)
                const { start, end } = (directive as Directive & { range: { start: number; end: number } }).range
                output =
                    output.slice(0, start) +
                    included +
                    output.slice(end)
                changed = true
            }
            // if and unknown directives are left untouched
        }
        if (!changed) break
    }
    // After all replacements, substitute variables
    return substituteVars(output, localVars)
}