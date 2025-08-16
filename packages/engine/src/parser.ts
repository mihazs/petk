import type { Directive } from './types';
import { findDirectiveBlocks } from './block-extractor';
import { parseDirective } from './parse-directive';

export function parseAll(input: string): Directive[] {
    const blocks = findDirectiveBlocks(input);
    return blocks.map(block => {
        const directive = parseDirective(block.yaml, block.type);
        return {
            ...directive,
            range: { start: block.start, end: block.end },
            raw: block.raw,
        };
    });
}