function mulberry32(seed: number): () => number {
    let t = seed >>> 0
    return () => {
        t += 0x6d2b79f5
        let r = Math.imul(t ^ (t >>> 15), 1 | t)
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296
    }
}

export function shuffleDeterministic<T>(
    items: readonly T[],
    seed: string | number,
    deps?: { rng?: (i: number) => number }
): readonly T[] {
    const arr = [...items]
    const s = typeof seed === 'string' ? hashString(seed) : seed
    const rng = deps?.rng
        ? (i: number) => deps!.rng!(i)
        : (() => {
              const prng = mulberry32(s)
              return (_: number) => prng()
          })()
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng(i) * (i + 1))
        const tmp = arr[i]
        arr[i] = arr[j]
        arr[j] = tmp
    }
    return arr
}

function hashString(str: string): number {
    let h = 2166136261
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i)
        h = Math.imul(h, 16777619)
    }
    return h >>> 0
}