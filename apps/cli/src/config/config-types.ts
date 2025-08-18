export interface RagSourceConfig {
    type: 'file' | 'directory' | 'url' | 'database';
    path?: string;
    url?: string;
    connection?: string;
    recursive?: boolean;
    filePattern?: string;
    excludePattern?: string[];
}

export interface LlmConfig {
    provider: 'openai' | 'anthropic' | 'local' | 'azure';
    model: string;
    apiKey?: string;
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
}

export interface TemplateConfig {
    inputDir?: string;
    outputDir?: string;
    defaultExtension?: string;
    preserveStructure?: boolean;
    optimization?: {
        enabled: boolean;
        level: 'basic' | 'advanced' | 'aggressive';
        preserveComments?: boolean;
    };
}

export interface WatchConfig {
    enabled?: boolean;
    patterns?: string[];
    ignored?: string[];
    debounceMs?: number;
    recursive?: boolean;
    followSymlinks?: boolean;
}

export interface PetkConfig {
    version?: string;
    variables?: Record<string, string>;
    ragSources?: RagSourceConfig[];
    llm?: LlmConfig;
    template?: TemplateConfig;
    watch?: WatchConfig;
    logging?: {
        level: 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'verbose';
        format: 'json' | 'pretty';
        file?: string;
    };
    cache?: {
        enabled: boolean;
        directory: string;
        maxSize?: number;
        ttl?: number;
    };
}

export interface LoadedConfig {
    config: PetkConfig;
    configPath: string;
    loaded: boolean;
    source: 'file' | 'default' | 'merged';
}

export interface ConfigLoadOptions {
    configPath?: string;
    overrideVars?: Record<string, string>;
    validate?: boolean;
    createIfMissing?: boolean;
}

export interface ConfigValidationError {
    path: string;
    message: string;
    value?: unknown;
}

export interface ConfigLoadResult {
    success: boolean;
    config?: LoadedConfig;
    errors?: ConfigValidationError[];
    warnings?: string[];
}

export const DEFAULT_CONFIG: PetkConfig = {
    version: '1.0',
    variables: {},
    template: {
        defaultExtension: 'md',
        preserveStructure: true,
        optimization: {
            enabled: false,
            level: 'basic',
            preserveComments: true
        }
    },
    watch: {
        enabled: false,
        patterns: ['**/*.md', '**/*.yaml', '**/*.yml'],
        ignored: ['node_modules/**', '.git/**', 'dist/**'],
        debounceMs: 300,
        recursive: true,
        followSymlinks: false
    },
    logging: {
        level: 'info',
        format: 'pretty'
    },
    cache: {
        enabled: true,
        directory: '.petk/cache'
    }
};

export const CONFIG_SCHEMA_VERSION = '1.0';