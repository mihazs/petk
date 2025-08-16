type OrderBy =
    | 'alphabetical_asc'
    | 'alphabetical_desc'
    | 'last_updated_asc'
    | 'last_updated_desc'

type StatManyDeps = {
    statMany?: (paths: readonly string[]) => Promise<Record<string, number>>
}

export async function sortEntries(
    entries: readonly string[],
    orderBy: OrderBy,
    deps?: StatManyDeps
): Promise<readonly string[]> | readonly string[] {
    if (
        orderBy === 'alphabetical_asc' ||
        orderBy === 'alphabetical_desc'
    ) {
        const sorted = [...entries].sort((a, b) =>
            a.localeCompare(b)
        )
        return orderBy === 'alphabetical_asc' ? sorted : sorted.reverse()
    }
    if (
        orderBy === 'last_updated_asc' ||
        orderBy === 'last_updated_desc'
    ) {
        if (!deps?.statMany) return [...entries]
        const mtimes = await deps.statMany(entries)
        const sorted = [...entries].sort((a, b) => {
            const ma = mtimes[a] ?? 0
            const mb = mtimes[b] ?? 0
            return ma - mb
        })
        return orderBy === 'last_updated_asc' ? sorted : sorted.reverse()
    }
    return [...entries]
}