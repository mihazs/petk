import { describe, it, expect } from 'vitest';
import { parseAll } from '../src/parser';

describe('parseAll', () => {
    it('parses all directive blocks from markdown', () => {
        const input = [
            'Intro text',
            '```{petk:include}',
            'path: foo.md',
            '```',
            '```{petk:var}',
            'name: bar',
            'value: 42',
            '```',
            '```{petk:if}',
            'condition: true',
            '```',
            'Outro text'
        ].join('\n');
        const directives = parseAll(input);
        expect(directives).toHaveLength(3);
        expect(directives[0].type).toBe('include');
        if (directives[0].type === 'include') {
            expect(directives[0].path).toBe('foo.md');
        }
        expect(directives[1].type).toBe('var');
        if (directives[1].type === 'var') {
            expect(directives[1].name).toBe('bar');
            expect(directives[1].value).toBe(42);
        }
        expect(directives[2].type).toBe('if');
        if (directives[2].type === 'if') {
            expect(directives[2].condition).toBe(true);
        }
    });

    it('returns empty array if no directive blocks', () => {
        const input = 'No directives here.';
        expect(parseAll(input)).toHaveLength(0);
    });

    it('throws if a block is invalid', () => {
        const input = [
            '```{petk:include}',
            'bad_field: x',
            '```'
        ].join('\n');
        expect(() => parseAll(input)).toThrow();
    });
});