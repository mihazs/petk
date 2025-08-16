import { resolvePath } from '../src/index'
import { describe, it, expect } from 'vitest'

describe('resolvePath', () => {
    it('resolves a relative path to an absolute path', () => {
        const input = './foo/bar.txt'
        const result = resolvePath(input)
        expect(result.endsWith('foo/bar.txt')).toBe(true)
        expect(result.startsWith('/')).toBe(true)
    })
})