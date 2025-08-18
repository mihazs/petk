import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, writeFile, rm, readFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
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
    it('resolves simple substitution', async () => {
        const resolver = makeResolver({
            foo: { id: 'foo', content: 'Hello {{name}}!' }
        })
        const options: ProcessOptions = { include: resolver, vars: { name: 'World' } }
        await expect(await processTemplate('Hello {{name}}!', options)).toBe('Hello World!')
    })

    it('resolves nested includes', async () => {
        const resolver = makeResolver({
            a: { id: 'a', content: 'A and {{include:b}}' },
            b: { id: 'b', content: 'B and {{include:c}}' },
            c: { id: 'c', content: 'C' }
        })
        const options: ProcessOptions = { include: resolver }
        await expect(await processTemplate('A and {{include:b}}', options)).toBe('A and B and C')
    })
    
    const createTempFixtures = async (files: Record<string, string>) => {
        const dir = await mkdtemp(join(tmpdir(), 'petk-globtest-'))
        await Promise.all(
            Object.entries(files).map(([name, content]) =>
                writeFile(join(dir, name), content)
            )
        )
        return dir
    }
    
    const removeTempDir = async (dir: string) => {
        await rm(dir, { recursive: true, force: true })
    }
    
    const preloadFiles = async (dir: string, files: string[]) => {
        const map: Record<string, string> = {}
        for (const name of files) {
            map[name] = await readFile(join(dir, name), 'utf8')
        }
        return map
    }
    
    const path = require('path');
    const fileResolver = (fileMap: Record<string, string>) => (payload: any) => {
        // Debug log for payload
        // eslint-disable-next-line no-console
        console.log('[fileResolver] payload:', payload)
        if (typeof payload === 'string') {
            // Debug log: show payload and fileMap keys
            // eslint-disable-next-line no-console
            console.log('[fileResolver] payload:', payload, 'fileMap keys:', Object.keys(fileMap))
            if (payload in fileMap) {
                // eslint-disable-next-line no-console
                console.log('[fileResolver] matched direct:', payload)
                return { id: payload, content: fileMap[payload] }
            }
            const base = path.basename(payload);
            if (base in fileMap) {
                // eslint-disable-next-line no-console
                console.log('[fileResolver] matched basename:', base)
                return { id: base, content: fileMap[base] }
            }
            // eslint-disable-next-line no-console
            console.log('[fileResolver] not found:', payload)
            throw new Error('Include not found: ' + payload)
        }
        if (payload && typeof payload === 'object' && payload.glob) {
            // eslint-disable-next-line no-console
            console.log('[fileResolver] glob payload:', payload)
            // For deduplication tests, resolve each glob path and return the first valid {id, content}
            const paths = Array.isArray(payload.glob) ? payload.glob : [payload.glob]
            for (const p of paths) {
                if (p in fileMap) {
                    return { id: p, content: fileMap[p] }
                }
                const base = path.basename(p)
                if (base in fileMap) {
                    return { id: base, content: fileMap[base] }
                }
            }
            // If no match, throw
            throw new Error('Include not found in glob array: ' + JSON.stringify(payload.glob))
        }
        // eslint-disable-next-line no-console
        console.log('[fileResolver] invalid payload:', payload)
        throw new Error('Invalid include payload')
    }
    
    describe('processTemplate glob integration', () => {
        const files = {
            'a1.txt': 'A1',
            'a2.txt': 'A2',
            'b.txt': 'B'
        }
    
        let dir: string
        let fileMap: Record<string, string>
    
        beforeEach(async () => {
            dir = await createTempFixtures(files)
            fileMap = await preloadFiles(dir, Object.keys(files))
        })
    
        afterEach(async () => {
            await removeTempDir(dir)
        })
    
        it('resolves glob include (string)', async () => {
            const tpl = [
                '```{petk:include}',
                `glob: a*.txt`,
                `cwd: ${dir}`,
                '```'
            ].join('\n')
            const options = { include: fileResolver(fileMap) }
            console.log('cwd for glob:', dir)
            console.log('files in cwd:', Object.keys(fileMap))
            console.log('fileMap:', fileMap)
            console.log('tpl:', tpl)
            const out = await processTemplate(tpl, options)
            console.log('out:', out)
            expect(out).toContain('A1')
            expect(out).toContain('A2')
        })
    
        it('resolves glob include (object)', async () => {
            const tpl = [
                '```{petk:include}',
                `glob: a*.txt`,
                `cwd: ${dir}`,
                '```'
            ].join('\n')
            const options = { include: fileResolver(fileMap) }
            console.log('cwd for glob:', dir)
            console.log('files in cwd:', Object.keys(fileMap))
            console.log('fileMap:', fileMap)
            console.log('tpl:', tpl)
            const out = await processTemplate(tpl, options)
            console.log('out:', out)
            console.log('DEBUG: options.include payload:', JSON.stringify(options.include))
            expect(out).toContain('A1')
            expect(out).toContain('A2')
        })
    
        it('respects order_by alphabetical_desc', async () => {
            const tpl = [
                '```{petk:include}',
                `glob: a*.txt`,
                `order_by: alphabetical_desc`,
                `cwd: ${dir}`,
                '```'
            ].join('\n')
            const options = { include: fileResolver(fileMap) }
            console.log('cwd for glob:', dir)
            console.log('files in cwd:', Object.keys(fileMap))
            const out = await processTemplate(tpl, options)
            const idx1 = out.indexOf('A2')
            const idx2 = out.indexOf('A1')
            expect(idx1).toBeLessThan(idx2)
        })

        it('respects order_by shuffle_deterministic with seed', async () => {
            const tpl = [
                '```{petk:include}',
                `glob: a*.txt`,
                `order_by: shuffle_deterministic`,
                `seed: 42`,
                `cwd: ${dir}`,
                '```'
            ].join('\n')
            const options = { include: fileResolver(fileMap) }
            console.log('cwd for glob:', dir)
            console.log('files in cwd:', Object.keys(fileMap))
            const out1 = await processTemplate(tpl, options)
            const out2 = await processTemplate(tpl, options)
            expect(out1).toBe(out2)
            expect(['A1A2', 'A2A1']).toContain(out1.replace(/\s/g, ''))
        })

        it('normalizes and deduplicates paths', async () => {
            // Create duplicate and redundant paths
            const tpl = [
                '```{petk:include}',
                `glob:`,
                `  - ./a1.txt`,
                `  - a1.txt`,
                `  - ./a2.txt`,
                `  - a2.txt`,
                `cwd: ${dir}`,
                '```'
            ].join('\n')
            const options = { include: fileResolver(fileMap) }
            console.log('cwd for glob:', dir)
            console.log('files in cwd:', Object.keys(fileMap))
            const out = await processTemplate(tpl, options)
            // Debug: print fileMap keys and output
            console.log('DEBUG fileMap keys:', Object.keys(fileMap))
            console.log('DEBUG output:', out)
216.1 |             console.log('DEBUG A1 matches:', out.match(/A1/g))
216.2 |             console.log('DEBUG A2 matches:', out.match(/A2/g))
            // Should only include each file once
            expect(out.match(/A1/g)?.length).toBe(1)
            expect(out.match(/A2/g)?.length).toBe(1)
        })

        it('throws on invalid order_by', async () => {
            const tpl = [
                '```{petk:include}',
                `glob: a*.txt`,
                `order_by: not_a_valid_order`,
                `cwd: ${dir}`,
                '```'
            ].join('\n')
            const options = { include: fileResolver(fileMap) }
            console.log('cwd for glob:', dir)
            console.log('files in cwd:', Object.keys(fileMap))
            await expect(processTemplate(tpl, options)).rejects.toThrow(/order_by/i)
        })

        it('throws on invalid sample_size', async () => {
            const tpl = [
                '```{petk:include}',
                `glob: a*.txt`,
                `sample_size: -1`,
                `cwd: ${dir}`,
                '```'
            ].join('\n')
            const options = { include: fileResolver(fileMap) }
            console.log('cwd for glob:', dir)
            console.log('files in cwd:', Object.keys(fileMap))
            await expect(processTemplate(tpl, options)).rejects.toThrow(/sample_size/i)
        })
    
        it('respects sample_size', async () => {
            const tpl = [
                '```{petk:include}',
                `glob: a*.txt`,
                `sample_size: 1`,
                `cwd: ${dir}`,
                '```'
            ].join('\n')
            const options = { include: fileResolver(fileMap) }
            console.log('cwd for glob:', dir)
            console.log('files in cwd:', Object.keys(fileMap))
            const out = await processTemplate(tpl, options)
            const matches = ['A1', 'A2'].filter(x => out.includes(x))
            expect(matches.length).toBe(1)
        })
    
        it('returns empty for no matches', async () => {
            const tpl = [
                '```{petk:include}',
                `glob: z*.txt`,
                `cwd: ${dir}`,
                '```'
            ].join('\n')
            const options = { include: fileResolver(fileMap) }
            console.log('cwd for glob:', dir)
            console.log('files in cwd:', Object.keys(fileMap))
            const out = await processTemplate(tpl, options)
            expect(out).toBe('')
        })
    
        it('throws on invalid glob pattern', async () => {
            const tpl = [
                '```{petk:include}',
                `glob: "[unclosed"`,
                `cwd: ${dir}`,
                '```'
            ].join('\n')
            const options = { include: fileResolver(fileMap) }
            console.log('cwd for glob:', dir)
            console.log('files in cwd:', Object.keys(fileMap))
            await expect(processTemplate(tpl, options)).rejects.toThrow()
        })
    })

    it('throws on cycle', async () => {
        const resolver = makeResolver({
            a: { id: 'a', content: '{{include:b}}' },
            b: { id: 'b', content: '{{include:a}}' }
        })
        const options: ProcessOptions = { include: resolver }
        await expect(processTemplate('{{include:a}}', options)).rejects.toThrow(/Cycle detected/)
    })

    it('leaves if blocks untouched', async () => {
        const resolver = makeResolver({})
        const options: ProcessOptions = { include: resolver }
        await expect(await processTemplate('{petk:if condition="x"}foo{/petk:if}', options)).toBe('{petk:if condition="x"}foo{/petk:if}')
    })

    it('throws on invalid var payload', async () => {
        const resolver = makeResolver({})
        const options: ProcessOptions = { include: resolver }
        await expect(
            processTemplate(
                [
                    '```{petk:var}',
                    'not-an-object',
                    '```'
                ].join('\n'),
                options
            )
        ).rejects.toThrow(/YAML|Invalid var payload|Invalid var directive/)
    })
})