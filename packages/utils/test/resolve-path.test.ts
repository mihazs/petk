import { resolvePath } from '../src/index'
import { describe, it, expect } from 'vitest'
import path from 'path'

describe('resolvePath', () => {
    it('resolves two paths to an absolute path', () => {
        const base = '/tmp'
        const rel = 'foo/bar.txt'
        const result = resolvePath(base, rel)
        expect(result).toBe(path.resolve(base, rel))
    })

    it('throws if basePath is not a string', () => {
        // @ts-expect-error
        expect(() => resolvePath(123, 'foo')).toThrow()
    })

    it('throws if targetPath is not a string', () => {
        // @ts-expect-error
        expect(() => resolvePath('/tmp', 123)).toThrow()
    })
})