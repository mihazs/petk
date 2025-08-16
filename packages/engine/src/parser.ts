import type { Directive } from './types';
import { findDirectiveBlocks } from './block-extractor';
import { parseDirective } from './parse-directive';

export function parseAll(input: string): Directive[] {
    const blocks = findDirectiveBlocks(input).map(block => {
        const directive = parseDirective(block.yaml, block.type);
        return {
            ...directive,
            range: { start: block.start, end: block.end },
            raw: block.raw,
        };
    });

    // Add support for short-form directives: {{include:id}} and {{var:key}}
    const shortForm: Directive[] = [];
    const regex = /\{\{(include|var):([^\}]+)\}\}/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(input))) {
        const [raw, type, value] = match;
        if (type === 'include') {
            shortForm.push({
                type: 'include',
                payload: value,
                path: value,
                range: { start: match.index, end: match.index + raw.length },
                raw,
            } as unknown as Directive);
        } else if (type === 'var') {
            // For short-form var, treat as a var directive with a single key and empty string value
            shortForm.push({
                type: 'var',
                payload: { [value]: '' },
                name: value,
                value: '',
                range: { start: match.index, end: match.index + raw.length },
                raw,
            } as unknown as Directive);
        }
    }

    // TypeScript: downstream expects .range on all directives, so cast to any for sort
    return ([...blocks, ...shortForm] as any[]).sort((a, b) => a.range.start - b.range.start);
}