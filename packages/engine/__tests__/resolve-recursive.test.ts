import { describe, it, expect } from 'vitest'
import { processTemplate, IncludeResolver, ProcessOptions } from '../src/resolve-recursive'

const makeResolver = (map: Record<string, { id: string; content: string }>): IncludeResolver =>
    (payload, _chain) => {
        if (typeof payload === 'string') {
            if (!map[payload]) throw new Error('Include not found: ' + payload)
            return map[payload]
        }
        if (payload && typeof payload === 'object' && 'id' in payload && typeof payload.id === 'string') {
            if (!map[payload.id]) throw new Error('Include not found: ' + payload.id)
            return map[payload.id]
        }
        throw new Error('Invalid include payload')
    }

describe('processTemplate', () => {
    it('resolves simple substitution', () => {
        const resolver = makeResolver({
            foo: { id: 'foo', content: 'Hello {{name}}!' }
        })
        const options: ProcessOptions = { include: resolver, vars: { name: 'World' } }
        expect(processTemplate('Hello {{name}}!', options)).toBe('Hello World!')
    })

    it('resolves nested includes', () => {
        const resolver = makeResolver({
            a: { id: 'a', content: 'A and {{include:b}}' },
            b: { id: 'b', content: 'B and {{include:c}}' },
            c: { id: 'c', content: 'C' }
        })
        const options: ProcessOptions = { include: resolver }
        // Simulate a directive block for include
        expect(processTemplate('A and {{include:b}}', options)).toBe('A and B and C')
    })

    it('throws on cycle', () => {
        const resolver = makeResolver({
            a: { id: 'a', content: '{{include:b}}' },
            b: { id: 'b', content: '{{include:a}}' }
        })
        const options: ProcessOptions = { include: resolver }
        expect(() => processTemplate('{{include:a}}', options)).toThrow(/Cycle detected/)
    })

    it('leaves if blocks untouched', () => {
        const resolver = makeResolver({})
        const options: ProcessOptions = { include: resolver }
        expect(processTemplate('{petk:if condition="x"}foo{/petk:if}', options)).toBe('{petk:if condition="x"}foo{/petk:if}')
    })

    it('throws on invalid var payload', () => {
        const resolver = makeResolver({})
        const options: ProcessOptions = { include: resolver }
        expect(() =>
            processTemplate(
                [
                    '```{petk:var}',
                    'not-an-object',
                    '```'
                ].join('\n'),
                options
            )
        ).toThrow(/YAML|Invalid var payload|Invalid var directive/)
    })
})