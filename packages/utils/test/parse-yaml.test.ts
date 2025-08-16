import { parseYaml } from '../src/index'
import { describe, it, expect } from 'vitest'

describe('parseYaml', () => {
    it('parses a YAML string into an object', () => {
        const yaml = 'foo: bar\nbaz: 42'
        const result = parseYaml(yaml)
        expect(result).toEqual({ foo: 'bar', baz: 42 })
    })
})