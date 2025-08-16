import { writeTextFile, readTextFile } from '../src/index'
import fs from 'fs'
import { describe, it, expect, afterEach } from 'vitest'

const tempFile = 'temp-write-test.txt'
const filePath = process.cwd() + '/' + tempFile

afterEach(() => {
    try {
        fs.unlinkSync(filePath)
    } catch {}
})

describe('writeTextFile', () => {
    it('writes text to a file and can be read back', () => {
        const text = 'hello world'
        writeTextFile(filePath, text)
        const result = readTextFile(filePath)
        expect(result).toBe(text)
    })

    it('returns the file path', () => {
        const text = 'abc'
        const result = writeTextFile(filePath, text)
        expect(result).toBe(filePath)
    })

    it('throws if path is not a string', () => {
        // @ts-expect-error
        expect(() => writeTextFile(123, 'abc')).toThrow()
        // @ts-expect-error
        expect(() => writeTextFile(null, 'abc')).toThrow()
    })

    it('throws if path is empty string', () => {
        expect(() => writeTextFile('', 'abc')).toThrow()
    })

    it('throws if content is not a string', () => {
        // @ts-expect-error
        expect(() => writeTextFile(filePath, 123)).toThrow()
        // @ts-expect-error
        expect(() => writeTextFile(filePath, null)).toThrow()
    })
})