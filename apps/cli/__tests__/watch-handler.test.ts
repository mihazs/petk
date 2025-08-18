import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { WatchOptions } from '../src/utils/watch-handler';

// Mock chokidar at the top level
const mockWatcher = {
    on: vi.fn(),
    close: vi.fn(),
    getWatched: vi.fn()
};

const mockChokidar = {
    watch: vi.fn().mockReturnValue(mockWatcher)
};

vi.mock('chokidar', () => ({
    default: mockChokidar,
    watch: mockChokidar.watch
}));

// Import after mocking
const { 
    createWatchHandler, 
    createWatchHandlerFromConfig, 
    formatWatchEvent, 
    isWatchableFile 
} = await import('../src/utils/watch-handler');

describe('watch-handler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        
        // Setup default mock behavior
        mockWatcher.on.mockReturnValue(mockWatcher);
        mockWatcher.close.mockResolvedValue(undefined);
        mockWatcher.getWatched.mockReturnValue({});
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('createWatchHandler', () => {
        describe('validation', () => {
            it('should throw error when patterns array is empty', () => {
                // Arrange
                const options: WatchOptions = { patterns: [] };
                const callback = vi.fn();

                // Act & Assert
                expect(() => createWatchHandler(options, callback))
                    .toThrow('Invalid watch options: At least one watch pattern is required');
            });

            it('should throw error when patterns is undefined', () => {
                // Arrange
                const options: WatchOptions = { patterns: undefined as any };
                const callback = vi.fn();

                // Act & Assert
                expect(() => createWatchHandler(options, callback))
                    .toThrow('Invalid watch options: At least one watch pattern is required');
            });

            it('should throw error when debounceMs is negative', () => {
                // Arrange
                const options: WatchOptions = { patterns: ['*.md'], debounceMs: -1 };
                const callback = vi.fn();

                // Act & Assert
                expect(() => createWatchHandler(options, callback))
                    .toThrow('Invalid watch options: Debounce delay must be between 0 and 10000 milliseconds');
            });

            it('should throw error when debounceMs exceeds maximum', () => {
                // Arrange
                const options: WatchOptions = { patterns: ['*.md'], debounceMs: 15000 };
                const callback = vi.fn();

                // Act & Assert
                expect(() => createWatchHandler(options, callback))
                    .toThrow('Invalid watch options: Debounce delay must be between 0 and 10000 milliseconds');
            });

            it('should accept valid debounceMs values', () => {
                // Arrange
                const options: WatchOptions = { patterns: ['*.md'], debounceMs: 100 };
                const callback = vi.fn();

                // Act & Assert
                expect(() => createWatchHandler(options, callback)).not.toThrow();
            });
        });

        describe('initialization', () => {
            it('should create watch handler with default options', () => {
                // Arrange
                const options: WatchOptions = { patterns: ['*.md'] };
                const callback = vi.fn();

                // Act
                const handler = createWatchHandler(options, callback);

                // Assert
                expect(handler).toBeDefined();
                expect(handler.start).toBeDefined();
                expect(handler.stop).toBeDefined();
                expect(handler.getWatchedPaths).toBeDefined();
            });

            it('should merge custom options with defaults', () => {
                // Arrange
                const options: WatchOptions = {
                    patterns: ['*.md'],
                    debounceMs: 500,
                    recursive: false
                };
                const callback = vi.fn();

                // Act
                const handler = createWatchHandler(options, callback);

                // Assert
                expect(handler).toBeDefined();
            });

            it('should filter out empty patterns', () => {
                // Arrange
                const options: WatchOptions = { patterns: ['*.md', '', '*.txt'] };
                const callback = vi.fn();

                // Act
                const handler = createWatchHandler(options, callback);

                // Assert
                expect(handler).toBeDefined();
            });
        });

        describe('watch lifecycle', () => {
            it('should start watching successfully', async () => {
                // Arrange
                const options: WatchOptions = { patterns: ['*.md'] };
                const callback = vi.fn();
                const handler = createWatchHandler(options, callback);

                // Mock the 'ready' event to resolve immediately
                mockWatcher.on.mockImplementation((event: string, listener: Function) => {
                    if (event === 'ready') {
                        setTimeout(() => listener(), 0);
                    }
                    return mockWatcher;
                });

                // Act
                const startPromise = handler.start();
                vi.runAllTimers();
                await startPromise;

                // Assert
                expect(mockChokidar.watch).toHaveBeenCalled();
                expect(mockWatcher.on).toHaveBeenCalledWith('ready', expect.any(Function));
            });

            it('should handle start error', async () => {
                // Arrange
                const options: WatchOptions = { patterns: ['*.md'] };
                const callback = vi.fn();
                const handler = createWatchHandler(options, callback);

                mockWatcher.on.mockImplementation((event: string, listener: Function) => {
                    if (event === 'error') {
                        setTimeout(() => listener(new Error('Watch error')), 0);
                    }
                    return mockWatcher;
                });

                // Act & Assert
                const startPromise = handler.start();
                vi.runAllTimers();
                await expect(startPromise).rejects.toThrow('Watch error');
            });

            it('should stop watching successfully', async () => {
                // Arrange
                const options: WatchOptions = { patterns: ['*.md'] };
                const callback = vi.fn();
                const handler = createWatchHandler(options, callback);

                // Start watching first to set up the watcher
                mockWatcher.on.mockImplementation((event: string, listener: Function) => {
                    if (event === 'ready') {
                        setTimeout(() => listener(), 0);
                    }
                    return mockWatcher;
                });

                const startPromise = handler.start();
                vi.runAllTimers();
                await startPromise;

                // Act
                await handler.stop();

                // Assert
                expect(mockWatcher.close).toHaveBeenCalled();
            });

            it('should handle stop when not watching', async () => {
                // Arrange
                const options: WatchOptions = { patterns: ['*.md'] };
                const callback = vi.fn();
                const handler = createWatchHandler(options, callback);

                // Act & Assert
                await expect(handler.stop()).resolves.not.toThrow();
            });

            it('should return watched paths', async () => {
                // Arrange
                const options: WatchOptions = { patterns: ['*.md'] };
                const callback = vi.fn();
                const handler = createWatchHandler(options, callback);

                mockWatcher.on.mockImplementation((event: string, listener: Function) => {
                    if (event === 'ready') {
                        setTimeout(() => listener(), 0);
                    }
                    return mockWatcher;
                });

                mockWatcher.getWatched.mockReturnValue({
                    '/path': ['file1.md', 'file2.md']
                });

                // Start watching to populate watched paths
                const startPromise = handler.start();
                vi.runAllTimers();
                await startPromise;

                // Act
                const paths = handler.getWatchedPaths();

                // Assert
                expect(paths).toEqual(['/path/file1.md', '/path/file2.md']);
            });
        });

        describe('event handling - basic functionality', () => {
            it('should setup event listeners', async () => {
                // Arrange
                const options: WatchOptions = { patterns: ['*.md'] };
                const callback = vi.fn();
                const handler = createWatchHandler(options, callback);

                mockWatcher.on.mockImplementation((event: string, listener: Function) => {
                    if (event === 'ready') {
                        setTimeout(() => listener(), 0);
                    }
                    return mockWatcher;
                });

                // Act
                const startPromise = handler.start();
                vi.runAllTimers();
                await startPromise;

                // Assert
                expect(mockWatcher.on).toHaveBeenCalledWith('add', expect.any(Function));
                expect(mockWatcher.on).toHaveBeenCalledWith('change', expect.any(Function));
                expect(mockWatcher.on).toHaveBeenCalledWith('unlink', expect.any(Function));
                expect(mockWatcher.on).toHaveBeenCalledWith('addDir', expect.any(Function));
                expect(mockWatcher.on).toHaveBeenCalledWith('unlinkDir', expect.any(Function));
                expect(mockWatcher.on).toHaveBeenCalledWith('error', expect.any(Function));
            });
        });
    });

    describe('createWatchHandlerFromConfig', () => {
        it('should create handler from config with default patterns', () => {
            // Arrange
            const config = { patterns: ['*.md'] };
            const cwd = '/test/path';
            const callback = vi.fn();

            // Act
            const handler = createWatchHandlerFromConfig(config, cwd, callback);

            // Assert
            expect(handler).toBeDefined();
        });

        it('should create handler from config with custom options', () => {
            // Arrange
            const config = {
                patterns: ['*.md'],
                debounceMs: 200
            };
            const cwd = '/test/path';
            const callback = vi.fn();

            // Act
            const handler = createWatchHandlerFromConfig(config, cwd, callback);

            // Assert
            expect(handler).toBeDefined();
        });

        it('should use default patterns when config patterns is undefined', () => {
            // Arrange
            const config = {};
            const cwd = '/test/path';
            const callback = vi.fn();

            // Act
            const handler = createWatchHandlerFromConfig(config, cwd, callback);

            // Assert
            expect(handler).toBeDefined();
        });
    });

    describe('formatWatchEvent', () => {
        it('should format add event', () => {
            // Arrange
            const event = { type: 'add' as const, path: '/path/to/file.md' };

            // Act
            const result = formatWatchEvent(event);

            // Assert
            expect(result).toBe('Added: /path/to/file.md');
        });

        it('should format change event', () => {
            // Arrange
            const event = { type: 'change' as const, path: '/path/to/file.md' };

            // Act
            const result = formatWatchEvent(event);

            // Assert
            expect(result).toBe('Changed: /path/to/file.md');
        });

        it('should format unlink event', () => {
            // Arrange
            const event = { type: 'unlink' as const, path: '/path/to/file.md' };

            // Act
            const result = formatWatchEvent(event);

            // Assert
            expect(result).toBe('Deleted: /path/to/file.md');
        });

        it('should format addDir event', () => {
            // Arrange
            const event = { type: 'addDir' as const, path: '/path/to/dir' };

            // Act
            const result = formatWatchEvent(event);

            // Assert
            expect(result).toBe('Directory added: /path/to/dir');
        });

        it('should format unlinkDir event', () => {
            // Arrange
            const event = { type: 'unlinkDir' as const, path: '/path/to/dir' };

            // Act
            const result = formatWatchEvent(event);

            // Assert
            expect(result).toBe('Directory deleted: /path/to/dir');
        });
    });

    describe('isWatchableFile', () => {
        it('should match simple wildcard patterns', () => {
            // Arrange
            const patterns = ['*.md'];

            // Act & Assert
            expect(isWatchableFile('test.md', patterns)).toBe(true);
            expect(isWatchableFile('test.txt', patterns)).toBe(false);
        });

        it('should match glob patterns with double asterisk', () => {
            // Arrange
            const patterns = ['**/*.md'];

            // Act & Assert
            expect(isWatchableFile('test.md', patterns)).toBe(true);
            expect(isWatchableFile('subfolder/test.md', patterns)).toBe(true);
            expect(isWatchableFile('deep/nested/folder/test.md', patterns)).toBe(true);
            expect(isWatchableFile('test.txt', patterns)).toBe(false);
        });

        it('should match question mark patterns', () => {
            // Arrange
            const patterns = ['test?.md'];

            // Act & Assert
            expect(isWatchableFile('test1.md', patterns)).toBe(true);
            expect(isWatchableFile('testa.md', patterns)).toBe(true);
            expect(isWatchableFile('test.md', patterns)).toBe(false);
            expect(isWatchableFile('test12.md', patterns)).toBe(false);
        });

        it('should match multiple patterns', () => {
            // Arrange
            const patterns = ['*.md', '*.txt'];

            // Act & Assert
            expect(isWatchableFile('test.md', patterns)).toBe(true);
            expect(isWatchableFile('test.txt', patterns)).toBe(true);
            expect(isWatchableFile('test.js', patterns)).toBe(false);
        });

        it('should handle complex patterns', () => {
            // Arrange
            const patterns = ['src/**/*.ts', 'src/**/*.js'];

            // Act & Assert
            expect(isWatchableFile('src/index.ts', patterns)).toBe(true);
            expect(isWatchableFile('src/utils/helper.js', patterns)).toBe(true);
            expect(isWatchableFile('src/components/Button.tsx', patterns)).toBe(false);
        });

        it('should return false when no patterns match', () => {
            // Arrange
            const patterns = ['*.md'];

            // Act & Assert
            expect(isWatchableFile('test.txt', patterns)).toBe(false);
        });

        it('should handle empty patterns array', () => {
            // Arrange
            const patterns: string[] = [];

            // Act & Assert
            expect(isWatchableFile('test.md', patterns)).toBe(false);
        });
    });

    describe('edge cases and error scenarios', () => {
        it('should handle multiple validation errors', () => {
            // Arrange
            const options: WatchOptions = { patterns: [], debounceMs: -1 };
            const callback = vi.fn();

            // Act & Assert
            expect(() => createWatchHandler(options, callback))
                .toThrow('Invalid watch options: At least one watch pattern is required');
        });

        it('should handle empty watched files object', () => {
            // Arrange
            const options: WatchOptions = { patterns: ['*.md'] };
            const callback = vi.fn();
            const handler = createWatchHandler(options, callback);

            mockWatcher.getWatched.mockReturnValue({});

            // Act
            const paths = handler.getWatchedPaths();

            // Assert
            expect(paths).toEqual([]);
        });

        it('should handle null/undefined getWatched result', () => {
            // Arrange
            const options: WatchOptions = { patterns: ['*.md'] };
            const callback = vi.fn();
            const handler = createWatchHandler(options, callback);

            mockWatcher.getWatched.mockReturnValue(null);

            // Act
            const paths = handler.getWatchedPaths();

            // Assert
            expect(paths).toEqual([]);
        });
    });
});