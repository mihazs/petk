import path from 'path'

export function normalizePaths(paths: readonly string[]): readonly string[] {
    const seen = new Set<string>()
    const result: string[] = []
    for (const p of paths) {
        const normalized = path.posix.normalize(p.replace(/\\/g, '/'))
        if (!seen.has(normalized)) {
            seen.add(normalized)
            result.push(normalized)
        }
    }
    return result
}