import chokidar, { FSWatcher } from 'chokidar';
import { WatchConfig } from '../config/config-types.js';

export interface WatchOptions {
    patterns: string[];
    ignored?: string[];
    debounceMs?: number;
    recursive?: boolean;
    followSymlinks?: boolean;
    cwd?: string;
}

export interface WatchEvent {
    type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
    path: string;
    stats?: any;
}

export interface WatchHandler {
    start: () => Promise<void>;
    stop: () => Promise<void>;
    isWatching: () => boolean;
    getWatchedPaths: () => string[];
}

export type WatchCallback = (event: WatchEvent) => void | Promise<void>;
export type ErrorCallback = (error: Error) => void;

const DEFAULT_WATCH_OPTIONS: Required<Omit<WatchOptions, 'patterns' | 'cwd'>> = {
    ignored: ['node_modules/**', '.git/**', 'dist/**', '.petk/cache/**'],
    debounceMs: 300,
    recursive: true,
    followSymlinks: false
};

const createDebouncer = (callback: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    return (...args: any[]) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(() => {
            callback(...args);
            timeoutId = null;
        }, delay);
    };
};

const normalizePatterns = (patterns: string[]): string[] => {
    return patterns.filter(pattern => pattern && pattern.trim().length > 0);
};

const createChokidarOptions = (options: WatchOptions) => {
    return {
        ignored: options.ignored,
        persistent: true,
        ignoreInitial: true,
        followSymlinks: options.followSymlinks,
        cwd: options.cwd,
        depth: options.recursive ? undefined : 1,
        awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 50
        },
        atomic: true
    };
};

const mapChokidarEvent = (event: string, path: string, stats?: any): WatchEvent => ({
    type: event as WatchEvent['type'],
    path,
    stats
});

const validateWatchOptions = (options: WatchOptions): string[] => {
    const errors: string[] = [];
    
    if (!options.patterns || options.patterns.length === 0) {
        errors.push('At least one watch pattern is required');
    }
    
    if (options.debounceMs && (options.debounceMs < 0 || options.debounceMs > 10000)) {
        errors.push('Debounce delay must be between 0 and 10000 milliseconds');
    }
    
    return errors;
};

const createWatchState = () => ({
    watcher: null as FSWatcher | null,
    isWatching: false,
    watchedPaths: [] as string[]
});

export const createWatchHandler = (
    options: WatchOptions,
    callback: WatchCallback,
    errorCallback?: ErrorCallback
): WatchHandler => {
    const validationErrors = validateWatchOptions(options);
    if (validationErrors.length > 0) {
        throw new Error(`Invalid watch options: ${validationErrors.join('; ')}`);
    }
    
    const mergedOptions = { ...DEFAULT_WATCH_OPTIONS, ...options };
    const normalizedPatterns = normalizePatterns(mergedOptions.patterns);
    const debouncedCallback = createDebouncer(callback, mergedOptions.debounceMs);
    const state = createWatchState();
    
    const handleWatchEvent = (event: string) => (path: string, stats?: any) => {
        const watchEvent = mapChokidarEvent(event, path, stats);
        debouncedCallback(watchEvent);
    };
    
    const handleError = (err: unknown) => {
        const error = err instanceof Error ? err : new Error(`Watch error: ${String(err)}`);
        if (errorCallback) {
            errorCallback(error);
        } else {
            console.error('Watch error:', error);
        }
    };
    
    const start = async (): Promise<void> => {
        if (state.isWatching) {
            return;
        }
        
        try {
            const chokidarOptions = createChokidarOptions(mergedOptions);
            state.watcher = chokidar.watch(normalizedPatterns, chokidarOptions);
            
            state.watcher
                .on('add', handleWatchEvent('add'))
                .on('change', handleWatchEvent('change'))
                .on('unlink', handleWatchEvent('unlink'))
                .on('addDir', handleWatchEvent('addDir'))
                .on('unlinkDir', handleWatchEvent('unlinkDir'))
                .on('error', handleError);
            
            await new Promise<void>((resolve, reject) => {
                state.watcher!.on('ready', () => {
                    state.watchedPaths = state.watcher!.getWatched() 
                        ? Object.keys(state.watcher!.getWatched()).reduce((acc, dir) => {
                            const files = state.watcher!.getWatched()[dir];
                            return acc.concat(files.map(file => `${dir}/${file}`));
                        }, [] as string[])
                        : [];
                    
                    state.isWatching = true;
                    resolve();
                });
                
                state.watcher!.on('error', reject);
            });
            
        } catch (error) {
            state.isWatching = false;
            throw new Error(`Failed to start file watching: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };
    
    const stop = async (): Promise<void> => {
        if (!state.isWatching || !state.watcher) {
            return;
        }
        
        try {
            await state.watcher.close();
            state.watcher = null;
            state.isWatching = false;
            state.watchedPaths = [];
        } catch (error) {
            throw new Error(`Failed to stop file watching: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };
    
    const isWatching = (): boolean => state.isWatching;
    
    const getWatchedPaths = (): string[] => [...state.watchedPaths];
    
    return {
        start,
        stop,
        isWatching,
        getWatchedPaths
    };
};

export const createWatchHandlerFromConfig = (
    watchConfig: WatchConfig,
    cwd: string,
    callback: WatchCallback,
    errorCallback?: ErrorCallback
): WatchHandler => {
    const options: WatchOptions = {
        patterns: watchConfig.patterns || ['**/*.md', '**/*.yaml', '**/*.yml'],
        ignored: watchConfig.ignored,
        debounceMs: watchConfig.debounceMs,
        recursive: watchConfig.recursive,
        followSymlinks: watchConfig.followSymlinks,
        cwd
    };
    
    return createWatchHandler(options, callback, errorCallback);
};

export const formatWatchEvent = (event: WatchEvent): string => {
    const eventName = {
        add: 'Added',
        change: 'Changed',
        unlink: 'Deleted',
        addDir: 'Directory added',
        unlinkDir: 'Directory deleted'
    }[event.type];
    
    return `${eventName}: ${event.path}`;
};

export const isWatchableFile = (filePath: string, patterns: string[]): boolean => {
    return patterns.some(pattern => {
        // Handle brace expansion first (e.g., {ts,js} -> (ts|js))
        let regexPattern = pattern.replace(/\{([^}]+)\}/g, (match, content) => {
            return `(${content.split(',').join('|')})`;
        });
        
        // Escape special regex characters except our glob patterns
        regexPattern = regexPattern
            .replace(/[.+^$()|[\]\\]/g, '\\$&')
            .replace(/\*\*\//g, '___DOUBLESTAR_SLASH___')
            .replace(/\*\*/g, '___DOUBLESTAR___')
            .replace(/\*/g, '[^/]*')
            .replace(/\?/g, '[^/]')
            .replace(/___DOUBLESTAR_SLASH___/g, '(?:.*/)?')
            .replace(/___DOUBLESTAR___/g, '.*');
        
        return new RegExp(`^${regexPattern}$`).test(filePath);
    });
};