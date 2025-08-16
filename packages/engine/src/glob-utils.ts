import { glob } from 'glob';

type OrderBy = 'alphabetical_asc' | 'alphabetical_desc' | 'last_updated_asc' | 'last_updated_desc' | undefined;

export type GlobOptions = {
    order_by?: OrderBy;
    sample_size?: number;
    shuffle?: boolean;
    cwd?: string;
    dot?: boolean;
};

const compareAlphabeticalAsc = (a: string, b: string) => a.localeCompare(b);
const compareAlphabeticalDesc = (a: string, b: string) => b.localeCompare(a);

const compareLastUpdatedAsc = (a: string, b: string) => 0;
const compareLastUpdatedDesc = (a: string, b: string) => 0;

const getFileStats = async (paths: string[], cwd?: string) => {
    const { stat } = await import('fs/promises');
    return Promise.all(
        paths.map(async (p) => {
            const fullPath = cwd ? require('path').join(cwd, p) : p;
            const stats = await stat(fullPath);
            return { path: p, mtime: stats.mtimeMs };
        })
    );
};

const shuffleArray = <T>(arr: readonly T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

export const processGlobPattern = async (
    pattern: string,
    options: GlobOptions = {}
): Promise<string[]> => {
    const { order_by, sample_size, shuffle: doShuffle, cwd, dot } = options;
    const matches = await glob(pattern, { cwd, dot });

    let result: string[] = matches;

    if (order_by === 'alphabetical_asc') {
        result = [...result].sort(compareAlphabeticalAsc);
    } else if (order_by === 'alphabetical_desc') {
        result = [...result].sort(compareAlphabeticalDesc);
    } else if (order_by === 'last_updated_asc' || order_by === 'last_updated_desc') {
        const stats = await getFileStats(result, cwd);
        result = [...stats]
            .sort((a, b) =>
                order_by === 'last_updated_asc'
                    ? a.mtime - b.mtime
                    : b.mtime - a.mtime
            )
            .map((s) => s.path);
    }

    if (doShuffle) {
        result = shuffleArray(result);
    }

    if (typeof sample_size === 'number' && sample_size > 0) {
        result = result.slice(0, sample_size);
    }

    return result;
};