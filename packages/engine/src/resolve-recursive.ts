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

import { expandGlob } from './glob/expand-glob'
import { normalizePaths } from './glob/normalize-paths'
import { sortEntries } from './glob/sort-entries'
import { shuffleDeterministic } from './glob/shuffle-deterministic'
import { sampleEntries } from './glob/sample-entries'
import type { GlobIncludePayload, GlobOrder, GlobSampleMode } from './types-glob'

export async function processTemplate(
    input: string,
    options: ProcessOptions,
    chain: readonly string[] = []
): Promise<string> {
    let output = input
    let localVars: Vars = options.vars ? { ...options.vars } : {}

    while (true) {
        const directives = parseAll(output)
        if (directives.length === 0) break

        let changed = false
        for (let i = directives.length - 1; i >= 0; i--) {
            const directive = directives[i]
            if (directive.type === 'var') {
                let payload: unknown = undefined
                if ('payload' in directive && directive.payload !== undefined) {
                    payload = directive.payload
                } else if ('value' in directive && directive.value !== undefined) {
                    payload = directive.value
                } else if ('content' in directive && directive.content !== undefined) {
                    payload = directive.content
                }
                if (
                    typeof payload !== 'object' ||
                    payload === null ||
                    Array.isArray(payload)
                ) {
                    throw new Error('Invalid var payload')
                }
                if (Object.getPrototypeOf(payload) !== Object.prototype) {
                    throw new Error('Invalid var payload')
                }
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
                // Glob pattern detection: string with glob chars or object with glob key
                let isGlob = false
                let globPattern = ''
                let globOptions = {}
                if (typeof payload === 'string' && /[*?[\]{}]/.test(payload)) {
                    isGlob = true
                    globPattern = payload
                } else if (payload && typeof payload === 'object' && typeof payload.glob === 'string') {
                    isGlob = true
                    globPattern = payload.glob
                    globOptions = { ...payload }
                    delete (globOptions as any).glob
                }
                let included = ''
                if (isGlob) {
                    // Parse options from payload
                    let pattern = globPattern
                    let orderBy: GlobOrder = 'none'
                    let sampleMode: GlobSampleMode = 'none'
                    let sampleCount = undefined
                    let normalize = false
                    let seed: string | number | undefined = undefined
                
                    if (typeof payload === 'object' && payload !== null) {
                        if ('pattern' in payload && typeof payload.pattern === 'string') {
                            pattern = payload.pattern
                        }
                        if ('orderBy' in payload && typeof payload.orderBy === 'string') {
                            orderBy = payload.orderBy as GlobOrder
                        }
                        if ('sampleMode' in payload && typeof payload.sampleMode === 'string') {
                            sampleMode = payload.sampleMode as GlobSampleMode
                        }
                        if ('sampleCount' in payload && typeof payload.sampleCount === 'number') {
                            sampleCount = payload.sampleCount
                        }
                        if ('normalize' in payload && typeof payload.normalize === 'boolean') {
                            normalize = payload.normalize
                        }
                        if ('seed' in payload && (typeof payload.seed === 'string' || typeof payload.seed === 'number')) {
                            seed = payload.seed
                        }
                    }
                
                    // Ensure cwd is set for expandGlob
                    const cwd = (globOptions as any).cwd ?? process.cwd()
                    let files = await expandGlob([pattern], { ...globOptions, cwd })
                    if (normalize) {
                        files = normalizePaths(files)
                    }
                    if (orderBy && orderBy !== 'none') {
                        files = await sortEntries(files, orderBy)
                    }
                    if (sampleMode === 'random' && typeof seed !== 'undefined') {
                        files = shuffleDeterministic(files, seed)
                    }
                    if (sampleMode && sampleMode !== 'none' && typeof sampleCount === 'number') {
                        files = sampleEntries(files, sampleCount, sampleMode)
                    }
                
                    const contents = await Promise.all(
                        files.map(async (file) => {
                            const resolved = options.include(file, chain)
                            if (!resolved || typeof resolved !== 'object' || typeof resolved.id !== 'string' || typeof resolved.content !== 'string') {
                                throw new Error('Invalid include resolution')
                            }
                            const nextChain = assertNoCycle(chain, resolved.id)
                            return await processTemplate(resolved.content, { ...options, vars: localVars }, nextChain)
                        })
                    )
                    included = contents.join('')
                } else {
                    const resolved = options.include(payload, chain)
                    if (!resolved || typeof resolved !== 'object' || typeof resolved.id !== 'string' || typeof resolved.content !== 'string') {
                        throw new Error('Invalid include resolution')
                    }
                    const nextChain = assertNoCycle(chain, resolved.id)
                    included = await processTemplate(resolved.content, { ...options, vars: localVars }, nextChain)
                }
                const { start, end } = (directive as Directive & { range: { start: number; end: number } }).range
                output =
                    output.slice(0, start) +
                    included +
                    output.slice(end)
                changed = true
            }
        }
        if (!changed) break
    }
    return substituteVars(output, localVars)
}