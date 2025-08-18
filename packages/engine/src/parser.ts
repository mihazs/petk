import type { Directive } from './types';
import { findDirectiveBlocks } from './block-extractor';
import { parseDirective } from './parse-directive';

function convertLineRangeToCharRange(input: string, lineStart: number, lineEnd: number): { start: number; end: number } {
    const lines = input.split(/\r?\n/);
    let charStart = 0;
    
    // Calculate character position at start of lineStart
    for (let i = 0; i < lineStart; i++) {
        charStart += lines[i].length + 1; // +1 for newline
    }
    
    // Calculate character position at end of lineEnd (including the newline)
    let charEnd = charStart;
    for (let i = lineStart; i <= lineEnd; i++) {
        charEnd += lines[i].length + (i < lines.length - 1 ? 1 : 0); // +1 for newline except last line
    }
    
    return { start: charStart, end: charEnd };
}

export function parseAll(input: string): Directive[] {
    const blocks = findDirectiveBlocks(input).map(block => {
        const directive = parseDirective(block.yaml, block.type);
        const charRange = convertLineRangeToCharRange(input, block.start, block.end);
        return {
            ...directive,
            range: { start: charRange.start, end: charRange.end },
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