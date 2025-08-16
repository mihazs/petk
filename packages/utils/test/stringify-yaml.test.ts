import { stringifyYaml } from '../src/index'
import { describe, it, expect } from 'vitest'

describe('stringifyYaml', () => {
    it('stringifies an object to YAML', () => {
        const obj = { foo: 'bar', baz: 42 }
        const result = stringifyYaml(obj)
        expect(result).toContain('foo: bar')
        expect(result).toContain('baz: 42')
    })
})