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
    
    const fileResolver = (fileMap: Record<string, string>) => (payload: any) => {
        if (typeof payload === 'string') {
            if (!(payload in fileMap)) throw new Error('Include not found: ' + payload)
            return { id: payload, content: fileMap[payload] }
        }
        if (payload && typeof payload === 'object' && payload.glob) {
            // Let processTemplate handle glob logic via processGlobPattern
            return payload
        }
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
            const tpl = '{{include:"a*.txt"}}'
            const options = { include: fileResolver(fileMap) }
            const out = await processTemplate(tpl, options)
            expect(out).toContain('A1')
            expect(out).toContain('A2')
        })
    
        it('resolves glob include (object)', async () => {
            const tpl = '{{include:{"glob":"a*.txt"}}}'
            const options = { include: fileResolver(fileMap) }
            const out = await processTemplate(tpl, options)
            expect(out).toContain('A1')
            expect(out).toContain('A2')
        })
    
        it('respects order_by alphabetical_desc', async () => {
            const tpl = '{{include:{"glob":"a*.txt","order_by":"alphabetical_desc"}}}'
            const options = { include: fileResolver(fileMap) }
            const out = await processTemplate(tpl, options)
            const idx1 = out.indexOf('A2')
            const idx2 = out.indexOf('A1')
            expect(idx1).toBeLessThan(idx2)
        })

        it('respects order_by shuffle_deterministic with seed', async () => {
            const tpl = '{{include:{"glob":"a*.txt","order_by":"shuffle_deterministic","seed":42}}}'
            const options = { include: fileResolver(fileMap) }
            const out1 = await processTemplate(tpl, options)
            const out2 = await processTemplate(tpl, options)
            expect(out1).toBe(out2)
            expect(['A1A2', 'A2A1']).toContain(out1.replace(/\s/g, ''))
        })

        it('normalizes and deduplicates paths', async () => {
            // Create duplicate and redundant paths
            const tpl = '{{include:{"glob":["./a1.txt","a1.txt","./a2.txt","a2.txt"]}}}'
            const options = { include: fileResolver(fileMap) }
            const out = await processTemplate(tpl, options)
            // Should only include each file once
            expect(out.match(/A1/g)?.length).toBe(1)
            expect(out.match(/A2/g)?.length).toBe(1)
        })

        it('throws on invalid order_by', async () => {
            const tpl = '{{include:{"glob":"a*.txt","order_by":"not_a_valid_order"}}}'
            const options = { include: fileResolver(fileMap) }
            await expect(processTemplate(tpl, options)).rejects.toThrow(/order_by/i)
        })

        it('throws on invalid sample_size', async () => {
            const tpl = '{{include:{"glob":"a*.txt","sample_size":-1}}}'
            const options = { include: fileResolver(fileMap) }
            await expect(processTemplate(tpl, options)).rejects.toThrow(/sample_size/i)
        })
    
        it('respects sample_size', async () => {
            const tpl = '{{include:{"glob":"a*.txt","sample_size":1}}}'
            const options = { include: fileResolver(fileMap) }
            const out = await processTemplate(tpl, options)
            const matches = ['A1', 'A2'].filter(x => out.includes(x))
            expect(matches.length).toBe(1)
        })
    
        it('returns empty for no matches', async () => {
            const tpl = '{{include:"z*.txt"}}'
            const options = { include: fileResolver(fileMap) }
            const out = await processTemplate(tpl, options)
            expect(out).toBe('')
        })
    
        it('throws on invalid glob pattern', async () => {
            const tpl = '{{include:{"glob":"[unclosed"}}}'
            const options = { include: fileResolver(fileMap) }
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