import { stringifyYaml } from '../src/index'
import { describe, it, expect } from 'vitest'

describe('stringifyYaml', () => {
    it('stringifies an object to YAML', () => {
        const obj = { foo: 'bar', baz: 42 }
        const result = stringifyYaml(obj)
        expect(result).toContain('foo: bar')
        expect(result).toContain('baz: 42')
    })

    it('stringifies arrays', () => {
        const arr = [1, 2, 3]
        const result = stringifyYaml(arr)
        expect(result).toContain('- 1')
        expect(result).toContain('- 2')
        expect(result).toContain('- 3')
    })

    it('stringifies null and undefined', () => {
        expect(stringifyYaml(null)).toContain('null')
        expect(stringifyYaml(undefined)).toContain('null')
    })
})