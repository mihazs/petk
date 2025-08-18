export interface GlobalOptions {
    config?: string;
    watch?: boolean;
    vars?: Record<string, string>;
    rag?: string;
}

export interface BuildOptions extends GlobalOptions {
    output?: string;
    optimize?: boolean;
}

export interface ConvertOptions extends GlobalOptions {
    output?: string;
    format?: 'yaml' | 'json';
    eval?: boolean;
}

export interface ValidateOptions extends GlobalOptions {
    redteam?: boolean;
}

export interface OptimizeOptions extends GlobalOptions {
    output?: string;
    model?: string;
    iterations?: number;
}

export interface CommandContext {
    options: GlobalOptions;
    args: string[];
}