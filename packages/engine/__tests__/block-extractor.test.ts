import { describe, it, expect } from 'vitest';
import { findDirectiveBlocks } from '../src/block-extractor';

describe('findDirectiveBlocks', () => {
    it('extracts a single include directive block', () => {
        const input = [
            'Some text',
            '```{petk:include}',
            'path: foo.md',
            '```',
            'Other text'
        ].join('\n');
        const blocks = findDirectiveBlocks(input);
        expect(blocks).toHaveLength(1);
        expect(blocks[0].type).toBe('include');
        expect(blocks[0].yaml).toBe('path: foo.md');
        expect(typeof blocks[0].start).toBe('number');
        expect(typeof blocks[0].end).toBe('number');
        expect(blocks[0].raw).toContain('```{petk:include}');
    });

    it('extracts multiple directive blocks of different types', () => {
        const input = [
            '```{petk:include}',
            'path: foo.md',
            '```',
            '```{petk:var}',
            'name: bar',
            'value: 42',
            '```',
            '```{petk:if}',
            'condition: true',
            '```'
        ].join('\n');
        const blocks = findDirectiveBlocks(input);
        expect(blocks).toHaveLength(3);
        expect(blocks.map(b => b.type)).toEqual(['include', 'var', 'if']);
    });

    it('throws on unclosed directive block', () => {
        const input = [
            '```{petk:include}',
            'path: foo.md'
        ].join('\n');
        expect(() => findDirectiveBlocks(input)).toThrow(/Unclosed/);
    });

    it('ignores non-directive code blocks', () => {
        const input = [
            '```js',
            'console.log("hello")',
            '```'
        ].join('\n');
        const blocks = findDirectiveBlocks(input);
        expect(blocks).toHaveLength(0);
    });

    it('extracts blocks with extra whitespace', () => {
        const input = [
            '   ```{petk:var}   ',
            'name: x',
            'value: 1',
            '   ```   '
        ].join('\n');
        const blocks = findDirectiveBlocks(input);
        expect(blocks).toHaveLength(1);
        expect(blocks[0].type).toBe('var');
    });
});