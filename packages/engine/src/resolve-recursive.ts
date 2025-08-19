import { parseAll } from './parser'
import { substituteVars, Vars } from './substitute-vars'
import { assertNoCycle } from './cycle-detection'
import type { Directive } from './types'

export type IncludeResolver = (payload: unknown, chain: readonly string[]) => { id: string; content: string }
export type ProcessOptions = { include: IncludeResolver; vars?: Vars }


import { expandGlob } from './glob/expand-glob'
import { normalizePaths, normalizePath } from './glob/normalize-paths'
import { sortEntries } from './glob/sort-entries'
import { shuffleDeterministic } from './glob/shuffle-deterministic'
import { sampleEntries } from './glob/sample-entries'

function normalizeAndDeduplicateFiles(files: string[]): string[] {
    // Prefer non-prefixed variant if both "./file.txt" and "file.txt" exist
    const seen = new Map<string, string>()
    for (const file of files) {
        const norm = normalizePath(file).toLowerCase()
        // Prefer non-prefixed variant
        if (!seen.has(norm) || (seen.get(norm)?.startsWith('./') && !file.startsWith('./'))) {
            seen.set(norm, file)
        }
    }
    const result = Array.from(seen.values())
    return result
}
import type { GlobOrder, GlobSampleMode } from './types-glob'

function validateGlobIncludeOptions({
    pattern,
    orderBy,
    sampleMode,
    sampleCount,
    validOrders,
    validSampleModes
}: {
    pattern: unknown,
    orderBy: string,
    sampleMode: string,
    sampleCount: number | undefined,
    validOrders: string[],
    validSampleModes: string[]
}) {
    if (!validOrders.includes(orderBy)) {
        throw new Error('Invalid order_by')
    }
    if (!validSampleModes.includes(sampleMode)) {
        throw new Error('Invalid sample_mode')
    }
    if (typeof sampleCount === 'number' && (!Number.isInteger(sampleCount) || sampleCount < 1)) {
        throw new Error('Invalid sample_size')
    }
    if (
        (typeof pattern !== 'string' && !Array.isArray(pattern)) ||
        (typeof pattern === 'string' && pattern.trim() === '')
    ) {
        throw new Error('Invalid glob pattern')
    }
}

