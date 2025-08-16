import { writeTextFile, readTextFile } from '../src/index'
import { unlink } from 'fs/promises'
import { describe, it, expect, afterEach } from 'vitest'

const tempFile = 'temp-write-test.txt'
const filePath = process.cwd() + '/' + tempFile

afterEach(async () => {
    try {
        await unlink(filePath)
    } catch {}
})

describe('writeTextFile', () => {
    it('writes text to a file and can be read back', async () => {
        const text = 'hello world'
        await writeTextFile(filePath, text)
        const result = await readTextFile(filePath)
        expect(result).toBe(text)
    })
})