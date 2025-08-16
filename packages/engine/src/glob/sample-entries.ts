export type SampleMode = 'first_n' | 'random'

export interface SampleEntriesDeps {
    rng?: (i: number) => number
}

export function sampleEntries<T>(
    items: readonly T[],
    count: number,
    mode: SampleMode,
    deps?: SampleEntriesDeps
): readonly T[] {
    if (count <= 0) return []
    if (mode === 'first_n') {
        return items.slice(0, count)
    }
    if (mode === 'random') {
        const arr = [...items]
        const rng = deps?.rng ?? ((i: number) => Math.random())
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(rng(i) * (i + 1))
            const tmp = arr[i]
            arr[i] = arr[j]
            arr[j] = tmp
        }
        return arr.slice(0, count)
    }
    throw new Error('Invalid sample mode')
}