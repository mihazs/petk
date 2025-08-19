import { readTextFile, writeTextFile } from '../src/index';
import fs from 'fs';
import { describe, it, expect, afterEach } from 'vitest';

const tempFile = 'temp-read-text-file.txt';

afterEach(() => {
    try {
        fs.unlinkSync(tempFile);
    } catch {
        // Ignore cleanup errors
    }
});

describe('readTextFile', () => {
    it('reads the content of a text file', () => {
        const content = 'hello world';
        writeTextFile(tempFile, content);
        const result = readTextFile(tempFile);
        expect(result).toBe(content);
    });

    it('throws if path is not a string', () => {
        // @ts-expect-error - Testing runtime validation with number input
        expect(() => readTextFile(123)).toThrow();
        // @ts-expect-error - Testing runtime validation with null input
        expect(() => readTextFile(null)).toThrow();
        // @ts-expect-error - Testing runtime validation with undefined input
        expect(() => readTextFile(undefined)).toThrow();
    });

    it('throws if path is an empty string', () => {
        expect(() => readTextFile('')).toThrow();
    });

    it('throws if file does not exist', () => {
        expect(() => readTextFile('nonexistent-file.txt')).toThrow();
    });
});