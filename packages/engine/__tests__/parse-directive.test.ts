import { describe, it, expect } from 'vitest';
import { parseDirective } from '../src/parse-directive';

describe('parseDirective', () => {
    it('parses a valid include directive', () => {
        const yaml = 'path: foo.md';
        const result = parseDirective(yaml, 'include');
        expect(result.type).toBe('include');
        if (result.type === 'include') {
            expect(result.path).toBe('foo.md');
        } else {
            throw new Error('Expected include directive');
        }
    });

    it('parses a valid var directive', () => {
        const yaml = 'name: foo\nvalue: 123';
        const result = parseDirective(yaml, 'var');
        expect(result.type).toBe('var');
        if (result.type === 'var') {
            expect(result.name).toBe('foo');
            expect(result.value).toBe(123);
        } else {
            throw new Error('Expected var directive');
        }
    });

    it('parses a valid if directive', () => {
        const yaml = 'condition: true';
        const result = parseDirective(yaml, 'if');
        expect(result.type).toBe('if');
        if (result.type === 'if') {
            expect(result.condition).toBe(true);
        } else {
            throw new Error('Expected if directive');
        }
    });

    it('throws on invalid YAML', () => {
        const yaml = 'name: foo: bar';
        expect(() => parseDirective(yaml, 'var')).toThrow(/YAML/i);
    });

    it('throws on invalid directive type', () => {
        const yaml = 'foo: bar';
        // @ts-expect-error - Testing with invalid directive type to verify error handling
        expect(() => parseDirective(yaml, 'unknown')).toThrow(/Invalid directive type/i);
    });

    it('throws if required fields are missing', () => {
        expect(() => parseDirective('', 'include')).toThrow();
        expect(() => parseDirective('name: foo', 'var')).toThrow();
        expect(() => parseDirective('', 'if')).toThrow();
    });
});