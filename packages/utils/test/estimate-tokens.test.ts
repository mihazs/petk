import { describe, it, expect } from 'vitest';
import { estimateTokens } from '../src/index';

describe('estimateTokens', () => {
    it('returns 0 for an empty string', () => {
        expect(estimateTokens('')).toBe(0);
        expect(estimateTokens('   ')).toBe(0);
    });

    it('returns correct value for short strings', () => {
        expect(estimateTokens('abcd')).toBe(1);
        expect(estimateTokens('abcdefgh')).toBe(2);
    });

    it('throws if input is not a string', () => {
        // @ts-expect-error
        expect(() => estimateTokens(123)).toThrow();
        // @ts-expect-error
        expect(() => estimateTokens(null)).toThrow();
    });

    it('returns Math.ceil(length/4)', () => {
        expect(estimateTokens('1234')).toBe(1);
        expect(estimateTokens('12345')).toBe(2);
        expect(estimateTokens('12345678')).toBe(2);
        expect(estimateTokens('123456789')).toBe(3);
    });
});