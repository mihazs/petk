export function assertNoCycle(chain: readonly string[], nextId: string): readonly string[] {
    if (chain.includes(nextId)) {
        throw new Error('Cycle detected: ' + [...chain, nextId].join(' -> '))
    }
    return [...chain, nextId]
}