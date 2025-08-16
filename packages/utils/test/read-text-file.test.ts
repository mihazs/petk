import { readTextFile, writeTextFile } from '../src/index';
import { unlink } from 'fs/promises';
import { describe, it, expect, afterEach } from 'vitest';

const tempFile = 'temp-read-text-file.txt';

afterEach(async () => {
    try {
        await unlink(tempFile);
    } catch {}
});

describe('readTextFile', () => {
    it('reads the content of a text file', async () => {
        const content = 'hello world';
        await writeTextFile(tempFile, content);
        const result = await readTextFile(tempFile);
        expect(result).toBe(content);
    });
});