// Normalizes any glob pattern input (string, array, or stringified object/array)
function normalizeGlobPattern(input: unknown): string[] {
    if (Array.isArray(input)) {
        const arr = input.flatMap(item => normalizeGlobPattern(item));
        return arr;
    }
    if (typeof input === 'string') {
        const trimmed = input.trim();
        if (trimmed === '') {
            return [];
        }
        // Always attempt JSON.parse if string starts with { or [
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
                const obj = JSON.parse(trimmed);
                // Handle double-stringified objects
                if (typeof obj === 'string' && (obj.trim().startsWith('{') || obj.trim().startsWith('['))) {
                    return normalizeGlobPattern(obj);
                }
                // If we parsed an object with a glob property, return as-is for further processing
                if (obj && typeof obj === 'object' && typeof obj.glob === 'string') {
                    return obj;
                }
                // If we parsed an array, normalize each element
                if (Array.isArray(obj)) {
                    const arr = obj.flatMap(item => normalizeGlobPattern(item));
                    return arr;
                }
                // Fallback: return the parsed object
                return obj;
            } catch {
                // Throw if the pattern looks like a malformed glob (unclosed bracket or quote)
                if (
                    (trimmed.includes('[') && !trimmed.includes(']')) ||
                    (trimmed.includes('{') && !trimmed.includes('}')) ||
                    (trimmed.match(/["']/g)?.length ?? 0) % 2 !== 0
                ) {
                    throw new Error('Malformed glob pattern: ' + trimmed)
                }
                return [trimmed];
            }
        }
        return [trimmed];
    }
    if (input && typeof input === 'object') {
        if ('glob' in input) {
            const result = normalizeGlobPattern(input.glob);
            return result;
        }
        return [];
    }
    return [];
}

export async function processTemplate(
    input: string,
    options: ProcessOptions,
    chain: readonly string[] = []
): Promise<string> {
    let output = input
    let localVars: Vars = options.vars ? { ...options.vars } : {}

    let iterations = 0
    const maxIterations = 1000
    while (iterations < maxIterations) {
        iterations++
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
                // Strict validation for unknown keys in glob payload
                if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
                                    // Remove internal keys before validation
                                    const INTERNAL_KEYS = ['type', 'range', 'raw']
                                    const sanitizedPayload = Object.fromEntries(
                                        Object.entries(payload).filter(([k]) => !INTERNAL_KEYS.includes(k))
                                    )
                                    const allowedKeys = [
                                        'glob', 'cwd', 'orderBy', 'order_by', 'sampleMode', 'sample_mode', 'sampleCount', 'sample_size',
                                        'normalize', 'seed', 'pattern'
                                    ]
                                    const unknownKeys = Object.keys(sanitizedPayload).filter(
                                        (k) => !allowedKeys.includes(k)
                                    )
                                    if (unknownKeys.length > 0) {
                                        throw new Error('Unknown keys in glob include payload: ' + unknownKeys.join(', '))
                                    }
                                }
                if (typeof payload === 'string' && /[*?[\]{}]/.test(payload)) {
                    isGlob = true
                    globPattern = payload
                } else if (payload && typeof payload === 'object' && (typeof payload.glob === 'string' || Array.isArray(payload.glob))) {
                    isGlob = true
                    globPattern = payload.glob
                    globOptions = { ...payload }
                    delete (globOptions as any).glob
                }
                let included = ''
                if (isGlob) {
                    // Parse options from payload
                    const pattern = globPattern
                    let orderBy: GlobOrder = 'none'
                    let sampleMode: GlobSampleMode = 'none'
                    let sampleCount = undefined
                    let normalize = false
                    let seed: string | number | undefined = undefined

                    // Validation helpers
                    const validOrders = ['none', 'alphabetical_asc', 'alphabetical_desc', 'last_updated_asc', 'last_updated_desc', 'shuffle_deterministic']
                    const validSampleModes = ['none', 'random']

                    // Robust parsing: always extract glob and cwd to finalPattern/finalCwd
                    let finalPattern = pattern
                    let finalCwd = (globOptions as any).cwd ?? process.cwd()

                    // Always robustly extract glob string if pattern is a stringified object
                    if (typeof finalPattern === 'string') {
                        try {
                            const parsed = JSON.parse(finalPattern)
                            if (parsed && typeof parsed === 'object' && typeof parsed.glob === 'string') {
                                finalPattern = parsed.glob
                                if (parsed.cwd) finalCwd = parsed.cwd
                            }
                        } catch {
                            // Not a JSON string, use as is
                        }
                    }

                    // Normalize pattern before expandGlob
                    const normalizedPattern = normalizeGlobPattern(finalPattern)

                    // Extract cwd and options from payload or globOptions
                    if (typeof payload === 'object' && payload !== null) {
                        if ('pattern' in payload && typeof payload.pattern === 'string') {
                            finalPattern = payload.pattern
                        }
                        if ('cwd' in payload && typeof payload.cwd === 'string') {
                            finalCwd = payload.cwd
                        }
                        // Accept both camelCase and snake_case for orderBy
                        if (('orderBy' in payload && typeof payload.orderBy === 'string') ||
                            ('order_by' in payload && typeof payload.order_by === 'string')) {
                            orderBy = (payload.orderBy ?? payload.order_by) as GlobOrder
                            if (!validOrders.includes(orderBy)) {
                                throw new Error('Invalid order_by')
                            }
                        }
                        // Accept both camelCase and snake_case for sampleMode
                        if (('sampleMode' in payload && typeof payload.sampleMode === 'string') ||
                            ('sample_mode' in payload && typeof payload.sample_mode === 'string')) {
                            sampleMode = (payload.sampleMode ?? payload.sample_mode) as GlobSampleMode
                            if (!validSampleModes.includes(sampleMode)) {
                                throw new Error('Invalid sample_mode')
                            }
                        }
                        // Accept both camelCase and snake_case for sampleCount
                        if (('sampleCount' in payload && typeof payload.sampleCount === 'number') ||
                            ('sample_size' in payload && typeof payload.sample_size === 'number')) {
                            sampleCount = payload.sampleCount ?? payload.sample_size
                            if (!Number.isInteger(sampleCount) || sampleCount < 1) {
                                throw new Error('Invalid sample_size')
                            }
                        }
                        if ('normalize' in payload && typeof payload.normalize === 'boolean') {
                            normalize = payload.normalize
                        }
                        if ('seed' in payload && (typeof payload.seed === 'string' || typeof payload.seed === 'number')) {
                            seed = payload.seed
                        }
                    }
                    // Validate glob pattern
                    if (
                       (typeof finalPattern !== 'string' && !Array.isArray(finalPattern)) ||
                       (typeof finalPattern === 'string' && finalPattern.trim() === '')
                    ) {
                       throw new Error('Invalid glob pattern')
                    }

                    // If glob is used, ensure errors are thrown and empty matches return ''
                    if (finalPattern) {
                        validateGlobIncludeOptions({
                            pattern: finalPattern,
                            orderBy,
                            sampleMode,
                            sampleCount,
                            validOrders,
                            validSampleModes
                        });
                        const patternArr = Array.isArray(finalPattern) ? finalPattern : [finalPattern]
                        // Normalize patterns to handle cases like ['./a1.txt', 'a1.txt'] where both should match 'a1.txt'
                        const normalizedPatterns = patternArr.map(pattern => {
                            // Remove leading './' to ensure proper file matching
                            return pattern.startsWith('./') ? pattern.slice(2) : pattern
                        })
                        let files
                        try {
                            files = await expandGlob(normalizedPatterns, { cwd: finalCwd })
                        } catch (err) {
                            console.log('[petk-debug] [glob-include] error thrown for invalid glob pattern:', err)
                            throw new Error('Invalid glob pattern: ' + patternArr)
                        }
                        if (!files || files.length === 0) {
                            return ''
                        }
                        const uniqueFiles = normalizeAndDeduplicateFiles([...files])
                        // Apply sample_size if set
                        let selectedFiles = uniqueFiles
                        if (typeof sampleCount === 'number' && sampleCount > 0 && sampleCount < uniqueFiles.length) {
                            selectedFiles = uniqueFiles.slice(0, sampleCount)
                        }
                        // Apply order_by if set
                        if (orderBy === 'alphabetical_desc') {
                            selectedFiles = [...selectedFiles].sort().reverse()
                        } else if (orderBy === 'alphabetical_asc') {
                            selectedFiles = [...selectedFiles].sort()
                        }
                        // Process files using the provided file resolver from options
                        let globOutput = ''
                        if (typeof options?.include === 'function') {
                            // Always sort selectedFiles alphabetically for deterministic output unless orderBy is specified
                            if (!orderBy || orderBy === 'none') {
                                selectedFiles = [...selectedFiles].sort()
                            }
                            const filesIncluded = []
                            for (const file of selectedFiles) {
                                const resolved = await options.include(file, chain)
                                if (typeof resolved === 'string') {
                                    globOutput += resolved
                                    filesIncluded.push(file)
                                } else if (resolved && typeof resolved.content === 'string') {
                                    globOutput += resolved.content
                                    filesIncluded.push(file)
                                }
                            }
                        } else {
                            // fallback: join file names
                            globOutput = selectedFiles.sort().join('')
                        }
                        included = globOutput
                    } else {
                        // Only pass plain glob patterns to expandGlob
                        // DEBUG: Print actual pattern and cwd used for glob
                        console.log('[DUAL-PATH-DEBUG] Entering second code path (normalizedPattern branch), normalizedPattern:', normalizedPattern)
                        // eslint-disable-next-line no-console
                        console.log('[DEBUG][resolve-recursive] expandGlob pattern:', JSON.stringify(normalizedPattern), 'cwd:', JSON.stringify(finalCwd));
                        let files: string[] = []
                        if (normalizedPattern.length > 0) {
                            files = Array.from(await expandGlob(normalizedPattern, { ...globOptions, cwd: finalCwd }))
                        }
                        // Always normalize and deduplicate files, regardless of source
                        console.log('[petk-debug] [deduplication][TEST-MARKER][PRE] files before normalization and deduplication:', files)
                        files = normalizeAndDeduplicateFiles(files)
                        console.log('[petk-debug] [deduplication][TEST-MARKER][POST] files after normalization and deduplication:', files)
                        files = normalizeAndDeduplicateFiles(files)
                        console.log('[petk-debug] [deduplication][TEST-MARKER] files after normalization and deduplication:', files)
                        // [petk-debug] validation already performed at payload parsing stage
                        if (normalize) {
                            files = Array.from(normalizePaths(files))
                        }
                        if (orderBy && orderBy !== 'none') {
                            files = Array.from(await sortEntries(files, orderBy))
                        }
                        if (sampleMode === 'random' && typeof seed !== 'undefined') {
                            files = Array.from(shuffleDeterministic(files, seed))
                        }
                        if (sampleMode && sampleMode !== 'none' && typeof sampleCount === 'number') {
                            files = Array.from(sampleEntries(files, sampleCount, sampleMode))
                        }
                        // LOG: print files before processing
                        console.log('[petk-debug] glob pattern:', finalPattern, 'cwd:', finalCwd, 'matched files:', files)
                        files.forEach((f, idx) => console.log(`[petk-debug] file[${idx}]:`, f))
                        const contents = await Promise.all(
                            files.map(async (file) => {
                                const resolved = options.include(file, chain)
                                console.log('[petk-debug] resolving file:', file, 'resolved:', resolved)
                                if (!resolved || typeof resolved !== 'object' || typeof resolved.id !== 'string' || typeof resolved.content !== 'string') {
                                    throw new Error('Invalid include resolution')
                                }
                                const nextChain = assertNoCycle(chain, resolved.id)
                                return await processTemplate(resolved.content, { ...options, vars: localVars }, nextChain)
                            })
                        )
                        included = contents.join('')
                        console.log('[petk-debug] included after glob:', included)
                        console.log('[DUAL-PATH-DEBUG] Second code path completed, included length:', included.length, 'content preview:', included.slice(0, 50))
                    }
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
                    included === ''
                        ? output.slice(0, start) + output.slice(end)
                        : output.slice(0, start) + included + output.slice(end)
                changed = true
            }
        }
        if (!changed) break
    }
    return substituteVars(output, localVars)
}