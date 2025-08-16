import type { DirectiveType } from './types';

const DIRECTIVE_INFOS = [
    '{petk:include}',
    '{petk:var}',
    '{petk:if}',
] as const;

const INFO_TO_TYPE: Record<string, DirectiveType> = {
    '{petk:include}': 'include',
    '{petk:var}': 'var',
    '{petk:if}': 'if',
};

type Block = {
    type: DirectiveType;
    yaml: string;
    start: number;
    end: number;
    raw: string;
};

export function findDirectiveBlocks(input: string): Block[] {
    const lines = input.split(/\r?\n/);
    const blocks: Block[] = [];
    let inFence = false;
    let fenceInfo = '';
    let type: DirectiveType | null = null;
    let start = 0;
    let rawLines: string[] = [];
    let yamlLines: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!inFence) {
            for (const info of DIRECTIVE_INFOS) {
                if (line.trim() === '```' + info) {
                    inFence = true;
                    fenceInfo = info;
                    type = INFO_TO_TYPE[info];
                    start = i;
                    rawLines = [line];
                    yamlLines = [];
                    break;
                }
            }
        } else {
            if (line.trim() === '```') {
                inFence = false;
                rawLines.push(line);
                blocks.push({
                    type: type!,
                    yaml: yamlLines.join('\n'),
                    start,
                    end: i,
                    raw: rawLines.join('\n'),
                });
                fenceInfo = '';
                type = null;
                start = 0;
                rawLines = [];
                yamlLines = [];
            } else {
                rawLines.push(line);
                yamlLines.push(line);
            }
        }
    }
    if (inFence) {
        throw new Error(
            `Unclosed directive fence starting at line ${start + 1} (${fenceInfo})`
        );
    }
    return blocks;
}