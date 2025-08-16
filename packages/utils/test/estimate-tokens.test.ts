import { describe, it, expect } from 'vitest';
import { estimateTokens } from '../src/index';

describe('estimateTokens', () => {
    it('returns 0 for an empty string', () => {
        expect(estimateTokens('')).toBe(0);
    });

    it('counts single word as one token', () => {
        expect(estimateTokens('hello')).toBe(1);
    });

    it('counts multiple words correctly', () => {
        expect(estimateTokens('hello world')).toBe(2);
        expect(estimateTokens('this is a test')).toBe(4);
    });

    it('handles punctuation and whitespace', () => {
        expect(estimateTokens('hello, world!')).toBe(2);
        expect(estimateTokens('  spaced   out   ')).toBe(2);
    });

    it('handles unicode and special characters', () => {
        expect(estimateTokens('你好 世界')).toBe(2);
        expect(estimateTokens('emoji 😊 test')).toBe(3);
    });
});