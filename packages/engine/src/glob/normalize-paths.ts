import path from 'path'

export function normalizePaths(paths: readonly string[]): readonly string[] {
    const seen = new Set<string>()
    const result: string[] = []
    for (const p of paths) {
        let normalized = normalizePath(p)
        if (!seen.has(normalized)) {
            seen.add(normalized)
            result.push(p)
        }
    }
    return result
}

export function normalizePath(p: string): string {
    let normalized = path.posix.normalize(p.replace(/\\/g, '/'))
    if (normalized.startsWith('./')) {
        normalized = normalized.slice(2)
    }
    return normalized
}