import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { expandGlob } from '../src/glob/expand-glob'
import { sortEntries } from '../src/glob/sort-entries'
import { shuffleDeterministic } from '../src/glob/shuffle-deterministic'
import { sampleEntries } from '../src/glob/sample-entries'
import { normalizePaths } from '../src/glob/normalize-paths'
import { writeFileSync, utimesSync, unlinkSync, mkdirSync, rmdirSync } from 'fs'
import { join } from 'path'

const TMP_DIR = join(__dirname, 'tmp-glob-test')

const files = [
    { name: 'a.txt', mtime: 1000 },
    { name: 'b.txt', mtime: 2000 },
    { name: 'c.txt', mtime: 1500 }
]
const fileNames = files.map(f => f.name)

beforeAll(() => {
    mkdirSync(TMP_DIR, { recursive: true })
    files.forEach(({ name, mtime }) => {
        const filePath = join(TMP_DIR, name)
        writeFileSync(filePath, 'test')
        utimesSync(filePath, mtime, mtime)
    })
})

afterAll(() => {
    fileNames.forEach((name) => {
        try { unlinkSync(join(TMP_DIR, name)) } catch { /* ignore cleanup errors */ }
    })
    try { rmdirSync(TMP_DIR) } catch { /* ignore cleanup errors */ }
})

describe('expandGlob', () => {
    it('expands glob patterns and deduplicates', async () => {
        const result = await expandGlob(['*.txt', 'a.txt'], { cwd: TMP_DIR })
        expect(result.map(p => p.split('/').pop()).sort()).toEqual(['a.txt', 'b.txt', 'c.txt'])
    })
})

describe('sortEntries', () => {
    const entries = ['b.txt', 'a.txt', 'c.txt']
    it('sorts alphabetically ascending', async () => {
        const result = await sortEntries(entries, 'alphabetical_asc')
        expect(result).toEqual(['a.txt', 'b.txt', 'c.txt'])
    })
    it('sorts alphabetically descending', async () => {
        const result = await sortEntries(entries, 'alphabetical_desc')
        expect(result).toEqual(['c.txt', 'b.txt', 'a.txt'])
    })
    it('sorts by last updated ascending', async () => {
        const mtimes = { 'a.txt': 1000, 'b.txt': 2000, 'c.txt': 1500 }
        const result = await sortEntries(entries, 'last_updated_asc', { statMany: async (_paths) => mtimes })
        expect(result).toEqual(['a.txt', 'c.txt', 'b.txt'])
    })
    it('sorts by last updated descending', async () => {
        const mtimes = { 'a.txt': 1000, 'b.txt': 2000, 'c.txt': 1500 }
        const result = await sortEntries(entries, 'last_updated_desc', { statMany: async (_paths) => mtimes })
        expect(result).toEqual(['b.txt', 'c.txt', 'a.txt'])
    })
})

describe('shuffleDeterministic', () => {
    it('shuffles deterministically with seed', () => {
        const result = shuffleDeterministic(['a', 'b', 'c', 'd'], 42)
        // eslint-disable-next-line no-console
        console.log('shuffleDeterministic([a,b,c,d], 42) =', result)
        expect(result).toEqual(['a', 'd', 'b', 'c'])
    })
    it('shuffles deterministically with string seed', () => {
        const result = shuffleDeterministic(['a', 'b', 'c', 'd'], 'seed')
        // eslint-disable-next-line no-console
        console.log('shuffleDeterministic([a,b,c,d], "seed") =', result)
        expect(result).toEqual(['b', 'c', 'a', 'd'])
    })
})

describe('sampleEntries', () => {
    const items = ['a', 'b', 'c', 'd']
    it('samples first_n', () => {
        const result = sampleEntries(items, 2, 'first_n')
        expect(result).toEqual(['a', 'b'])
    })
    it('samples random with deterministic rng', () => {
        const rng = (_i: number) => 0.5
        const result = sampleEntries(items, 2, 'random', { rng })
        expect(result.length).toBe(2)
        expect(new Set(result).size).toBe(2)
        expect(items).toEqual(['a', 'b', 'c', 'd']) // original not mutated
    })
})

describe('normalizePaths', () => {
    it('normalizes and deduplicates paths', () => {
        const paths = [
            'foo/bar/baz.txt',
            'foo\\bar\\baz.txt',
            './foo/bar/../bar/baz.txt',
            'foo/bar/baz.txt'
        ]
        const result = normalizePaths(paths)
        expect(result).toEqual(['foo/bar/baz.txt'])
    })
})