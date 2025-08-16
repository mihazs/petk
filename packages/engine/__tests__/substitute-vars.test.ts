import { describe, it, expect } from 'vitest'
import { substituteVars, Vars } from '../src/substitute-vars'

describe('substituteVars', () => {
    it('replaces known placeholders with string values', () => {
        const vars: Vars = { foo: 'bar', num: 42 }
        expect(substituteVars('Hello {{foo}} {{num}}!', vars)).toBe('Hello bar 42!')
    })

    it('leaves unknown placeholders unchanged', () => {
        const vars: Vars = { foo: 'bar' }
        expect(substituteVars('Hello {{foo}} {{unknown}}!', vars)).toBe('Hello bar {{unknown}}!')
    })

    it('handles boolean values', () => {
        const vars: Vars = { yes: true, no: false }
        expect(substituteVars('Yes: {{yes}}, No: {{no}}', vars)).toBe('Yes: true, No: false')
    })

    it('returns input unchanged if no vars provided', () => {
        expect(substituteVars('Nothing here', {})).toBe('Nothing here')
    })

    it('returns input unchanged if input is empty', () => {
        expect(substituteVars('', { foo: 'bar' })).toBe('')
    })

    it('does not replace nested or malformed placeholders', () => {
        const vars: Vars = { foo: 'bar' }
        expect(substituteVars('Bad {{ foo }} and {{{foo}}}', vars)).toBe('Bad {{ foo }} and {{{foo}}}')
    })
})