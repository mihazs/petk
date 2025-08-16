import { glob } from 'glob'

type ExpandGlobOptions = {
    cwd: string
    ignore?: readonly string[]
}

export async function expandGlob(
    patterns: readonly string[],
    opts: ExpandGlobOptions
): Promise<readonly string[]> {
    const found = new Set<string>()
    for (const pattern of patterns) {
        const matches = await glob(pattern, {
            cwd: opts.cwd,
            ignore: opts.ignore ? [...opts.ignore] : undefined,
            absolute: true,
            nodir: true,
            windowsPathsNoEscape: true
        })
        for (const m of matches) {
            if (!found.has(m)) found.add(m)
        }
    }
    return Array.from(found)
}