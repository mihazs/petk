import { describe, it, expect } from 'vitest'
import { assertNoCycle } from '../src/cycle-detection'

describe('assertNoCycle', () => {
    it('appends id if not present', () => {
        const chain = ['a', 'b']
        const result = assertNoCycle(chain, 'c')
        expect(result).toEqual(['a', 'b', 'c'])
    })

    it('throws if id is at start', () => {
        expect(() => assertNoCycle(['x', 'y', 'z'], 'x')).toThrowError(
            'Cycle detected: x -> y -> z -> x'
        )
    })

    it('throws if id is in middle', () => {
        expect(() => assertNoCycle(['a', 'b', 'c'], 'b')).toThrowError(
            'Cycle detected: a -> b -> c -> b'
        )
    })

    it('throws if id is at end', () => {
        expect(() => assertNoCycle(['a', 'b', 'c'], 'c')).toThrowError(
            'Cycle detected: a -> b -> c -> c'
        )
    })

    it('handles empty chain', () => {
        const result = assertNoCycle([], 'foo')
        expect(result).toEqual(['foo'])
    })

    it('does not mutate input', () => {
        const chain = ['a', 'b']
        assertNoCycle(chain, 'c')
        expect(chain).toEqual(['a', 'b'])
    })
})