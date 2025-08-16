import { parseYaml } from '../src/index'
import { describe, it, expect } from 'vitest'

describe('parseYaml', () => {
    it('parses a YAML string into an object', () => {
        const yaml = 'foo: bar\nbaz: 42'
        const result = parseYaml(yaml)
        expect(result).toEqual({ foo: 'bar', baz: 42 })
    })

    it('throws if input is not a string', () => {
        // @ts-expect-error
        expect(() => parseYaml(123)).toThrow()
        // @ts-expect-error
        expect(() => parseYaml(null)).toThrow()
    })

    it('returns undefined for empty string', () => {
        expect(parseYaml('')).toBeUndefined()
    })

    it('throws for invalid YAML', () => {
        expect(() => parseYaml('foo: [unclosed')).toThrow()
    })
})